# 🧪 Entities: Test & Test Attempt
**Assigned to:** Shubham

> All fields below are taken directly from the actual Java entity classes in the backend (`Test.java`, `TestAttempt.java`).

---

## 1. Test

### What is a Test?
A **Test** is a timed assessment within a **Course**. It evaluates the student's understanding of the material through a set of **Questions**. Tests can be quizzes, mid-terms, or final exams.

### Entity: `test` table

| Field | Java Type | DB Column | Description |
|---|---|---|---|
| `testId` | `Long` | `test_id` (PK) | Auto-generated unique identifier |
| `course` | `Course` (ManyToOne) | `course_id` (FK, NOT NULL) | The course this test belongs to |
| `title` | `String` | `title` | Name of the test (e.g., "Module 1 Quiz") |
| `durationMinutes` | `Integer` | `duration_minutes` | Time limit in minutes |
| `securityPolicy` | `String` | `security_policy` | Security settings string (e.g., for ExamGuard integration) |
| `scheduledAt` | `LocalDateTime` | `scheduled_at` | When the test opens (nullable = immediately available) |
| `createdAt` | `LocalDateTime` | `created_at` | Auto-set on creation, not updatable |

> **Note:** The current entity does **not** have `totalMarks`, `passingMarks`, `maxAttempts`, `isPublished`, `expiresAt`, or `createdBy`. The `securityPolicy` field is specific to this project's exam security system.

### Relationships
- A **Test** belongs to one **Course**
- A **Test** has many **Questions**
- A **Test** has many **TestAttempts** (one or more per student)

### Business Rules
- `course_id` is non-null — a test must always belong to a course
- If `scheduledAt` is set, the test is not accessible before that datetime
- `durationMinutes` defines the time window; the backend should enforce this server-side
- `createdAt` is auto-set and must never be changed

### API Endpoints (suggested)
```
GET    /api/tests/:id               → Get test details
POST   /api/courses/:id/tests       → Create test under a course
PUT    /api/tests/:id               → Update test
DELETE /api/tests/:id               → Delete test
GET    /api/tests/:id/questions     → Get all questions in a test
GET    /api/courses/:id/tests       → List all tests in a course
```

---

## 2. Test Attempt

### What is a Test Attempt?
A **TestAttempt** represents one sitting of a student taking a **Test**. It tracks start time, completion time, score, and current status. Each attempt links to the student's answers via **StudentAnswer** records.

### Entity: `test_attempt` table

| Field | Java Type | DB Column | Description |
|---|---|---|---|
| `attemptId` | `Long` | `attempt_id` (PK) | Auto-generated unique identifier |
| `user` | `UserAccount` (ManyToOne) | `user_id` (FK, NOT NULL) | The student attempting the test |
| `test` | `Test` (ManyToOne) | `test_id` (FK, NOT NULL) | The test being attempted |
| `startedAt` | `LocalDateTime` | `started_at` | When the student started the attempt |
| `completedAt` | `LocalDateTime` | `completed_at` | When the student finished (nullable until done) |
| `score` | `BigDecimal(8,2)` | `score` | Marks achieved in this attempt |
| `status` | `String` | `status` | `IN_PROGRESS`, `COMPLETED`, or `ABANDONED` |

> **Note:** Status values in the actual entity are `IN_PROGRESS`, `COMPLETED`, and `ABANDONED` — not `SUBMITTED` or `TIMED_OUT`.

### Relationships
- A **TestAttempt** belongs to one **Test** and one **UserAccount**
- A **TestAttempt** has many **StudentAnswers** (one per question)

### Business Rules
- `user_id` and `test_id` are non-null
- `status` transitions: `IN_PROGRESS → COMPLETED` (student submits) or `IN_PROGRESS → ABANDONED` (timed out / left)
- `completedAt` is null while `status = IN_PROGRESS`; set when the attempt is completed or abandoned
- `score` is calculated server-side from **StudentAnswer.marksAwarded** — never accept a client-sent score
- The backend should auto-transition to `ABANDONED` if `startedAt + durationMinutes` has elapsed

### Status Transitions
```
[Start attempt]     → status: IN_PROGRESS, startedAt: now, completedAt: null
[Student submits]   → status: COMPLETED, completedAt: now, score: calculated
[Timer runs out]    → status: ABANDONED, completedAt: now, score: calculated from answers so far
```

### API Endpoints (suggested)
```
POST   /api/tests/:id/attempts        → Start a new attempt
GET    /api/attempts/:id              → Get attempt details + answers
POST   /api/attempts/:id/submit       → Submit/complete the attempt
GET    /api/tests/:id/attempts/me     → Get my attempts for a test
GET    /api/tests/:id/attempts        → Admin: get all attempts for a test
```

---

## Relationship Diagram
```
Course
  └── Test (many)
        ├── Question (many)
        └── TestAttempt (many, per student)
                └── StudentAnswer (many, one per question)
```

---

## Notes for Development
- Use a **server-side timer**: record `startedAt`, and on submission check that `now <= startedAt + durationMinutes`
- `score` uses `BigDecimal(8,2)` — supports large values with 2 decimal precision
- `securityPolicy` on `Test` is likely used by the ExamGuard VS Code extension to enforce exam rules
- Consider adding an index on `(user_id, test_id)` for fast lookup of a student's attempts for a specific test
