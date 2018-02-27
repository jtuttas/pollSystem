<#
.Synopsis
    Importieren von Fragen in die Mongo DB Datenbank
.DESCRIPTION
    Importiert Fragen z.B. aus einer ExelTabelle in die Datenbank, es müssen die Module
    Import-Excel und Mdbc importiert sein. Dieses geschieht über Import-Module Import-Excel bzw. über
    Import-Module Mdbc.

    Wird kein Parameter für QuestionID vergeben, so werden die IDs Q1....Qn verwendet!

    Der Polltype gibt an um welche Fragensammlung es sich handelt. Dabei wird eine Collection
    Q{Polltype} erzeugt.
.EXAMPLE
    Import-Excel c:\Temp\fragen.xlsx | Import-Question -Polltype bho -mongoDB mongodb://localhost:27017/ -Databasename umfrage
    Importiert die Fragen aus fragen.xslx in die  Collection Qbho eingetragen
.EXAMPLE
    Import-Question -QuestionID Frage1 -Question "Eine Frage?" -Polltype bho -mongoDB mongodb://localhost:27017/ -Databasename umfrage 
    Die Frage wird mit der QuestionID in der Collection Qbho angelegt
.EXAMPLE
    Import-Question  -Question "Eine Frage?" -Polltype bho -mongoDB mongodb://localhost:27017/ -Databasename umfrage 
    Die Frage wird mit der QuestionID Q1 in der Collection Qbho angelegt
.EXAMPLE
    "Frage1","Frage2" | Import-Question  -Polltype bho -mongoDB mongodb://localhost:27017/ -Databasename umfrage 
    Die Fragen werden in der Collection Q{Polltype} mit den QuestionID Q1 und Q2  angelegt
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

        # Der PollType der Frage, d.h. die Fragen werden in der Collection Q{Polltype} gespeichert
        [Parameter(Mandatory = $true,
            Position = 1)]
        $Polltype,
        
        # ID der Frage Wird hier kein Wert gesetz, so wird ab Q1 bis Qn gezählt
        [Parameter(ValueFromPipelineByPropertyName = $true,
            Position = 2)]
        [alias("QuestionID")]
        $_id,

        # MongoDB Connection String, default localhost
        [Parameter(Position = 3)]
        $mongoDB = "mongodb://localhost:27017/",

        # Name der Datenbank (default umfrage)
        $Databasename = "umfrage"
       
    )

    Begin {
        Connect-Mdbc -ConnectionString $mongoDB -DatabaseName $Databasename -CollectionName "Q$Polltype"
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
        $o = Get-MdbcData 
        foreach ($item in $o) {
            $quest = "" | Select-Object -Property "_id", "text"
            $quest._id = $item._id
            $quest.text = $item.text
            $quest
        }
    }
}

<#
.Synopsis
    Importieren von Antworskalen in die Mongo DB Datenbank
.DESCRIPTION
    Importiert Antwortskalen z.B. aus einer ExelTabelle in die Datenbank, es müssen die Module
    Import-Excel und Mdbc importiert sein. Dieses geschieht über Import-Module Import-Excel bzw. über
    Import-Module Mdbc.

    Wird kein Parameter für Item vergeben, so werden die Items von 1...n verwendet! 
    
    Item werte von <0 werden nicht in der Auswertung berücksichtigt und eignen sich z.B. für Felder wie 
    "Kann nicht beurteilt werden"

    Der Polltype gibt an um welche Fragensammlung es sich handelt. Dabei wird eine Collection
    A{Polltype} erzeugt.
.EXAMPLE
    Import-Excel c:\Temp\antworten.xlsx | Import-Answer -Polltype bho -mongoDB mongodb://localhost:27017/ -Databasename umfrage
    Importiert die Antworten aus antworten.xslx in die  Collection Abho 
.EXAMPLE
    Import-Answer -Item 5 -Answer "Volle Zustimmung" -Polltype bho -mongoDB mongodb://localhost:27017/ -Databasename umfrage 
    Die Antwort wird mit dem Item 5 und ID A5 in die Collection Abho angelegt
.EXAMPLE
    Import-Answer  -Answer "Volle Zustimmung" -Polltype bho -mongoDB mongodb://localhost:27017/ -Databasename umfrage 
    Die Antwort mit dem Item Wert A1 wird in der Collection Abho angelegt
.EXAMPLE
    @{answer="volle Zustimmung";item=5},@{answer="Zustimmung";item=4} | Import-Answer  -Polltype bho -mongoDB mongodb://localhost:27017/ -Databasename umfrage 
    Die Antworten mit dem Item Wert 5 und 4 werden der Collection Abho angelegt mit den ID's A1 und A2
 .EXAMPLE
    "volle Zustimmung","Zustimmung" | Import-Answer  -Polltype bho -mongoDB mongodb://localhost:27017/ -Databasename umfrage 
    Die Antworten werden nach der Reihenfolge mit den Itemwerten 1..N / IDs A1....An in die Collection Abho angelegt 
    
