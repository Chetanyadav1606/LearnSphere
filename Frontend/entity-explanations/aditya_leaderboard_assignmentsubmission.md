# 🏆 Entities: Leaderboard & Assignment Submission
**Assigned to:** Aditya

> All fields below are taken directly from the actual Java entity classes in the backend (`Leaderboard.java`, `AssignmentSubmission.java`).

---

## 1. Leaderboard

### What is the Leaderboard?
The **Leaderboard** tracks a student's performance ranking within a **Course**. Each record represents one student's standing in one course, storing their average test score and their computed rank both globally and within their department.

### Entity: `leaderboard` table

| Field | Java Type | DB Column | Description |
|---|---|---|---|
| `leaderboardId` | `Long` | `leaderboard_id` (PK) | Auto-generated unique identifier |
| `user` | `UserAccount` (ManyToOne) | `user_id` (FK, NOT NULL) | The student this entry belongs to |
| `course` | `Course` (ManyToOne) | `course_id` (FK, NOT NULL) | The course this ranking is for |
| `avgScore` | `BigDecimal(6,2)` | `avg_score` | The student's average score across all test attempts in this course |
| `globalRank` | `Integer` | `global_rank` | Rank among **all students** in this course |
| `deptRank` | `Integer` | `dept_rank` | Rank among students within the **same department** |
| `updatedAt` | `LocalDateTime` | `updated_at` | When this entry was last recalculated |

### Relationships
- **Leaderboard** belongs to one **UserAccount** (the student)
- **Leaderboard** belongs to one **Course**
- Rankings are derived from **TestAttempt** scores

### Business Rules
- There is **one leaderboard record per `(user, course)` pair** — enforce with a unique constraint
- `avgScore` = average of `TestAttempt.score` for completed attempts in this course
- `globalRank` = position when all enrolled students in the course are sorted by `avgScore DESC`
- `deptRank` = same but scoped to students from the same department as the user
- `updatedAt` should be refreshed every time a new `TestAttempt` is completed
- Ranks are **computed/recalculated** — they are not set manually by users

### Rank Calculation Example
```
Course: "Data Structures"
Students sorted by avgScore DESC:
1. Alice  → avgScore: 91.50 → globalRank: 1
2. Bob    → avgScore: 88.00 → globalRank: 2
3. Aditya → avgScore: 85.75 → globalRank: 3

deptRank is computed the same way, but only among students in the same department.
```

### API Endpoints (suggested)
```
GET    /api/courses/:id/leaderboard        → Get ranked leaderboard for a course
GET    /api/leaderboard/me                 → Get my leaderboard entries across all courses
```

---

## 2. Assignment Submission

### What is an Assignment Submission?
An **AssignmentSubmission** is a student's response to an **Assignment**. It holds the submitted content (text or file), the marks awarded by the instructor, and any written feedback.

### Entity: `assignment_submission` table

| Field | Java Type | DB Column | Description |
|---|---|---|---|
| `submissionId` | `Long` | `submission_id` (PK) | Auto-generated unique identifier |
| `assignment` | `Assignment` (ManyToOne) | `assignment_id` (FK, NOT NULL) | The assignment being submitted |
| `student` | `UserAccount` (ManyToOne) | `student_id` (FK, NOT NULL) | The student who submitted |
| `submissionText` | `String` (TEXT) | `submission_text` | Written/text-based answer content |
| `fileUrl` | `String` (TEXT) | `file_url` | URL to uploaded file (PDF, zip, etc.) |
| `marksAwarded` | `Integer` | `marks_awarded` | Marks given by the instructor after grading |
| `feedback` | `String` (TEXT) | `feedback` | Instructor's written feedback on the submission |
| `submittedAt` | `LocalDateTime` | `submitted_at` | Auto-set on creation, not updatable |

### Relationships
- **AssignmentSubmission** belongs to one **Assignment**
- **AssignmentSubmission** belongs to one **UserAccount** (the student, mapped as `student_id`)

### Business Rules
- `assignment_id` and `student_id` are non-null — a submission must always link to an assignment and a student
- A student should only have **one submission per assignment** — enforce with a unique constraint on `(student_id, assignment_id)` if required
- Either `submissionText` or `fileUrl` (or both) should be provided — at least one must be non-null
- `marksAwarded` starts as `null` — it is set by the instructor during grading
- `feedback` is also null until the instructor reviews and grades the submission
- `submittedAt` is auto-set via `LocalDateTime.now()` on creation and must **never** be changed

### Grading Workflow
```
Student submits → submissionText / fileUrl set, marksAwarded = null
Instructor reviews → sets marksAwarded (e.g., 85) and feedback ("Great work, but...")
Student can view their grade and feedback
```

### API Endpoints (suggested)
```
POST   /api/assignments/:id/submissions      → Submit an assignment
GET    /api/submissions/:id                  → Get submission details
GET    /api/assignments/:id/submissions      → Instructor: list all submissions
PATCH  /api/submissions/:id/grade            → Instructor: set marksAwarded + feedback
GET    /api/submissions/me                   → Student: get all my submissions
```

---

## Relationship Diagram
```
UserAccount
  ├── AssignmentSubmission (many) → Assignment → Course
  └── Leaderboard (many) → Course
```

---

## Notes for Development
- Leaderboard ranks should be recalculated **asynchronously** (e.g., via a scheduled job or event after each `TestAttempt` completion) — not on every API call
- `avgScore` uses `BigDecimal(6,2)` — supports values like `999.99`, with 2 decimal places of precision
- For `fileUrl`, use pre-signed cloud storage URLs (S3, GCS) for secure upload and download
- Consider adding a `gradedAt` timestamp to `AssignmentSubmission` to track when grading occurred
