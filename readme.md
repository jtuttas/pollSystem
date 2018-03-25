# Umfrage Server/Client
## Docker-Images
Für das Umfragesystem Client/Server existieren auch Docker Images. Wird Docker-Compose verwendet, so kann das System einfach eingerichtet werden über folgendes YML File:
```yml
version: '2.1'

services:
  mongodb:
    image: mongo:latest
    container_name: "mongodb"
    ports:
      - 27017:27017
  pollserver:
    image: tuttas/pollserver:latest
    ports:
      - 3000:3000
    links: 
      - mongodb
    environment: 
      - MONGODB=mongodb://mongodb:27017
      - SECRET=12345
    depends_on: 
      - mongodb
  pollclient:      
    image: tuttas/pollclient:latest
     environment: 
      - SECRET=12345
    ports:
      - 81:80
      
```
Hier startet man einfach:
```
docker-compose -f docker-compose.debug.yml up -d --build
```
Anschließend kann über http://localhost:81/#/demo getest werden, ob das System läuft!

Natürlich können die einzelnen Server auch manuell gestartet werden, z.B.
```
# Mongo DB Server starten
docker run -itd -p 27017:27017 mongo:latest

# Pollserver starten
docker run -itd -p 3000:3000 tuttas/pollserver:latest

# Pollclient
docker run -itd -p 81:80 tuttas/pollclient:latest
```

Default verbindet sich der pollserver mit einem MongoDB Server verbunden, der auf localhost läuft, soll sich mit einem anderen MongoDB Server verbunden werden, so die dazu die Environment Variable *MONGODB*. Diese Variable erwartet einen Connection-String zur Mongo DB Datenbank!

Ferner kann über die Environment Variable *SECRET* (default ist 1234) das geheime Wort aufgetauscht werden, mittels der sich Server und Client gegenseitig authentifizieren.

Der Client verbindet sich default immer mit dem Server auf dem er ausgeführt wird und nutzt dabei das Secret "1234". Sollen diese Werte geändert werden, so kann dazu die Environment Variable *HOST* (achtung, den Host stets mit einfachen Hochkomma angeben),*PORT* (die Portnummer des Servers) und *SECRET* (für die gegenseitige Authentifizierung von Server<->Client) genutzt werden.
```
docker run -itd -p 3000:3000 -e MONGODB=mongodb://admin:geheim@192.168.178.74:27017 -e SECRET=12345 tuttas/pollserver:latest
docker run -itd -p 81:80 -e HOST='localhost' -e PORT=:3000/ -e SECRET=12345 tuttas/pollclient:latest
```

### Docker Images (ARM)

Für ARM basierte Systeme wie dem Raspberry PI existieren Images mit dem Tag 'arm', diese YML-File startet auf dem PI den CLient/Server und den Datenbankserver.
```yml
version: '2.1'

services:
  mongodb:
    image: mangoraft/mongodb-arm
    container_name: "mongodb"
    ports:
      - 27017:27017
  pollserver:
    image: tuttas/pollserver:arm
    ports:
      - 3000:3000
    links: 
      - mongodb
    environment: 
      - MONGODB=mongodb://mongodb:27017
    depends_on: 
      - mongodb
  pollclient:      
    image: tuttas/pollclient:arm
    environment: 
      - SECRET=12345
    ports:
      - 81:80   
```

Über diese Anweisung erledigt das dieser Zweizeile:
```
wget https://raw.githubusercontent.com/jtuttas/pollSystem/master/docker-compose.debug.arm.yml
docker-compose -f docker-compose.debug.arm.yml up -d --build
```

Auch hier können natürlich die Container manuell gestartet werden:
```
# MongoDB Server
docker run -d -p 27017:27017 -p 28017:28017 -e MONGODB_PASS="geheim" mangoraft/mongodb-arm

# Pollsystem Server
docker run -itd -p 3000:3000 -e MONGODB=mongodb://admin:geheim@192.168.178.74:27017  tuttas/pollserver:arm

# Pollsystem Client
docker run -itd -p 81:80 tuttas/pollclient:arm
```

## Server selbst einrichten
### Vorbereitungen
Zunächst müssen die notwendigen Komponenten installiert werden.
```
cd Server
npm install
```
### Starten des Servers
Nach der Installation der Pakete kann der Server gestertet werden.
```
npm start
```
Der Server läuft standradmäßig auf Port 3000, über http://localhost:3000 kann abgefragt werden ob der Server ordnungsgemäß läuft.
## Client selbst einrichten
Auch hier müssen zunächst die notwendigen Module geladen werden.
```
cd Client
npm install
```
Der Client ist eine Angualr CLI Anwendung und kann wie folgt gestartet werden.
```
ng serve
```
Anschließend kann der Client aufgerufen werden via http://localhost:4200

Für den produktiv Betrieb kann die Anwendung deployed werden via
```
ng build --prod
```
## Durchführen einer Umfrage
Zum Durchführen einer Umfrage steht das Powershell CMDlet umfrage.ps1 zur Verfügung. Dieses Benötigt das Modul *Mdbc* um auf die MongoDB zugreifen zu können, dieses kann einfach über folgenden Befehl installiert werden. 
```ps1
Install-Module -Name Mdbc
```

