# 🚀 LearnSphere Deployment Guide

This guide will walk you through deploying your full-stack application for free using **Render** (for the database and backend) and **Vercel** (for the frontend).

---

## 🛠️ Prep Work (Already Done For You!)

I have already modified your codebase to support cloud deployment:
1. Created a `Dockerfile` in the `backend/` folder.
2. Updated `backend/src/main/resources/application.properties` to support environment variables (`DATABASE_URL`, `PORT`, etc.).
3. Updated `SecurityConfig.java` to allow dynamic CORS origins so your frontend isn't blocked.
4. Updated `Frontend/src/environments/environment.production.ts`.

---

## Step 1: Push to GitHub

Before you can deploy, your latest code needs to be on GitHub.

1. Open your terminal in the root `Learnshere-main` folder.
2. Run these commands:
   ```bash
   git add .
   git commit -m "chore: prepare for deployment"
   git push origin main
   ```

---

## Step 2: Deploy PostgreSQL Database (Render)

1. Go to [Render.com](https://render.com/) and create a free account.
2. Click **New +** and select **PostgreSQL**.
3. Name your database (e.g., `learnsphere-db`).
4. Select the **Free** tier and click **Create Database**.
5. Once created, scroll down to **Connections** and copy the **Internal Database URL** (it starts with `postgres://...`). You will need this for the backend!

---

## Step 3: Deploy Spring Boot Backend (Render)

1. On Render, click **New +** and select **Web Service**.
2. Connect your GitHub account and select your `LearnSphere` repository.
3. Configure the Web Service:
   - **Name**: `learnsphere-backend`
   - **Root Directory**: `backend` *(⚠️ Very important!)*
   - **Environment**: `Docker`
   - **Instance Type**: Free
4. Scroll down to **Environment Variables** and add the following:
   - `DATABASE_URL`: *(Paste the Internal Database URL you copied in Step 2)*
   - `DATABASE_USER`: *(Usually `learnsphere_db_user` — look at your Render DB dashboard)*
   - `DATABASE_PASS`: *(Your Render DB password)*
   - `CORS_ALLOWED_ORIGINS`: `https://learnsphere.vercel.app` *(We will create this Vercel URL in Step 4. You can update this variable later if your Vercel URL is different).*
5. Click **Create Web Service**.
6. Wait 5-10 minutes for it to build. Once it says "Live", copy the **Backend URL** (e.g., `https://learnsphere-backend-xyz.onrender.com`).

---

## Step 4: Update Frontend Environment

Now that your backend is live, you must tell your Angular frontend where it is.

1. In your code editor, open `Frontend/src/environments/environment.production.ts`.
2. Replace the placeholder URL with your **actual Render Backend URL**:
   ```typescript
   export const environment = {
     production: true,
     apiBaseUrl: 'https://learnsphere-backend-xyz.onrender.com/api' // <--- UPDATE THIS
   };
   ```
3. Save the file, commit, and push to GitHub:
   ```bash
   git add .
   git commit -m "config: set production backend URL"
   git push origin main
   ```

---

## Step 5: Deploy Angular Frontend (Vercel)

1. Go to [Vercel.com](https://vercel.com/) and create a free account.
2. Click **Add New** → **Project**.
3. Connect your GitHub account and import your `LearnSphere` repository.
4. Configure the Project:
   - **Project Name**: `learnsphere`
   - **Framework Preset**: `Angular`
   - **Root Directory**: `Frontend` *(⚠️ Very important! Click "Edit" and select the Frontend folder).*
5. Click **Deploy**.
6. Wait 2-3 minutes. Vercel will automatically build and host your frontend!

---

## 🎉 Success!

You are now live!
- Visit your Vercel URL to see the app running on the internet.
- Because we set `spring.jpa.hibernate.ddl-auto=update` in the backend, your database tables were automatically created when the backend started.

> **💡 Note on Free Tiers:**
> Render spins down free Web Services after 15 minutes of inactivity. When you visit your app after a break, the first API call might take 30-60 seconds while the backend "wakes up".
