# LearnSphere Frontend

LearnSphere is an Angular frontend workspace with local scripts for running the UI, checking Java, and managing the local MySQL-backed development setup.

## Quick Start

Install dependencies if needed:

```powershell
npm install
```

Start the frontend:

```powershell
npm run start
```

The Angular app runs on `http://localhost:4200` and proxies `/api/*` requests to `http://127.0.0.1:8080`.

## Commands

- `npm run start`: start Angular with the local API proxy
- `npm run build`: create a production frontend build
- `npm run build:dev`: create a development build
- `npm run clean`: remove generated Angular build artifacts
- `npm run java:check`: show the Java runtime the project will use
- `npm run mysql:start`: run MySQL with the repo-local `mysql-data` directory by default
- `npm run backend:start`: run the repo-local Spring Boot backend
- `npm run backend:build`: compile the Spring Boot backend with Maven
- `npm run backend:package`: build the backend jar
- `npm run dev:full`: start MySQL, backend, and frontend together
- `npm run api:test`: run the backend API smoke test script

## Repo Layout

- `src/`: Angular source code
- `scripts/`: development and utility scripts
- `docs/`: project documentation
- `backend/`: Spring Boot backend project
- `mysql-data/`: local MySQL runtime data

## Local Overrides

The startup scripts use these environment variables when present:

- `LEARNSPHERE_MYSQL_BIN`: custom path to `mysqld.exe`
- `LEARNSPHERE_MYSQL_DATA_DIR`: custom MySQL data directory
- `LEARNSPHERE_BACKEND_DIR`: custom path to a runnable Spring Boot backend project
- `JAVA_HOME`: custom Java 17 installation path

## Backend Note

The backend is now structured as a Maven-based Spring Boot project inside this repo. It compiles successfully, and the default startup path uses the local `backend` folder.

See [running guide](/C:/Users/yohaa/Downloads/angularapp/docs/RUNNING_GUIDE.md), [startup guide](/C:/Users/yohaa/Downloads/angularapp/docs/LEARNSPHERE_STARTUP.md), [deployment checklist](/C:/Users/yohaa/Downloads/angularapp/docs/DEPLOYMENT.md), and [repo structure notes](/C:/Users/yohaa/Downloads/angularapp/docs/REPO_STRUCTURE.md).