Das Modul kann über die Powershell Gallery bezogen werden und ist über folgende Anweisung zu installieren:
```ps1
Install-Module -Name pollmodule
```
Das Modul enthält fogende Funktionen (Aufruf von *Get-Command -Module pollmodule*):
```
CommandType     Name                                               Version    Source
-----------     ----                                               -------    ------
Function        Import-Answer                                      1.0        pollsystem
Function        Import-Question                                    1.0        pollsystem
Function        Import-Result                                      1.0        pollsystem
Function        Invite-Subscriber                                  1.0        pollsystem
Function        New-Poll                                           1.0        pollsystem
Function        New-Subscriber                                     1.0        pollsystem
```

Die Funktionen sind alle mit Hilfstexten versehen und so kann über *Get-Help New-Subscriber* diese abgefragt werden.

Im Folgenden will ich kurz das Durchführen einer Umfrage beschreiben.
### Import der Fragen
Am besten befinden sich die Fragen in einer Excel Tabelle mit folgender Struktur.

row | question
--- | ---
1 | Hier eine Frage |
2 | Hier noch eine Frage |


Diese Fragen könne einfach über *Import-Question* importtiert werden.
```ps
Import-Excel fragen.xlsx | Import-Question -Polltype bho -mongoDB mongodb://localhost:27017/ 
```
Wobei *Polltype* der Type der Umfrage ist und *mongoDB* der Connectionstring zur Datenbank. Default heißt die Datenbank *umfrage* und es wir eine Collection *Q{polltype}* angelegt.
### Import der Antwortskalen
In ähnlicher Weise können die Antwortskalen importiert werden. Diese befinden sich günstiger Weise auch in einer Excel Tabelle mit folgendem Aussehen:

row | answer | item 
--- | --- | ---
1 | Volle Zustimmung | 5 |
2 | Zustimmung| 4 |

Itemwerte <0 werden dabei in der Auswertung nicht berücksichtig und eignen sich z.B. für Felder wie "Enthaltung".

Diese Antworten könne einfach über *Import-Answer* importiert werden.
```ps
Import-Excel antworten.xlsx | Import-Answer -Polltype bho -mongoDB mongodb://localhost:27017/ 
```
Wobei *Polltype* der Type der Umfrage ist und *mongoDB* der Connectionstring zur Datenbank. Default heißt die Datenbank *umfrage* und es wir eine Collection *A{polltype}* angelegt.
### Importieren und Anschreiben der Teilnehmer
Zum Erzeugen und Anschreiben der Teilnehmer dienen die CMDlet *New-Subscriber* und *Invite-Subscriber*. Diese erzeugen einen neuen Teilnehmer und senden ihm eine EMail. Der Text der EMail könnte z.B. so lauten:
```html
Liebe Schülerinnen und Schüler,
hiermit möchte ich euch einladen an der Umfrage <b>{poll}</b> teilzunehmen. Ihr erreicht die Umfrage über folgenden Link:

<a href="http://localhost:4200/bho/{id}">Umfrage</a>

Mit freundlichen Grüßen
```
Beim senden der EMail werden *{poll}* und *{id}* sowohl im Betreff als auch im Inhalt der Mail ersetzt durch die entsprechenden Werte. Am einfachsten man erzeugt die Teilnehmer über eine Pipeline. Diese wird "gefüttert" mit den einzuladenden EMail Adressen (z.B. aus der AD).
```ps
"test1@test.de","test2@test.de" | New-Subscriber -Course FIAE17J -Poll "Schülerumfrage SJ1718" -Polltype bho | Invite-Subscriber -Text (get-Content email.txt -Encoding UTF8) -SMTPServer "smtp.uni-hannover.de:587" -SMTPUser user -SMTPPassword geheim
```
Diese Pipeline führt dazu, dass für die Teilnehmer mit den EMail Adressen "test1@test.de" und "test2@test.de" ein neuer Eintrag in die Collection *R{polltype}*, hier *Rbho* getätigt wird. Zuvor wird eine eindeutige ID generiert. Die Teilnehmer erhalten dann die oben dargestellte EMail über den gewählten SMTP Server zugesandt.
### Freischalten der Umfrage
Über das CMDlet *New-Poll* kann die Umfrage gestartet werden, bzw. auch ein Kennwort für die Auswertung der Umfrage vergeben werden. Wird das CMDlet in dieser Weise gestartet,
```ps
New-Poll -Polltype bho -Enable $true -Poll Umfrage2 -Password geheim -mongoDB mongodb://localhost:27017/ 

```
wird eine Umfrage mit dem Namen **Umfrage2** vom Type **bho** freigeschaltet und das Kennwort **geheim** für die spätere Auswertung vergeben. Diese Daten werden in der Collection *C{polltype}* gespeichert.

# Screenshots
Teilnehmeransicht (Durchführen der Umfrage)

![voting](voting.PNG "Voting for a Poll")


Auswertung der Umfrage

![eval](eval.gif "Evaluation of a Poll")

# Video
[![Pollsystem](http://img.youtube.com/vi/feGatCfqq7g/0.jpg)](http://www.youtube.com/watch?v=feGatCfqq7g)





