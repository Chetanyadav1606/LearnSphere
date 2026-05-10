# 🚀 Running LearnSphere Backend — Step by Step

Your project is a **Spring Boot 4.0.2** backend (Java 21) using **PostgreSQL**, **JWT auth**, and **JPA/Hibernate**. Here's everything you need to do to get it running.

> [!IMPORTANT]
> **None of the required tools are currently installed on your system.** We need to install Java, Maven (optional — the project includes a Maven wrapper), and PostgreSQL before the app can run.

---

## Step 1: Install JDK 21

You need Java Development Kit 21 (required by `pom.xml`).

1. Download **JDK 21** from: https://adoptium.net/temurin/releases/?version=21&os=windows&arch=x64&package=jdk
2. Run the `.msi` installer
3. **During installation, check the box** to set `JAVA_HOME` and add to `PATH`
4. After installation, **open a new PowerShell terminal** and verify:
   ```powershell
   java -version
   ```
   You should see something like `openjdk version "21.x.x"`

---

## Step 2: Install PostgreSQL

The app is configured to connect to PostgreSQL on `localhost:5432`.

1. Download **PostgreSQL** from: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
2. Run the installer — select **PostgreSQL 16** (or latest)
3. During installation:
   - Set the **superuser password** to `resource01` (to match your `application.properties`)
   - Keep the **port** as `5432` (default)
   - Leave other settings as default
4. After installation, verify (open a new terminal):
   ```powershell
   psql --version
   ```

> [!TIP]
> If `psql` is not recognized, add PostgreSQL's `bin` folder to your `PATH`:
> - Default location: `C:\Program Files\PostgreSQL\16\bin`
> - Add it via: **Settings → System → About → Advanced system settings → Environment Variables → Path → Edit → New**

---

## Step 3: Create the Database

Once PostgreSQL is running, create the `learnsphere_db` database:

```powershell
psql -U postgres
```

Enter the password `resource01` when prompted, then run:

```sql
CREATE DATABASE learnsphere_db;
\q
```

> [!NOTE]
> The app's `application.properties` is already configured to connect to:
> - **URL**: `jdbc:postgresql://localhost:5432/learnsphere_db`
> - **Username**: `postgres`
> - **Password**: `resource01`
>
> If you set a different password during PostgreSQL installation, update line 12 in [application.properties](file:///c:/Users/cheta/Downloads/Learnshere-main/src/main/resources/application.properties#L12).

---

## Step 4: Build the Project

You don't need to install Maven separately — the project includes a Maven wrapper (`mvnw.cmd`).

Open PowerShell in the project folder and run:

```powershell
.\mvnw.cmd clean install -DskipTests
```

> [!WARNING]
> We use `-DskipTests` because the test dependencies (`spring-boot-starter-data-jpa-test`, etc.) may not exist in Spring Boot 4.0.2. This skips running tests and avoids potential resolution errors during the first build.

This will:
- Download all dependencies (first time will take a few minutes)
- Compile the Java source code
- Package the application into a `.jar` file

---

## Step 5: Run the Application

```powershell
.\mvnw.cmd spring-boot:run
```

The application will start on **`http://localhost:8080`**.

You should see output like:
```
Started LearnSphereApplication in X.XXX seconds
```

---

## Step 6: Test the API

### 6a. Register a User
```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/auth/register" -Method POST -ContentType "application/json" -Body '{"fullName":"John Doe","email":"john@example.com","password":"SecurePass123","role":"STUDENT"}'
```

### 6b. Login (get JWT token)
```powershell
$token = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"john@example.com","password":"SecurePass123"}'
Write-Host "Token: $token"
```

### 6c. Create a Department (authenticated)
```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/departments" -Method POST -ContentType "application/json" -Headers @{Authorization="Bearer $token"} -Body '{"name":"Computer Science"}'
```

---

## Quick Reference — Configuration Files

| File | Purpose |
|------|---------|
| [application.properties](file:///c:/Users/cheta/Downloads/Learnshere-main/src/main/resources/application.properties) | DB connection, JPA settings, server port |
| [pom.xml](file:///c:/Users/cheta/Downloads/Learnshere-main/pom.xml) | Dependencies & build config |
| [SecurityConfig.java](file:///c:/Users/cheta/Downloads/Learnshere-main/src/main/java/com/learnsphere/backend/security/SecurityConfig.java) | Security rules — `/api/auth/**` is public, everything else needs JWT |
| [JwtUtil.java](file:///c:/Users/cheta/Downloads/Learnshere-main/src/main/java/com/learnsphere/backend/security/JwtUtil.java) | JWT token generation & validation |

---

## ⚠️ Potential Issues

### Spring Boot 4.0.2 Compatibility
Your `pom.xml` references **Spring Boot 4.0.2**. This is a very recent version. If dependencies fail to resolve, you may need to downgrade to `3.4.x`:

```xml
<!-- In pom.xml, change line 9 -->
<version>3.4.5</version>
```

### Test Dependencies
The test dependencies (`spring-boot-starter-data-jpa-test`, `spring-boot-starter-webmvc-test`, etc.) may not exist as separate starters. The standard test starter is:
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>
```

---

## Ready to Start?

Tell me which step you're on and I'll help you execute it! I can run each command for you one at a time.
