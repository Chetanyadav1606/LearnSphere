# Repo Structure

## Source of truth

- `src/`: Angular application source
- `scripts/`: local development and operational scripts
- `docs/`: project documentation
- `backend/`: Maven-based Spring Boot backend project

## Root config

- `package.json`
- `angular.json`
- `tsconfig.json`
- `tsconfig.app.json`
- `proxy.conf.json`
- `.gitignore`
- `.editorconfig`

## Local-only runtime folders

- `node_modules/`
- `.angular/`
- `dist/`
- `mysql-data/`

These are intentionally ignored and should not be treated as source files.
