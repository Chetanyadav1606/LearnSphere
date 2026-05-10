# LearnSphere Frontend-Backend Integration Guide

## Overview
This guide documents the complete integration between the Angular frontend and Spring Boot backend with PostgreSQL database.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Angular Application                       │
│              (Port 4200 - Development)                       │
│                                                               │
│  Services → HTTP Client → Proxy → Backend API                │
└─────────────────────────────────────────────────────────────┘
                           ↓
                    Proxy Configuration
                    (proxy.conf.json)
                    Forward /api → localhost:8080
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                Spring Boot Backend                           │
│              (Port 8080 - REST API)                          │
│                                                               │
│  REST Controllers → JPA Repositories → PostgreSQL            │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                       │
│              (localhost:5432 - learnsphere_db)               │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Changes Made

### 1. **CORS Configuration Added to Backend**
- **File**: `src/main/java/com/learnsphere/backend/security/SecurityConfig.java`
- **Change**: Added CORS configuration to allow requests from Angular development server
- **Allowed Origins**:
  - `http://localhost:4200`
  - `http://127.0.0.1:4200`
  - `http://localhost:3000`
  - `http://127.0.0.1:3000`
- **Allowed Methods**: GET, POST, PUT, DELETE, OPTIONS, PATCH
- **Max Age**: 3600 seconds

### 2. **Updated Auth Service**
- **File**: `angularapp/src/app/services/auth.service.ts`
- **Changes**:
  - Updated to handle JWT token string response from backend login
  - Added JWT token decoding to extract user information
  - Added `isAdmin()` method for role checking
  - Properly stores token and user info in localStorage

### 3. **Enhanced Auth Interceptor**
- **File**: `angularapp/src/app/services/auth.interceptor.ts`
- **Changes**:
  - Added error handling for 401 responses
  - Proper JWT token injection for authenticated requests
  - Automatic logout on token expiration
  - Skip token injection for auth endpoints

### 4. **Aligned Course Service with Backend Endpoints**
- **File**: `angularapp/src/app/services/course.service.ts`
- **Changes**:
  - Updated to match actual backend controller endpoints
  - Organized methods by functional groups (Courses, Modules, Content, Tests)
  - Removed non-existent endpoint calls
  - Added proper API endpoint paths

---

## Database Configuration

### PostgreSQL Setup

