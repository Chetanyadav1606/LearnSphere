$projectRoot = Split-Path -Parent $PSScriptRoot
$backendDir = Join-Path $projectRoot "backend"
$javaHome = if ($env:JAVA_HOME) {
    $env:JAVA_HOME
} else {
    "C:\Program Files\Microsoft\jdk-17.0.18.8-hotspot"
}

$mavenHome = Join-Path $projectRoot "apache-maven-3.9.6"
$mvnCmd = Join-Path $mavenHome "bin\mvn.cmd"
$localMavenRepo = Join-Path $backendDir ".m2"

if (-not (Test-Path $backendDir)) {
    throw "Backend directory not found at '$backendDir'."
}

if (-not (Test-Path (Join-Path $backendDir "pom.xml"))) {
    throw "Backend pom.xml not found at '$backendDir'."
}

if (-not (Test-Path $javaHome)) {
    throw "JAVA_HOME path not found at '$javaHome'."
}

if (-not (Test-Path $mvnCmd)) {
    throw "Maven executable not found at '$mvnCmd'."
}

$env:JAVA_HOME = $javaHome
$env:PATH = "$($env:JAVA_HOME)\bin;$($mavenHome)\bin;$env:PATH"

Push-Location $projectRoot
try {
    & $mvnCmd "-Dmaven.repo.local=$localMavenRepo" -f (Join-Path $backendDir "pom.xml") clean compile
}
finally {
    Pop-Location
}
