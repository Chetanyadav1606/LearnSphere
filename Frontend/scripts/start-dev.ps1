$root = Split-Path -Parent $PSScriptRoot

Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-ExecutionPolicy", "Bypass",
    "-File", (Join-Path $PSScriptRoot "start-mysql.ps1")
)

Start-Sleep -Seconds 2

Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-ExecutionPolicy", "Bypass",
    "-File", (Join-Path $PSScriptRoot "start-backend.ps1")
)

Start-Sleep -Seconds 2

Push-Location $root
try {
    npm run start
}
finally {
    Pop-Location
}
