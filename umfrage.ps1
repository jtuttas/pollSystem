<#
.Synopsis
    Importieren von Fragen in die Mongo DB Datenbank
.DESCRIPTION
    Importiert fragen aus einer ExelTabelle in die Datenbank, es müssen die Module
    Import-Excel und Mdbc importiert sein. Dieses geschieht über Import-Module Import-Excel bzw. über
    Import-Module Mdbc.

    Wird kein Parameter für QuestionID vergeben, so werden die IDs Q1....Qn verwendet!
.EXAMPLE
    Import-Excel c:\Temp\fragen.xlsx | Import-Question -mongoDB mongodb://localhost:27017/ -Databasename umfrage -CollectionName fragen
    Importiert die Fragen aus fragen.xslx in die entsprechende Collection
.EXAMPLE
    Import-Question -QuestionID Frage1 -Question "Eine Frage?" -mongoDB mongodb://localhost:27017/ -Databasename umfrage -CollectionName fragen
    Die Frage wird mit der QuestionID in der Collection angelegt
.EXAMPLE
    Import-Question  -Question "Eine Frage?" -mongoDB mongodb://localhost:27017/ -Databasename umfrage -CollectionName fragen
    Die Frage wird mit der QuestionID Q1 in der Collection angelegt
.EXAMPLE
    "Frage1","Frage2" | Import-Question -mongoDB mongodb://localhost:27017/ -Databasename umfrage -CollectionName fragen
    Die Fragen 1 und 2 werden mit der QuestionID Q1 und Q2 in der Collection angelegt
#>
function Import-Question {
    [CmdletBinding()]
    param (
        # Die Frage
        [Parameter(Mandatory = $true,
            ValueFromPipelineByPropertyName = $true,
            ValueFromPipeline = $true,
            Position = 0)]
        $Question,
        
        # ID der Frage
        [Parameter(ValueFromPipelineByPropertyName = $true,
            Position = 1)]
        [alias("QuestionID")]
        $_id,

        # MongoDB Connection String
        [Parameter(Position = 2)]
        $mongoDB = "mongodb://localhost:27017/",

        # Name der Datenbank
        $Databasename = "umfrage",
        # Name der Collection
        $Collectionname = "fragen"
    )

    Begin {
        Connect-Mdbc -ConnectionString $mongoDB -DatabaseName $Databasename -CollectionName $Collectionname
        $n = 1;
    }
    Process {
        
        if (-not $_id) {
            Write-Verbose "Anlegen der Frage ($Question) mit der ID (Q$n)"
            @{_id = "Q$n"; text = $Question} | Add-MdbcData
            $n++
        }
        else {
            Write-Verbose "Anlegen der Frage ($Question) mit der ID ($_id)"
            @{_id = $_id; text = $Question} | Add-MdbcData
        }
    }
    End {
    }
}

<#
.SYNOPSIS
    Einladen von Benutzer 
.DESCRIPTION
    Einladen von Benutzern zur Umfrage. Der Benutzer erhält einen Text (am besten mit einem Link zur Umfrage). In der Datenbank
    wird ein Feld für den Benutzer angelegt.
.EXAMPLE
    Invite-Subscriber -EMail test@test.de -Course FIAE17J -Poll "Schülerumfrage SJ1718" -Text "Bitte nehmen Sie an dieser Umfrage Teil http://localhost:4200?id={id}" -SMTP ex.mmbbs.de -Credentials (Get-Credentials User)    
    Über den SMTP Server ex.mmbbs.de mit den Credentials für 'User' wird eine Email mit dem Text versendet. Dabei wird
    {id} ersetzt durch die generierte ID für den Benutzer. Wurde die EMail erfolgreich versandt, wird ein Eintrags in die 
    Collection 'antworten' angelegt mit der ID und der Klassenbezeichnung.
.EXAMPLE
    "test1@test.de","test2@test.de" | Invite-Subscriber -Course FIAE17J -Poll "Schülerumfrage SJ1718" -Text "Bitte nehmen Sie an dieser Umfrage Teil http://localhost:4200?id={id}" -SMTP ex.mmbbs.de -Credentials (Get-Credentials User)    
    Über den SMTP Server ex.mmbbs.de mit den Credentials für 'User' werden die Emails mit dem Text versendet. Dabei wird
    {id} ersetzt durch die generierte ID für den Benutzer. Wurde die EMail erfolgreich versandt, wird ein Eintrags in die 
    Collection 'antworten' angelegt mit der ID und der Klassenbezeichnung.
