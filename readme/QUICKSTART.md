# LearnSphere - Quick Start Guide

## ✅ Integration Complete!

Your Angular frontend and Spring Boot backend are now fully integrated with PostgreSQL. Here's how to get started:

---

## Prerequisites
- ✅ Node.js 18+ installed
- ✅ Java 21 installed  
- ⏳ PostgreSQL 12+ (download from postgresql.org)

---

## Step 1: Set Up PostgreSQL Database

### Windows
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Run installer
3. Set password for `postgres` user (default in config is `root`)
4. Install pgAdmin (included)
5. Open PowerShell and verify:
```powershell
psql --version
```

### Create Database
```powershell
# Open PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE learnsphere_db;

# Exit
\q
```

**Or use pgAdmin GUI**:
- Open pgAdmin
- Right-click Databases → Create → Database
- Name: `learnsphere_db`

---

## Step 2: Update Backend Configuration (if needed)

If your PostgreSQL password is NOT `root`, update:

**File**: `src/main/resources/application.properties`

```properties
spring.datasource.username=postgres
spring.datasource.password=YOUR_PASSWORD  # Update here
```

---

## Step 3: Start the Backend

### Terminal 1 - Backend
```powershell
cd angularapp
mvn spring-boot:run
```

Expected output:
```
Started LearnSphereApplication in 10 seconds
Server started on port 8080
```

---

## Step 4: Start the Frontend

### Terminal 2 - Frontend  
```powershell
cd angularapp
npm install  # First time only
npm run start
```

Expected output:
```
✔ Compiled successfully
Application bundle generated successfully
```

---

## Step 5: Access the Application

Open browser and go to: **http://localhost:4200**

### Test Login
Use any of these test accounts (system creates on first run):
- Email: `student@test.com` | Password: `password` | Role: STUDENT
- Email: `instructor@test.com` | Password: `password` | Role: INSTRUCTOR
- Email: `admin@test.com` | Password: `password` | Role: ADMIN

---

## System Status Check

### Backend Running?
```powershell
curl http://localhost:8080/api/courses
# Should return: [] or list of courses
```

### Database Connected?
Look for backend logs:
```
Successful connection to database
```

### Frontend Ready?
```
Angular Live Development Server
Listening on http://localhost:4200
```

---

## What Was Changed/Configured

### Backend Changes ✅
- CORS enabled for Angular dev server
- JWT authentication configured
- PostgreSQL connection setup
- All REST endpoints ready

### Frontend Changes ✅
- Authentication service updated for JWT tokens
- HTTP interceptor added for auth headers
- All services aligned with backend endpoints
- Error handling enhanced

### Database ✅
- PostgreSQL configured (not MySQL)
- Auto table creation via Hibernate
- Connection pooling enabled

---

## Troubleshooting

### ❌ Backend won't start
```
Error: Failed to configure a DataSource
→ Solution: Verify PostgreSQL is running and database exists
```

```
Error: Port 8080 already in use
→ Solution: Kill existing process or change port in application.properties
```

### ❌ Frontend won't connect to backend
```
Error: CORS blocked or connection refused
→ Solution: Ensure backend is running on port 8080
→ Check: http://localhost:8080/api/courses should work
```

### ❌ Login fails with "Invalid email" or "Invalid password"
```
→ Solution: Database not initialized yet
→ Action: Check backend logs for initialization errors
→ Wait 5-10 seconds after backend starts
```

### ❌ PostgreSQL password incorrect
```
FATAL: password authentication failed
→ Solution: Update password in application.properties
→ Or reset PostgreSQL password and update config
```

---

## Common Commands

### View PostgreSQL Databases
```powershell
psql -U postgres -l
```

### Connect to LearnSphere DB
```powershell
psql -U postgres -d learnsphere_db
```

### Backup Database
```powershell
pg_dump -U postgres -d learnsphere_db > backup.sql
```

### Stop Backend
```
Press Ctrl+C in Terminal 1
```

### Stop Frontend  
```
Press Ctrl+C in Terminal 2
```

### Clean Build
```powershell
cd angularapp
mvn clean install
npm install
```

---

## API Testing

### Using curl or Postman

**Login**:
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@test.com\",\"password\":\"password\"}"
```

**Get Courses**:
```bash
curl -X GET http://localhost:8080/api/courses \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Next Steps

1. ✅ Configure PostgreSQL
2. ✅ Start Backend  
3. ✅ Start Frontend
4. 📱 Access at http://localhost:4200
5. 📝 Create first course
6. 👥 Enroll students
7. 📚 Add course content

---

## Documentation Files

- 📖 **INTEGRATION_GUIDE.md** - Complete technical integration details
- 🐘 **POSTGRESQL_SETUP.md** - PostgreSQL setup and troubleshooting
- 📚 **docs/** - Additional documentation

---

## Architecture Overview

```
┌─ Angular App (4200) ─┐
│                       │
│ HTTP Requests with JWT
│                       │
└─────────────┬─────────┘
              │
              ↓
    ┌─────────────────┐
    │ Spring Boot API │
    │    (8080)       │
    └─────────────────┘
              │
              ↓
    ┌─────────────────┐
    │  PostgreSQL DB  │
    │   (5432)        │
    └─────────────────┘
```

---

## Support

If you encounter any issues:
1. Check PostgreSQL is running
2. Verify backend logs for errors
3. Check browser console (F12) for frontend errors
4. Review INTEGRATION_GUIDE.md for detailed API information

---

## Success! 🎉

Your LearnSphere application is now ready for development!

- Frontend: http://localhost:4200
- Backend API: http://localhost:8080/api
- Database: learnsphere_db (PostgreSQL)

Happy coding! 🚀
