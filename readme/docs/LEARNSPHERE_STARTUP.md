# LearnSphere Startup Instructions

The project now has shorter local startup commands.

Java is now configured to use the installed JDK 17 by default.

## Fastest option

Start everything with one command from this folder:

```powershell
npm run dev:full
```

That script:

- opens MySQL in a new PowerShell window
- opens the Spring Boot backend in a new PowerShell window
- starts the Angular frontend in the current terminal

## Run services individually

### 1. MySQL Database
```powershell
npm run mysql:start
```

### 2. Spring Boot Backend
```powershell
npm run backend:start
```

### 3. Angular Frontend
```powershell
npm run start
```

### Check active Java
```powershell
npm run java:check
```

The frontend runs at `http://localhost:4200` and proxies `/api/*` to `http://127.0.0.1:8080`.

## Default local paths

By default:

- MySQL uses `C:\Users\yohaa\Downloads\angularapp\mysql-data`
- backend uses `C:\Users\yohaa\Downloads\angularapp\backend`

## Override local paths

If your local machine uses different paths, set these environment variables before starting:

```powershell
$env:LEARNSPHERE_MYSQL_BIN = "C:\Path\To\mysqld.exe"
$env:LEARNSPHERE_MYSQL_DATA_DIR = "C:\Path\To\mysql-data"
$env:LEARNSPHERE_BACKEND_DIR = "C:\Path\To\backend-project"
$env:JAVA_HOME = "C:\Path\To\jdk-17"
```

## Important note

The `backend` folder is now a real Spring Boot project inside this repo. By default, `npm run backend:start` uses it directly.