.EXAMPLE
    Import-Excel c:\Temp\User.xlsx |Invite-Subscriber  -Poll "Schülerumfrage SJ1718" -Text "Bitte nehmen Sie an dieser Umfrage Teil http://localhost:4200?id={id}" -SMTP ex.mmbbs.de -Credentials (Get-Credentials User)    
    Über den SMTP Server ex.mmbbs.de mit den Credentials für 'User' werden die Emails mit dem Text versendet. Dabei wird
    {id} ersetzt durch die generierte ID für den Benutzer. Wurde die EMail erfolgreich versandt, wird ein Eintrags in die 
    Collection 'antworten' angelegt mit der ID und der Klassenbezeichnung. Die XLSX Datei muss dabei die Spalten 'EMail' und 'Course'
    haben.
#>
function Invite-Subscriber {
    [CmdletBinding()]
    Param (
        # EMail Adresse des Benutzer
        [Parameter(Mandatory = $true,
            Position = 0,
            ValueFromPipeline = $true,
            ValueFromPipelineByPropertyName = $true)]
        $EMail,
        
        # Klasse
        [Parameter(Mandatory = $true,
            Position = 1,
            ValueFromPipelineByPropertyName = $true)]
        $Course,
        
        # Bezeichnung der Umfrage
        [Parameter(Mandatory = $true,
            Position = 2)]
        $Poll,

        # Text der Einladungsemail, wobei die Zeichenkette {id} ersetzt wird durch die generierte ID
        [Parameter(Mandatory = $true,
            Position = 3)]
        [String]$Text,
 
        # SMTP Server über den die EMail versandt wird inkl. Portnummer 
        [Parameter(Mandatory = $true,
            Position = 4)]
        $SMTP,

        # Username für den SMTP Server über den die EMail versandt wird
        [Parameter(Mandatory = $true,
            Position = 5)]
        $SMTPUser, 

        # Passwort für den SMTP Server über den die EMail versandt wird
        [Parameter(Mandatory = $true,
            Position = 6)]
        $SMTPPassword, 

        # Absender der EMail Adresse
        $Sender = "tuttas@mmbbs.de",
        
        # Betreff der EMail Adresse
        $Subject = "Einladung zur Umfrage",

        # UmfrageServer URL
        $Pollserver = "http://127.0.0.1:3000/quest",        
        # Secret des UmfrageServers
        $PollserverSecret = "1234",
        # Wenn gesetzt, dann wird keine EMail versendet, sondern nur der Benutzer in die DB eingetragen
        [switch]$whatif   
    )
    
    begin {
        $password = $SMTPPassword | ConvertTo-SecureString -AsPlainText -Force
        $credentials = New-Object System.Management.Automation.PSCredential -ArgumentList $SMTPUser, $password
    }
    
    process {
        $id = genId;
        Write-Verbose "Generiere ID $id"
        if (-not $whatif) {
            Write-Verbose "Versende EMail an $EMail"
            $Server = $SMTP.split(":")
            $Text = $Text.Replace("{id}", $id)
            $utf8 = New-Object System.Text.utf8encoding
            Send-MailMessage -Encoding $utf8 -Body $Text -From $Sender -To $EMail -SmtpServer $Server[0] -Credential $credentials -Subject $Subject -UseSsl -Port $Server[1] 
        }
        Write-Verbose "Trage neuen Teilnehmer in die Umfrage ein"
        $headers = @{}
        $headers["content-Type"] = "application/json"
        $headers["secret"] = $PollserverSecret;
        $body = echo "" | Select-Object -Property "_id", "course", "poll"
        $body._id = $id
        $body.course = $Course
        $body.poll = $Poll
        Invoke-RestMethod -Method Post -Uri $Pollserver  -Headers $headers -Body (ConvertTo-Json $body)
    }
    
    end {
    }
}


function genId () {
    $s = "";
    for ($i = 0; $i -lt 20; $i++) {
        $r = 0
        while (!($r -ge 48 -and $r -le 57 -or $r -ge 65 -and $r -le 90 -or $r -ge 97 -and $r -le 122)) {
            $r = get-Random -minimum 48 -maximum 122
        }
        $s += [char]$r 
    }
    return $s
}