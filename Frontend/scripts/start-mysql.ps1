$projectRoot = Split-Path -Parent $PSScriptRoot

$mysqlBinary = if ($env:LEARNSPHERE_MYSQL_BIN) {
    $env:LEARNSPHERE_MYSQL_BIN
} else {
    "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe"
}

$mysqlDataDir = if ($env:LEARNSPHERE_MYSQL_DATA_DIR) {
    $env:LEARNSPHERE_MYSQL_DATA_DIR
} else {
    Join-Path $projectRoot "mysql-data"
}

if (-not (Test-Path $mysqlBinary)) {
    throw "MySQL binary not found at '$mysqlBinary'. Set LEARNSPHERE_MYSQL_BIN to override it."
}

if (-not (Test-Path $mysqlDataDir)) {
    throw "MySQL data directory not found at '$mysqlDataDir'. Set LEARNSPHERE_MYSQL_DATA_DIR to override it."
}

& $mysqlBinary "--datadir=$mysqlDataDir" "--port=3306" "--console"
