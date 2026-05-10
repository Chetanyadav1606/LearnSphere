# Running Guide

This guide is for running the full LearnSphere stack locally from this repo.

## What should run

- MySQL on port `3306`
- Spring Boot backend on port `8080`
- Angular frontend on port `4200`

## Before you start

Open a new PowerShell window in:

```powershell
C:\Users\yohaa\Downloads\angularapp
```

Install frontend dependencies if needed:

```powershell
npm install
```

Optional sanity checks:

```powershell
npm run java:check
npm run backend:build
npm run backend:package
```

## Recommended way to run

Open 3 PowerShell windows in the repo root and run these commands.

### Terminal 1: MySQL

```powershell
npm run mysql:start
```

What success looks like:

- the terminal stays open
- you see MySQL startup logs
- a line similar to `ready for connections`

### Terminal 2: Backend

```powershell
npm run backend:start
```

What success looks like:

- backend packages and then starts from the built jar
- a line similar to `Started LearnSphereApplication`

### Terminal 3: Frontend

```powershell
npm run start
```

What success looks like:

- Angular starts without exiting
- the app opens at `http://localhost:4200`

## Quick test checklist

After starting everything, test these in your browser:

- Frontend: `http://localhost:4200`
- Backend protected route check: `http://localhost:8080/api/users`
- Backend auth route check: `http://localhost:8080/api/auth/login`

Expected behavior:

- `http://localhost:4200` should load the app
- `http://localhost:8080/api/users` may show `403 Forbidden` in browser because it is protected
- `http://localhost:8080/api/auth/login` exists, but it expects a `POST` request, not a browser `GET`

## Best way to test login

Use the app itself:

1. Open `http://localhost:4200`
2. Register a user
3. Log in with that user
4. Navigate through courses, dashboard, and other pages

## Useful commands

Clean frontend artifacts:

```powershell
npm run clean
```

Compile backend without starting it:

```powershell
npm run backend:build
```

Run API smoke test:

```powershell
npm run api:test
```

## If something fails

### Frontend fails

Run:

```powershell
npm run start
```

Then check:

- port `4200` is free
- backend is already running on `8080`

### Backend fails

Run:

```powershell
npm run backend:build
npm run backend:start
```

Then check:

- MySQL is already running
- port `8080` is free
- Java 17 is active via `npm run java:check`

### MySQL fails

Run:

```powershell
npm run mysql:start
```

Then check:

- `mysql-data` exists in the repo
- port `3306` is not already in use by another MySQL instance

## Current local defaults

- MySQL data dir: `C:\Users\yohaa\Downloads\angularapp\mysql-data`
- Backend dir: `C:\Users\yohaa\Downloads\angularapp\backend`
- Frontend dir: `C:\Users\yohaa\Downloads\angularapp`
