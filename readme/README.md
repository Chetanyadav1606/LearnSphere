<div align="center">

# 🌐 LearnSphere

### *Next-Generation Learning Management System*

[![Java](https://img.shields.io/badge/Java-21-orange?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.java.net/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-brightgreen?style=for-the-badge&logo=spring&logoColor=white)](https://spring.io/projects/spring-boot)
[![Angular](https://img.shields.io/badge/Angular-17-red?style=for-the-badge&logo=angular&logoColor=white)](https://angular.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![JWT](https://img.shields.io/badge/JWT-Secured-black?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

**A full-stack, enterprise-grade Learning Management System — built with Spring Boot, Angular, and PostgreSQL.**

[Overview](#-overview) • [Architecture](#-architecture) • [Setup Guide](#-setup-guide) • [API Reference](#-api-reference) • [Troubleshooting](#-troubleshooting)

---

</div>

## 📌 Overview

LearnSphere is a complete LMS platform covering the entire academic workflow — from user registration and course creation to assessments, discussion forums, and real-time progress tracking.

| Layer | Technology |
|---|---|
| **Frontend** | Angular 17, TypeScript |
| **Backend** | Java 21, Spring Boot 3.x, Spring Security |
| **Database** | PostgreSQL 12+ |
| **Auth** | JWT (Stateless) + BCrypt |
| **ORM** | Hibernate / JPA |
| **Build** | Maven (Backend), npm (Frontend) |

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **JWT Authentication** | Stateless token-based auth with role-based access (Student / Instructor / Admin) |
| 🏫 **Department Hierarchy** | Organize courses and users under academic departments |
| 📚 **Course Management** | Full CRUD — create, publish, manage modules and content items |
| 📝 **Assessment Engine** | MCQ, Text, and True/False questions with auto-grading |
| 📊 **Leaderboards** | Real-time global and departmental ranking |
| 💬 **Discussion Forums** | Threaded discussions per course with nested replies |
| 🎯 **Progress Tracking** | Per-student progress per content item |
| ⭐ **Feedback System** | Course ratings and review messages |
| 🔄 **Lifecycle Hooks** | `@PrePersist` for automatic timestamps and status |

---

## 🗂 Repository Structure

```
LearnSphere/
├── backend/              ← Spring Boot Java application
│   ├── src/
│   │   └── main/
│   │       ├── java/com/learnsphere/backend/
│   │       │   ├── controller/   ← REST API controllers
│   │       │   ├── entity/       ← JPA database models
│   │       │   ├── repository/   ← Data access layer
│   │       │   ├── security/     ← JWT, filters, config
│   │       │   ├── dto/          ← Request/Response DTOs
│   │       │   └── config/       ← App configuration
│   │       └── resources/
│   │           └── application.properties
│   ├── pom.xml
│   └── mvnw
│
├── Frontend/             ← Angular 17 application
│   ├── src/
│   │   ├── app/          ← Components, services, guards
│   │   └── environments/
│   ├── angular.json
│   └── package.json
│
├── server/               ← Node.js utility scripts
│   └── seed.js           ← Database seeding script
│
└── readme/               ← All documentation
    ├── README.md
    ├── QUICKSTART.md
    ├── POSTGRESQL_SETUP.md
    ├── INTEGRATION_GUIDE.md
    └── CHANGES_SUMMARY.md
```

---

## 🏗 Architecture

### 🗺️ Full System Overview

```mermaid
graph TB
    subgraph FE["🖥️  FRONTEND — Angular  localhost:4200"]
        direction TB
        UI1["🏠 Login / Register"]
        UI2["📚 Course Browser"]
        UI3["📖 Course Viewer"]
        UI4["📝 Test Engine"]
        UI5["💬 Discussions"]
        UI6["📊 Leaderboard"]
        UI7["🎓 Instructor Dashboard"]
        GUARD["🔒 Auth Guard"]
        INTERCEPTOR["🔁 HTTP Interceptor\n adds Bearer Token"]
    end

    subgraph SEC["🛡️  SECURITY LAYER"]
        direction TB
        JWTF["JWT Filter\n validates token on every request"]
        BCR["BCrypt\n password hashing"]
        CORS["CORS Config\n allow :4200"]
    end

    subgraph BE["⚙️  BACKEND — Spring Boot  localhost:8080"]
        direction TB
        AUTH["🔐 AuthController\n /api/auth/register\n /api/auth/login"]
        CC["📚 CourseController\n /api/courses"]
        CNT["📖 ContentController\n /api/content"]
        TC["📝 TestController\n /api/tests"]
        DC["💬 DiscussionController\n /api/discussions"]
        EC["✍️ EnrollmentController\n /api/enrollments"]
        FC["⭐ FeedbackController\n /api/feedback"]
        UC["👤 UserController\n /api/users"]
        DPC["🏫 DeptController\n /api/departments"]
    end

    subgraph ORM["📦  JPA / HIBERNATE ENTITIES"]
        direction LR
        E1[UserAccount]
        E2[Course]
        E3[Module]
        E4[CourseContent]
        E5[Test + Question]
        E6[TestAttempt]
        E7[Enrollment]
        E8[DiscussionThread]
        E9[Post]
        E10[Feedback]
        E11[Leaderboard]
    end

    subgraph DB["💾  PostgreSQL  localhost:5432"]
        PG[(learnsphere_db)]
    end

    UI1 -- "POST credentials" --> INTERCEPTOR
    UI2 & UI3 & UI4 & UI5 & UI6 & UI7 -- "API calls" --> INTERCEPTOR
    GUARD -- "check localStorage token" --> UI1
    INTERCEPTOR -- "HTTPS + Bearer JWT" --> CORS
    CORS --> JWTF
    JWTF -- "✅ valid" --> AUTH & CC & CNT & TC & DC & EC & FC & UC & DPC
    JWTF -- "❌ invalid → 401" --> FE
    AUTH --> BCR
    BCR --> E1
    CC --> E2
    CNT --> E3 & E4
    TC --> E5 & E6
    EC --> E7
    DC --> E8 & E9
    FC --> E10
    CC --> E11
    E1 & E2 & E3 & E4 & E5 & E6 & E7 & E8 & E9 & E10 & E11 --> PG

    style FE fill:#1e293b,color:#e2e8f0,stroke:#6366f1
    style SEC fill:#312e81,color:#e0e7ff,stroke:#818cf8
    style BE fill:#14532d,color:#dcfce7,stroke:#4ade80
    style ORM fill:#7c2d12,color:#fef3c7,stroke:#fbbf24
    style DB fill:#1e3a5f,color:#bfdbfe,stroke:#60a5fa
```

### Request Flow

```mermaid
sequenceDiagram
    participant U as User (Browser)
    participant A as Angular App
    participant J as JWT Filter
    participant C as Controller
    participant R as Repository
    participant D as PostgreSQL

    U->>A: Clicks Login
    A->>C: POST /api/auth/login
    C->>D: Validate credentials
    D-->>C: User record
    C-->>A: JWT Token
    A->>A: Store token in localStorage

    U->>A: Access protected page
    A->>J: HTTP Request + Bearer Token
    J->>J: Validate JWT
    J->>C: Authorized request
    C->>R: Query data
    R->>D: SQL via Hibernate
    D-->>R: Result set
    R-->>C: Entity objects
    C-->>A: JSON response
    A-->>U: Rendered page
```

### Database Entity Relationship

```mermaid
erDiagram
    USER_ACCOUNT {
        bigint userId PK
        string fullName
        string email
        string password
        timestamp createdAt
    }
    USER_ROLE {
        bigint id PK
        bigint userId FK
        string role
    }
    DEPARTMENT {
        bigint departmentId PK
        string name
    }
    COURSE {
        bigint courseId PK
        string title
        string description
        bigint departmentId FK
        bigint creatorId FK
        boolean isPublished
    }
    MODULE {
        bigint moduleId PK
        bigint courseId FK
        string title
        int position
    }
    COURSE_CONTENT {
        bigint contentId PK
        bigint moduleId FK
        string title
        string contentType
        string filePath
        int position
    }
    ENROLLMENT {
        bigint enrollmentId PK
        bigint userId FK
        bigint courseId FK
        float progress
        timestamp enrolledAt
    }
    TEST {
        bigint testId PK
        bigint courseId FK
        string title
        int durationMinutes
    }
    QUESTION {
        bigint questionId PK
        bigint testId FK
        string body
        string questionType
        string correctAnswer
        int marks
    }
    TEST_ATTEMPT {
        bigint attemptId PK
        bigint testId FK
        bigint userId FK
        string status
        float score
        timestamp startedAt
    }
    DISCUSSION_THREAD {
        bigint threadId PK
        bigint courseId FK
        bigint userId FK
        string title
        string content
    }
    POST {
        bigint postId PK
        bigint threadId FK
        bigint userId FK
        bigint parentPostId FK
        string body
    }
    FEEDBACK {
        bigint feedbackId PK
        bigint userId FK
        bigint courseId FK
        short rating
        string message
    }

    USER_ACCOUNT ||--o{ USER_ROLE : "has"
    USER_ACCOUNT ||--o{ ENROLLMENT : "enrolls in"
    USER_ACCOUNT ||--o{ COURSE : "creates"
    DEPARTMENT ||--o{ COURSE : "contains"
    COURSE ||--o{ MODULE : "has"
    MODULE ||--o{ COURSE_CONTENT : "has"
    COURSE ||--o{ ENROLLMENT : "has"
    COURSE ||--o{ TEST : "has"
    COURSE ||--o{ DISCUSSION_THREAD : "has"
    COURSE ||--o{ FEEDBACK : "receives"
    TEST ||--o{ QUESTION : "has"
    TEST ||--o{ TEST_ATTEMPT : "has"
    DISCUSSION_THREAD ||--o{ POST : "has"
```

### Role-Based Access Control

```mermaid
graph LR
    subgraph Roles["👥 Roles"]
        S["👨‍🎓 STUDENT"]
        I["👨‍🏫 INSTRUCTOR"]
    end

    subgraph SP["🎓 Student Permissions"]
        P1["Browse Published Courses"]
        P2["Enroll in Courses"]
        P3["Take Tests"]
        P4["View Score & Leaderboard"]
        P5["Join Discussions"]
        P6["Submit Feedback"]
    end

    subgraph IP["🏫 Instructor Permissions"]
        P7["Create & Publish Courses"]
        P8["Add Modules & Content"]
        P9["Create Tests & Questions"]
        P10["Grade Submissions"]
        P11["Manage Discussions"]
    end

    S --> P1
    S --> P2
    S --> P3
    S --> P4
    S --> P5
    S --> P6

    I --> P7
    I --> P8
    I --> P9
    I --> P10
    I --> P11
```

---

## 🚀 Setup Guide

### Prerequisites

Install the following before proceeding:

| Tool | Version | Download |
|---|---|---|
| **JDK** | 21+ | https://adoptium.net/ |
| **Maven** | 3.x | https://maven.apache.org/ |
| **Node.js** | 18+ | https://nodejs.org/ |
| **PostgreSQL** | 12+ | https://www.postgresql.org/download/ |
| **Git** | Any | https://git-scm.com/ |

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/Chetanyadav1606/LearnSphere.git
cd LearnSphere
```

---

### Step 2 — Set Up PostgreSQL

**Option A: Using psql (command line)**

```powershell
# Open psql as postgres user
psql -U postgres

# Inside psql, create the database
CREATE DATABASE learnsphere_db;

# Verify it exists
\l

# Exit
\q
```

**Option B: Using pgAdmin (GUI)**
1. Open pgAdmin from Start Menu
2. Connect to `localhost:5432`
3. Right-click **Databases** → **Create** → **Database**
4. Name: `learnsphere_db` → Click **Save**

---

### Step 3 — Configure the Backend

Open `backend/src/main/resources/application.properties`:

```properties
# Server
server.port=8080

# PostgreSQL
spring.datasource.url=jdbc:postgresql://localhost:5432/learnsphere_db
spring.datasource.username=postgres
spring.datasource.password=root           # ← Change to your PostgreSQL password

spring.datasource.driver-class-name=org.postgresql.Driver

# Hibernate — auto-creates tables on first run
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.open-in-view=false
```

> **Note:** If your PostgreSQL password is not `root`, update it here before starting the backend.

---

### Step 4 — Start the Backend

```powershell
cd backend
.\mvnw spring-boot:run
```

**Expected output:**
```
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
...
Started LearnSphereApplication in 8.5 seconds (process running for 9.1)
```

✅ Backend is running at **http://localhost:8080**

**Verify it works:**
```powershell
curl http://localhost:8080/api/courses
# Expected: [] (empty array)
```

---

### Step 5 — Start the Frontend

Open a **new terminal window**:

```powershell
cd Frontend
npm install          # First time only — installs all dependencies
npm run start
```

**Expected output:**
```
✔ Compiled successfully.
Angular Live Development Server is listening on localhost:4200
```

✅ Frontend is running at **http://localhost:4200**

---

### Step 6 — Seed Sample Data (Optional)

To populate the database with demo users, a sample course, test, and content:

```powershell
cd server
node seed.js
```

**Output:**
```
Registering Faculty...
Registering Student...
Creating Department...
Creating Course...
Creating Module...
Creating Content...
Creating Test...
Seeding complete!
==========================================
CREDENTIALS:
Faculty Email: faculty@learnsphere.com | Password: password123
Student Email: student@learnsphere.com | Password: password123
```

---

### Step 7 — Access the Application

Open your browser and go to: **http://localhost:4200**

| Role | Email | Password |
|---|---|---|
| Instructor | faculty@learnsphere.com | password123 |
| Student | student@learnsphere.com | password123 |

---

## Application Flow

```mermaid
flowchart TD
    A([User visits localhost:4200]) --> B{Logged in?}
    B -- No --> C[Login / Register Page]
    C --> D[POST /api/auth/login]
    D --> E[Receive JWT Token]
    E --> F[Store in localStorage]
    F --> G{User Role?}

    B -- Yes --> G

    G -- STUDENT --> H[Browse Courses]
    G -- INSTRUCTOR --> I[Manage Courses]
    G -- ADMIN --> J[Admin Dashboard]

    H --> K[Enroll in Course]
    K --> L[View Modules & Content]
    L --> M[Take Tests]
    M --> N[View Score & Leaderboard]

    I --> O[Create Course]
    O --> P[Add Modules]
    P --> Q[Add Content Items]
    Q --> R[Create Tests & Questions]
    R --> S[Grade Submissions]
```

---

## 🔌 API Reference

> All endpoints (except Auth) require the header: `Authorization: Bearer <jwt_token>`

### 🔐 Authentication

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/auth/register` | Register a new user | ❌ |
| POST | `/api/auth/login` | Login and get JWT token | ❌ |

**Register:**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"John Doe","email":"john@test.com","password":"pass123","role":"STUDENT"}'
```

**Login:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"pass123"}'
# Returns: JWT token string
```

---

### 🏫 Departments

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/departments` | Create department |
| GET | `/api/departments` | Get all departments |
| GET | `/api/departments/{id}` | Get department by ID |

---

### 📚 Courses

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/courses` | Create a new course |
| GET | `/api/courses` | Get all courses |
| GET | `/api/courses/published` | Get published courses only |
| GET | `/api/courses/{id}` | Get course by ID |
| PUT | `/api/courses/{id}` | Update course |
| DELETE | `/api/courses/{id}` | Delete course |

**Create Course:**
```json
POST /api/courses
{
  "title": "Introduction to Java",
  "description": "Learn Java from scratch",
  "isPublished": true,
  "department": { "departmentId": 1 },
  "creator": { "userId": 1 }
}
```

---

### 📖 Content Management

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/content/module` | Create a module |
| GET | `/api/content/module/course/{courseId}` | Get modules for a course |
| POST | `/api/content/item` | Add content item to module |
| GET | `/api/content/item/module/{moduleId}` | Get items in a module |

**Create Module:**
```json
POST /api/content/module
{
  "course": { "courseId": 1 },
  "title": "Getting Started",
  "position": 1
}
```

**Add Content Item:**
```json
POST /api/content/item
{
  "module": { "moduleId": 1 },
  "title": "Variables and Types",
  "contentType": "VIDEO",
  "filePath": "https://youtube.com/watch?v=example",
  "position": 1
}
```
> `contentType`: `VIDEO`, `PDF`, or `QUIZ`

---

### ✍️ Enrollments

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/enrollments` | Enroll in a course |
| GET | `/api/enrollments/user/{userId}` | Get user's enrollments |
| GET | `/api/enrollments/course/{courseId}` | Get all enrollments for course |

---

### 📝 Assessments

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/tests` | Create a test |
| GET | `/api/tests/course/{courseId}` | Get tests for a course |
| POST | `/api/tests/question` | Add question to test |
| POST | `/api/tests/attempt` | Start a test attempt |
| POST | `/api/tests/answer` | Submit an answer |
| PUT | `/api/tests/attempt/{id}/submit` | Submit test attempt |
| PUT | `/api/tests/attempt/{id}/grade` | Grade a submission |

> `questionType`: `MCQ`, `TEXT`, or `TRUE_FALSE`

---

### 💬 Discussions

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/discussions/thread` | Create discussion thread |
| GET | `/api/discussions/course/{courseId}` | Get threads for a course |
| POST | `/api/discussions/post` | Add post / reply |
| GET | `/api/discussions/thread/{id}/posts` | Get posts in a thread |

---

### ⭐ Feedback

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/feedback` | Submit feedback |
| GET | `/api/feedback/course/{courseId}` | Get feedback for a course |

---

## 🔒 Security Architecture

```mermaid
sequenceDiagram
    participant C as Client
    participant F as JwtFilter
    participant S as SecurityContext
    participant R as Controller

    C->>F: Request with Authorization header
    F->>F: Extract token from "Bearer <token>"
    F->>F: Validate JWT signature & expiry
    alt Valid Token
        F->>S: Set Authentication object
        S->>R: Forward request
        R-->>C: 200 OK + Response
    else Invalid / Expired
        F-->>C: 401 Unauthorized
    end
```

- **BCrypt** — Passwords are hashed before storage, never stored as plaintext
- **Stateless JWT** — No sessions on server; each request is self-contained
- **Role Guards** — Angular route guards prevent unauthorized page access
- **CORS** — Configured to allow only `http://localhost:4200` in development

---

## 🧪 Testing the API

### Using curl

```powershell
# 1. Register an instructor
curl -X POST http://localhost:8080/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{"fullName":"Prof. Smith","email":"prof@test.com","password":"pass123","role":"INSTRUCTOR"}'

# 2. Login and save token
$token = (curl -X POST http://localhost:8080/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"prof@test.com","password":"pass123"}').Content

# 3. Create a department
curl -X POST http://localhost:8080/api/departments `
  -H "Authorization: Bearer $token" `
  -H "Content-Type: application/json" `
  -d '{"name":"Computer Science"}'

# 4. Get all courses
curl http://localhost:8080/api/courses `
  -H "Authorization: Bearer $token"
```

### Using Postman

1. Import the base URL: `http://localhost:8080`
2. Set `Content-Type: application/json` in Headers
3. After login, copy the JWT token
4. Add header `Authorization: Bearer <your_token>` to protected requests

---

## ❗ Troubleshooting

### Backend won't start

| Error | Fix |
|---|---|
| `Failed to configure a DataSource` | PostgreSQL is not running. Start it via Services or `pg_ctl start` |
| `FATAL: password authentication failed` | Update `spring.datasource.password` in `application.properties` |
| `database "learnsphere_db" does not exist` | Run `CREATE DATABASE learnsphere_db;` in psql |
| `Port 8080 already in use` | Run `netstat -ano \| findstr :8080` and kill the process |

### Frontend won't start

| Error | Fix |
|---|---|
| `npm install` fails | Delete `node_modules/` folder and run `npm install` again |
| `ng: command not found` | Run `npm install -g @angular/cli` |
| Blank page at localhost:4200 | Check browser console (F12) for errors |

### API / Auth issues

| Error | Fix |
|---|---|
| `401 Unauthorized` | Token expired or missing — login again |
| `403 Forbidden` | Your role doesn't have access to this endpoint |
| `CORS blocked` | Make sure backend is running on port 8080 |
| Frontend can't reach backend | Check proxy config at `Frontend/proxy.conf.json` |

### Verify PostgreSQL is running (Windows)

```powershell
# Check if postgres service is running
Get-Service -Name "postgresql*"

# Start it if stopped
Start-Service -Name "postgresql-x64-16"  # Adjust version number
```

---

## 🤝 Contributing

1. 🍴 Fork the repository
2. 🌿 Create a feature branch: `git checkout -b feature/your-feature`
3. 💾 Commit your changes: `git commit -m 'feat: add your feature'`
4. 📤 Push to branch: `git push origin feature/your-feature`
5. 🔃 Open a Pull Request

**Guidelines:**
- Follow Java naming conventions
- Write unit tests for new endpoints
- Keep DTOs separate from entities
- Use meaningful commit messages (prefer `feat:`, `fix:`, `docs:` prefixes)

---

<div align="center">

### 👨‍💻 Developer

**Chetan Yadav**
*Lead Architect & Full-Stack Developer*

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Chetanyadav1606)

---

### ⭐ Star this repository if you find it helpful!

*Building the future of education, one commit at a time.* 🚀

</div>