#>
function Import-Answer {
    [CmdletBinding()]
    param (
        # Die Antwort
        [Parameter(Mandatory = $true,
            ValueFromPipelineByPropertyName = $true,
            ParameterSetName = "default",
            Position = 0)]
        $answer,

        # Der Itemwert für die Antwort. Itemwerte <=0 werden nicht in der Auswertung berücksichtig und eignen sich z.B. für Antworten wie 'kann nich beurteilt werden'
        [Parameter(ValueFromPipelineByPropertyName = $true,
            ParameterSetName = "default",
            Position = 1)]
        $item,
    
        # Antwort und Item kommen als Hashmap herein
        [Parameter(ValueFromPipeline = $true,
            ParameterSetName = "hash",
            Position = 1)]
        [Hashtable[]]$hash,

        # Antworten kommen als Strings herein
        [Parameter(ValueFromPipeline = $true,
            ParameterSetName = "asstring",
            Position = 1)]
        [String[]]$astring,
    
        # Der PollType der Frage, d.h. die Antworten werden in der Collection A{Polltype} gespeichert
        [Parameter(Mandatory = $true,
            Position = 2)]
        $Polltype,

        # MongoDB Connection String, default localhost
        [Parameter(Position = 3)]
        $mongoDB = "mongodb://localhost:27017/",

        # Name der Datenbank
        $Databasename = "umfrage"
       
    )

    Begin {
        Connect-Mdbc -ConnectionString $mongoDB -DatabaseName $Databasename -CollectionName "A$Polltype"
        $n = 1;
    }
    Process {
        if ($hash) {
            $hash | ForEach-Object {
                $answer = "" | Select-Object -Property "_id", "text", "item"
                $answer._id = "A$n"
                $answer.text = $_.answer
                $answer.item = $_.item
                Write-Verbose "Anlegen der Antwort ($($answer.text)) mit dem Item (item:$($answer.item)) in Collection A$Polltype"
                @{_id = "A$n"; text = $answer.text; item = $answer.item} | Add-MdbcData
                $n++
                
            }
        }
        elseif ($astring) {
            $astring | ForEach-Object {
                $answer = "" | Select-Object -Property "_id", "text", "item"
                $answer._id = "A$n"
                $answer.text = $_
                $answer.item = $n
                Write-Verbose "Anlegen der Antwort ($($answer.text)) mit dem Item (item:$($answer.item)) in Collection A$Polltype"
                @{_id = "A$n"; text = $answer.text; item = $answer.item} | Add-MdbcData
                $n++
            }
        }
        else {
            if (-not $item) {
                Write-Verbose "Anlegen der Antwort ($answer) mit dem Item (item:$n) in Collection A$Polltype"
                @{_id = "A$n"; text = $answer; item = $n} | Add-MdbcData
                $n++
            }
            else {
                Write-Verbose "Anlegen der Antwort ($answer) mit dem  Item set to  (item:$item) in Collection A$Polltype"
                @{_id = "A$item"; text = $answer; item = $item} | Add-MdbcData
            }
        }
    }
    End {
        $o = Get-MdbcData 
        foreach ($item in $o) {
            $answer = "" | Select-Object -Property "_id", "text", "item"
            $answer._id = $item._id
            $answer.text = $item.text
            $answer.item = $item.item
            $answer
        }
    }
}


<#
.Synopsis
    Enable or Disbale Poll
.DESCRIPTION
    Eine Umfrage wir freigeschaltet oder gesperrt und kann mit einem Kennwort geschützt werden
.EXAMPLE
    New-Poll -Polltype bho -Poll Umfrage1 -Enable $true -mongoDB mongodb://localhost:27017/ -Databasename umfrage
    Schaltet die Umfrage mit dem Namen "Umfrage1" für den Polltype 'bho' aktiv. D.h. es wird ein Eintrag
    in die Collection Cbho gemacht 
.EXAMPLE
    New-Poll -Polltype bho -Poll Umfrage2 -Password geheim -mongoDB mongodb://localhost:27017/ -Databasename umfrage
    Erzeugt die Umfrage2 auf der Grundlage (die Fragen und Antworten) des Polltyps bho. Die Umfrage ist
    noch nicht aktiv. Die Auswertung wird durch das Kennwort "geheim" geschützt.
