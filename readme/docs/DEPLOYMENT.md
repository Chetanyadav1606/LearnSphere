# Deployment Checklist

## Frontend build

Build the production app with:

```powershell
npm run build
```

The static files are emitted to `dist/book-network-ui/browser`.

## Required backend setup

This repo now contains a runnable Spring Boot backend project. The frontend expects the backend to serve the API under `/api/*`.

For production, make sure you have:

- a deployed Spring Boot API
- a deployed MySQL database
- CORS or a reverse proxy configured correctly
- JWT/auth settings aligned with the frontend login flow

## Recommended hosting shape

Use one public origin for the app and proxy API requests to the backend:

- `/` -> Angular static files
- `/api/*` -> Spring Boot backend

That keeps the frontend config simple because it already uses relative `/api` paths in both development and production.

## Example platforms

- Nginx/Apache: serve the Angular build and reverse proxy `/api`
- Render/Railway/Fly.io: deploy frontend static assets and backend service separately, then add a rewrite/proxy layer
- Spring Boot unified hosting: serve the Angular build from the backend app and keep `/api` on the same domain

## Pre-deploy checks

- `npm run build` succeeds
- backend endpoints respond under `/api`
- login, course listing, enrollment, tests, and discussions work against the deployed API
- frontend host rewrites unknown routes to `index.html`
