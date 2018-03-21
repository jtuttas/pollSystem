. $PSScriptRoot/pollsystem.ps1
new-poll -polltype bho -poll DemoUmfrage -enable $true -mongodb "mongodb://192.168.178.80:27017" -Verbose
Import-Excel "$PSScriptRoot/Fragen.xlsx" | Import-Question -Polltype bho -Verbose -mongodb "mongodb://192.168.178.80:27017"
Import-Excel "$PSScriptRoot/Antworten.xlsx" | Import-Answer -Polltype bho -Verbose -mongodb "mongodb://192.168.178.80:27017"