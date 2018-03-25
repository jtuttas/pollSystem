$mongo="mongodb://tut:12345678@localhost:27017"
#$mongo="mongodb://admin:geheim@192.168.178.74:27017"

. $PSScriptRoot/pollsystem.ps1
new-poll -polltype bho -poll DemoUmfrage -enable $true -mongodb $mongo -Verbose
Import-Excel "$PSScriptRoot/Fragen.xlsx" | Import-Question -Polltype bho -Verbose -mongodb $mongo
Import-Excel "$PSScriptRoot/Antworten.xlsx" | Import-Answer -Polltype bho -Verbose -mongodb $mongo