**Connection Details** (from `application.properties`):
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/learnsphere_db
spring.datasource.username=postgres
spring.datasource.password=root
spring.datasource.driver-class-name=org.postgresql.Driver
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=update
```

**Database Creation**:
```sql
CREATE DATABASE learnsphere_db;
```

**User Setup**:
- Username: `postgres`
- Password: `root`
- Database: `learnsphere_db`

---

## API Endpoints Overview

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login (returns JWT token)
- `POST /api/auth/activate` - Activate account

### Courses (`/api/courses`)
- `GET /api/courses` - Get all courses
- `GET /api/courses/published` - Get published courses only
- `POST /api/courses` - Create new course
- `PUT /api/courses/:id` - Update course
- `GET /api/courses/:id` - Get course details

### Content (`/api/content`)
- `POST /api/content/module` - Create course module
- `GET /api/content/module/course/:courseId` - Get modules for course
- `POST /api/content/item` - Add course content
- `GET /api/content/item/module/:moduleId` - Get content for module

### Tests (`/api/tests`)
- `POST /api/tests` - Create test
- `GET /api/tests/course/:courseId` - Get tests for course
- `POST /api/tests/question` - Add question to test
- `GET /api/tests/:testId/questions` - Get test questions
- `POST /api/tests/attempt` - Start test attempt
- `PUT /api/tests/attempt/:attemptId/submit` - Submit test attempt
- `POST /api/tests/answer` - Submit answer to question

### Enrollments (`/api/enrollments`)
- `POST /api/enrollments` - Enroll user in course
- `GET /api/enrollments/user/:userId` - Get user's enrollments
- `GET /api/enrollments/course/:courseId` - Get course enrollments

### Discussions (`/api/discussions`)
- `POST /api/discussions/thread` - Create discussion thread
- `GET /api/discussions/course/:courseId` - Get threads for course
- `POST /api/discussions/post` - Create post/reply
- `GET /api/discussions/thread/:threadId/posts` - Get posts for thread

### Feedback (`/api/feedback`)
- `POST /api/feedback` - Submit feedback
- `PUT /api/feedback/:id` - Update feedback
- `GET /api/feedback/course/:courseId` - Get course feedback

### Users (`/api/users`)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user

### Departments (`/api/departments`)
- `POST /api/departments` - Create department

---

## Security & Authentication

### JWT Token Flow
1. **Registration**: User registers → Backend creates account → System assigns default role
2. **Login**: 
   - User sends credentials (email, password)
   - Backend verifies credentials
   - Backend returns JWT token signed with HS256
   - Token contains email and role as claims
3. **Authenticated Requests**:
   - All API requests include `Authorization: Bearer <token>` header
   - Backend validates token using JwtFilter
   - Token expires after 1 hour

### Token Structure
```json
{
  "sub": "user@email.com",
  "role": "STUDENT|INSTRUCTOR|ADMIN",
  "iat": 1234567890,
  "exp": 1234571490
}
```

### CORS Security
- Angular dev server (localhost:4200) can make requests to backend
- Backend validates token on all protected endpoints
- Public endpoints: `/api/auth/**`
- Protected endpoints: All others

---

## Development Setup

### Prerequisites
- **Node.js** 18+ (for Angular)
- **Java 21** (for Spring Boot)
- **PostgreSQL 12+** (for database)
- **Maven 3.9.6** (for building)

### Environment Setup

#### 1. PostgreSQL Setup
```bash
# Create database
createdb learnsphere_db

# Or using PostgreSQL CLI
psql -U postgres
CREATE DATABASE learnsphere_db;
```

#### 2. Backend Setup
```bash
cd angularapp/backend
mvn clean install
```

#### 3. Angular Setup
```bash
cd angularapp
npm install
```

### Running the Application

#### Option 1: Full Stack (Development)
```bash
cd angularapp
npm run dev:full
```

This script:
1. Starts PostgreSQL (requires PostgreSQL service running)
2. Starts Spring Boot backend on port 8080
3. Starts Angular dev server on port 4200

#### Option 2: Individual Components

**Terminal 1 - Backend**:
```bash
cd angularapp/backend
mvn spring-boot:run
```

**Terminal 2 - Frontend**:
```bash
cd angularapp
npm run start
```

### Browser Access
- **Angular App**: http://localhost:4200
- **Backend API**: http://localhost:8080/api
- **Proxy**: Requests to /api are forwarded to backend by Angular dev server

---

## API Request/Response Examples

### Login
**Request**:
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response** (JWT Token):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyQGV4YW1wbGUuY29tIiwicm9sZSI6IlNUVURFTlQiLCJpYXQiOjE2OTQ3NzYwMDAsImV4cCI6MTY5NDc3OTYwMH0.signature...
```

### Get Courses
**Request**:
```bash
GET /api/courses
Authorization: Bearer <token>
```

**Response**:
```json
[
  {
    "courseId": 1,
    "title": "Introduction to Java",
    "description": "Learn Java basics",
    "isPublished": true,
    "createdAt": "2024-01-15T10:30:00"
  }
]
```

### Create Course
**Request**:
```bash
POST /api/courses
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Advanced Java",
  "description": "Master advanced Java concepts",
  "isPublished": false
}
```

---

## Troubleshooting

### CORS Errors
**Problem**: "Access to XMLHttpRequest blocked by CORS policy"
**Solution**: Ensure CORS is configured in SecurityConfig.java and backend is running

### 401 Unauthorized Errors
**Problem**: "Unauthorized" response from protected endpoints
**Solution**: 
- Verify token is valid and not expired
- Check that token is included in Authorization header
- Ensure user has appropriate role

### Connection Refused to Backend
**Problem**: "Cannot GET http://localhost:8080"
**Solution**:
- Verify backend is running: `mvn spring-boot:run`
- Check port 8080 is not blocked
- Verify proxy configuration in proxy.conf.json

### PostgreSQL Connection Issues
**Problem**: "FATAL: password authentication failed"
**Solution**:
- Verify PostgreSQL credentials in application.properties
- Ensure PostgreSQL service is running
- Check database exists: `psql -U postgres -l`

### JWT Token Decode Errors
**Problem**: "Error decoding token" in browser console
**Solution**:
- Verify token is valid JWT format
- Check token hasn't been modified
- Ensure token is not expired

---

## Performance Optimization

### Backend Optimizations
- JPA Hibernate lazy loading configured
- Database connection pooling enabled
- SQL query optimization in repositories
- Index on frequently queried columns

### Frontend Optimizations
- Angular lazy loading for routes
- HTTP interceptor caching
- RxJS subscription management
- Component change detection optimization

---

## Deployment Checklist

- [ ] PostgreSQL database created and initialized
- [ ] Backend environment variables configured
- [ ] CORS origins updated for production domain
- [ ] JWT secret key changed from default
- [ ] Database backups configured
- [ ] Frontend environment file updated with production API URL
- [ ] SSL/TLS certificates configured
- [ ] Backend JAR built: `mvn clean package`
- [ ] Frontend built: `npm run build`
- [ ] Application tested end-to-end

---

## Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Frontend | Angular | 17.x |
| Backend | Spring Boot | 4.0.2 |
| Database | PostgreSQL | 12+ |
| Java | OpenJDK | 21 |
| Node.js | NPM | 18+ |
| Authentication | JWT (jjwt) | 0.11.5 |
| Build Tool | Maven | 3.9.6 |

---

## File Structure

```
learnshere-main/
├── angularapp/
│   ├── src/
│   │   ├── app/
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.interceptor.ts
│   │   │   │   ├── course.service.ts
│   │   │   │   ├── enrollment.service.ts
│   │   │   │   ├── test.service.ts
│   │   │   │   ├── discussion.service.ts
│   │   │   │   └── feedback.service.ts
│   │   │   ├── guards/
│   │   │   │   └── auth.guard.ts
│   │   │   ├── pages/
│   │   │   ├── components/
│   │   │   ├── models/
│   │   │   └── app.config.ts
│   │   └── environments/
│   ├── proxy.conf.json
│   ├── package.json
│   └── scripts/
├── src/main/java/com/learnsphere/backend/
│   ├── controller/
│   │   ├── AuthController.java
│   │   ├── CourseController.java
│   │   ├── ContentController.java
│   │   ├── TestController.java
│   │   ├── EnrollmentController.java
│   │   ├── DiscussionController.java
│   │   ├── FeedbackController.java
│   │   ├── UserController.java
│   │   └── DepartmentController.java
│   ├── entity/
│   ├── repository/
│   ├── security/
│   │   ├── SecurityConfig.java
│   │   ├── JwtUtil.java
│   │   └── JwtFilter.java
│   └── LearnSphereApplication.java
├── src/main/resources/
│   └── application.properties
├── pom.xml
└── INTEGRATION_GUIDE.md
```

---

## Support & Resources

For more information:
- [Angular Documentation](https://angular.io/docs)
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [JWT Documentation](https://jwt.io/)

---

## Last Updated
May 8, 2026

**Integration Status**: ✅ Complete
- CORS configured
- PostgreSQL configured
- JWT authentication integrated
- All services aligned with backend endpoints
- Ready for development and deployment
