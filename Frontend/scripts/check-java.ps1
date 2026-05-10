$javaFromHome = $null

if ($env:JAVA_HOME) {
    $candidate = Join-Path $env:JAVA_HOME "bin\java.exe"
    if (Test-Path $candidate) {
        $javaFromHome = $candidate
    }
}

$javaCmd = if ($javaFromHome) {
    $javaFromHome
} else {
    (Get-Command java -ErrorAction SilentlyContinue).Source
}

if (-not $javaCmd) {
    throw "Java is not available on PATH."
}

Write-Output "JAVA_HOME: $env:JAVA_HOME"
Write-Output "java path: $javaCmd"
& $javaCmd -version
