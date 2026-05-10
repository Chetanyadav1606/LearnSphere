$projectRoot = Split-Path -Parent $PSScriptRoot

$backendDir = if ($env:LEARNSPHERE_BACKEND_DIR) {
    $env:LEARNSPHERE_BACKEND_DIR
} else {
    Join-Path $projectRoot "backend"
}

$javaHome = if ($env:JAVA_HOME) {
    $env:JAVA_HOME
} else {
    "C:\Program Files\Microsoft\jdk-17.0.18.8-hotspot"
}

$mavenHome = Join-Path $PSScriptRoot "..\apache-maven-3.9.6"
$buildScript = Join-Path $PSScriptRoot "package-backend.ps1"

if (-not (Test-Path $backendDir)) {
    throw "Backend directory not found at '$backendDir'. Set LEARNSPHERE_BACKEND_DIR to override it."
}

$pomFile = Join-Path $backendDir "pom.xml"
if (-not (Test-Path $pomFile)) {
    throw "Backend folder '$backendDir' is not a complete Spring Boot project yet. Missing pom.xml. Add the backend build files there or set LEARNSPHERE_BACKEND_DIR to a runnable backend project."
}

if (-not (Test-Path $javaHome)) {
    throw "JAVA_HOME path not found at '$javaHome'. Set JAVA_HOME before running the backend script."
}

if (-not (Test-Path $buildScript)) {
    throw "Backend build script not found at '$buildScript'."
}

$env:JAVA_HOME = $javaHome
$env:PATH = "$($env:JAVA_HOME)\bin;$($mavenHome)\bin;$env:PATH"

Push-Location $projectRoot
try {
    & powershell -ExecutionPolicy Bypass -File $buildScript

    $jarFile = Get-ChildItem -Path (Join-Path $backendDir "target") -Filter "*.jar" -File |
        Where-Object { $_.Name -notlike "*.original" } |
        Sort-Object LastWriteTime -Descending |
        Select-Object -First 1

    if (-not $jarFile) {
        throw "Packaged backend jar not found in '$backendDir\\target'."
    }

    & (Join-Path $javaHome "bin\java.exe") -jar $jarFile.FullName
}
finally {
    Pop-Location
}