#>
function New-Poll {
    [CmdletBinding()]
    param (
        # Der PollType der Frage, d.h. die Konfiguration werden in der Collection C{Polltype} gespeichert
        [Parameter(Mandatory = $true,
            Position = 0)]
        $Polltype,
        # Name der Umfrage
        [Parameter(Mandatory = $true,
            Position = 1)]
        $Poll,

        # Freischalten oder Sperren der Umfrage
        [Parameter(Position = 2)]
        [boolean]$Enable = $false,
    
        # MongoDB Connection String, default localhost
        $mongoDB = "mongodb://localhost:27017/",

        # Name der Datenbank
        $Databasename = "umfrage",
    
        # Kennwort mit dem die Umfrageauswertung geschützt wirde
        $Password
    
    )

    Begin {
        Connect-Mdbc -ConnectionString $mongoDB -DatabaseName $Databasename -CollectionName "C$Polltype"
        $data = Get-MdbcData (New-MdbcQuery _id -EQ $Poll)
        if ($data) {
            Write-Verbose "Aktualisiere die Umfrage $Poll vom type $Polltype auf $Enable"
            $data | Update-MdbcData (New-MdbcUpdate -Set @{enable = $Enable})
            if ($Password) {
                $data | Update-MdbcData (New-MdbcUpdate -Set @{password = $Password})                
            }
        }
        else {
            Write-Verbose "Erzeuge neue Umfrage $Poll vom type $Polltype auf $Enable"
            if ($Password) {
                @{_id = "$Poll"; enable = $Enable; password = $Password} | Add-MdbcData
            }
            else {
                @{_id = "$Poll"; enable = $Enable} | Add-MdbcData
            }
        }
    }
    End {
        $o = Get-MdbcData 
        foreach ($item in $o) {
            $config = "" | Select-Object -Property "_id", "enable", "password"
            $config._id = $item._id
            $config.enable = $item.enable
            $config.password = $item.password            
            $config
        }
    }
}

<#
.SYNOPSIS
    Einladen von Benutzer 
.DESCRIPTION
    Einladen von Benutzern zur Umfrage. Die Ausgabe es CMDlets ist die Ursprüngliche EMail erweitert um
    einen erzeugten KEY über diesen KEY kann der Benutzer auf die Umfrage zugreifen. Dabei werden die 
    Ergebnisse des Teilnehmer in der Datenbank R{Polltype} gespeichert-
.EXAMPLE
    New-Subscriber -EMail test@test.de -Course FIAE17J -Poll "Schülerumfrage SJ1718" -Polltype bho     
    Für den Teilnehmer test@test.de wird ein neur Eintrag in die Collection Rbho eingefügt. Als _id
    wird eine ID generiert.
.EXAMPLE
    "test1@test.de","test2@test.de" | New-Subscriber -Course FIAE17J -Poll "Schülerumfrage SJ1718" -Polltype bho 
    Für die Teilnehmer test@test.de und test2@test.de werden neue Einträge in die Collection Rbho eingefügt. Als _id
    wird eine ID generiert.
.EXAMPLE
    Import-Excel c:\Temp\User.xlsx |New-Subscriber  -Poll "Schülerumfrage SJ1718" -Polltype bho
    Die XLSX Datei muss dabei die Spalten 'EMail' und 'Course' haben. Die Teilnehmer der Spalte EMail 
    werden in die Collection Rbho eingefügt. Als ID wird eine eindeutige ID generiert.
#>
function New-Subscriber {
    [CmdletBinding()]
    Param (
        # EMail Adresse des Benutzer
        [Parameter(Mandatory = $true,
            Position = 0,
            ParameterSetName = "plain" )]
        $Email,

        # EMail Adresse des Benutzer
        [Parameter(Mandatory = $true,
            Position = 0,
            ValueFromPipeline = $true,
            ParameterSetName = "pipe",
            ValueFromPipelineByPropertyName = $true)]
        $data,

        # Klasse des benutzers
        [Parameter(Mandatory = $true,
            Position = 1,
            ParameterSetName = "pipe",
            ValueFromPipelineByPropertyName = $true)]
        [Parameter(Mandatory = $true,
            Position = 1,
            ParameterSetName = "plain")]
        $Course,
        
        # Bezeichnung der Umfrage
        [Parameter(Mandatory = $true,
            Position = 2)]
        $Poll,

        # Bezeichnung der Umfrage
        [Parameter(Mandatory = $true,
            Position = 3)]
        $Polltype,
    
        # MongoDB Connection String, default localhost
        $mongoDB = "mongodb://localhost:27017/",

        # Name der Datenbank
        $Databasename = "umfrage"
    
  
    )
    
    begin {
        Connect-Mdbc -ConnectionString $mongoDB -DatabaseName $Databasename -CollectionName "R$Polltype"
        $teilnehmerListe = @{}
    }    
    process {
        $id = genId;
        #Write-Host "Parameterset Name= $($PsCmdlet.ParameterSetName)"
        if ($data.EMail) {
            Write-Verbose "Trage neuen Teilnehmer mit der _id=$id in die Collection R$Polltype ein f. den Course=$($data.Course)!"
            @{_id = "$id"; course = $data.Course; poll = $Poll} | Add-MdbcData
            $teilnehmerListe[$id] = $data.EMail                        
        }
        else {
            if ($Email) {
                Write-Verbose "Trage neuen Teilnehmer mit der _id=$id in die Collection R$Polltype ein f. den Course=$Course"
                @{_id = "$id"; course = $Course; poll = $Poll} | Add-MdbcData
                $teilnehmerListe[$id] = $Email
            }
            else {
                Write-Verbose "Trage neuen Teilnehmer mit der _id=$id in die Collection R$Polltype ein f. den Course=$Course."
                @{_id = "$id"; course = $Course; poll = $Poll} | Add-MdbcData
                $teilnehmerListe[$id] = $data
            }
        }
    }
    
    end {
        $teilnehmerListe
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