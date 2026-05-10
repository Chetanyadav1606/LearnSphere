# 📈 Entities: Enrolment & User Progress
**Assigned to:** Anuj

> All fields below are taken directly from the actual Java entity classes in the backend (`Enrollment.java`, `UserProgress.java`).

---

## 1. Enrolment (Enrollment)

### What is an Enrolment?
An **Enrollment** records the relationship between a **User** and a **Course**, and the **role** they have in that course (student or instructor). When a user joins a course, an enrollment record is created.

### Entity: `enrollment` table

| Field | Java Type | DB Column | Description |
|---|---|---|---|
| `enrollmentId` | `Long` | `enrollment_id` (PK) | Auto-generated unique identifier |
| `user` | `UserAccount` (ManyToOne) | `user_id` (FK, NOT NULL) | The user who enrolled |
| `course` | `Course` (ManyToOne) | `course_id` (FK, NOT NULL) | The course they enrolled in |
| `role` | `String` | `role` (NOT NULL) | Role in this course: `STUDENT` or `INSTRUCTOR` |
| `enrolledAt` | `LocalDateTime` | `enrolled_at` | Auto-set on creation via `@PrePersist`, not updatable |

### Unique Constraint
`@UniqueConstraint(columnNames = {"user_id", "course_id", "role"})` — one record per user-course-role combination.

> **Important:** The actual entity has **no** `status`, `completionPercentage`, or `certificateUrl` fields. The `role` field within enrollment distinguishes whether the user is a student or instructor in that course.

### Relationships
- An **Enrollment** connects one **UserAccount** to one **Course**
- It is the prerequisite for **UserProgress** tracking (a student must be enrolled to have progress)

### Business Rules
- The unique constraint on `(user_id, course_id, role)` prevents duplicate enrollments in the same role
- `role` must be `STUDENT` or `INSTRUCTOR`
- `enrolledAt` is auto-set via `@PrePersist` and must never be modified
- A user with role `STUDENT` can take tests and submit assignments; `INSTRUCTOR` can create them

### API Endpoints (suggested)
```
POST   /api/enrollments                  → Enroll in a course (with a role)
GET    /api/enrollments/me               → Get my enrollments
DELETE /api/enrollments/:id              → Unenroll from a course
GET    /api/courses/:id/enrollments      → Admin: get all enrollments for a course
```

---

## 2. User Progress

### What is User Progress?
**UserProgress** tracks a student's progress on a specific **CourseContent** item. It records how many seconds of a video have been watched, the percentage completed, and when it was fully completed.

### Entity: `user_progress` table

| Field | Java Type | DB Column | Description |
|---|---|---|---|
| `progressId` | `Long` | `progress_id` (PK) | Auto-generated unique identifier |
| `user` | `UserAccount` (ManyToOne) | `user_id` (FK, NOT NULL) | The student whose progress this is |
| `content` | `CourseContent` (ManyToOne) | `content_id` (FK, NOT NULL) | The content item being tracked |
| `completedAt` | `LocalDateTime` | `completed_at` | Timestamp when the content was fully completed (nullable) |
| `progressPercent` | `BigDecimal(5,2)` | `progress_percent` | Percentage consumed — e.g., `96.67` (0.00–100.00) |
| `secondsWatched` | `Integer` | `seconds_watched` | Total seconds of video watched |

### Unique Constraint
`@UniqueConstraint(columnNames = {"user_id", "content_id"})` — one progress record per student per content item.

> **Note:** There is **no** `enrolmentId`, `status`, `watchedDuration`, or `lastAccessedAt` field in the actual entity. The field is `secondsWatched`, and completion is tracked via `completedAt` and `progressPercent`.

### Relationships
- **UserProgress** belongs to one **UserAccount**
- **UserProgress** belongs to one **CourseContent**

### Business Rules
- Only one record exists per `(user, content)` — if one exists, **update** it (upsert), do not insert again
- `progressPercent` is a `BigDecimal(5,2)` — values like `96.67`, `100.00`
- `completedAt` is `null` until the student finishes the content — typically set when `progressPercent >= 90.00`
- `secondsWatched` supports resume functionality for video content

### Progress Calculation Example
```
Content: "Intro to Java" — durationSeconds: 600
Student has watched: 555 seconds
secondsWatched = 555
progressPercent = (555 / 600) × 100 = 92.50%
completedAt = set (threshold ≥ 90%)
```

### API Endpoints (suggested)
```
POST   /api/progress                       → Upsert progress for a content item
GET    /api/progress/me                    → Get all my progress records
GET    /api/progress/content/:id           → Get my progress on a specific content item
```

---

## Relationship Diagram
```
UserAccount
    └── Enrollment (many) → Course
UserAccount
    └── UserProgress (many) → CourseContent → Module → Course
```

---

## Notes for Development
- Use an **upsert** strategy for progress updates — check if `(user_id, content_id)` exists, then update; else insert
- `BigDecimal(5,2)` supports a max of `999.99` — clamp input to `100.00` max
- Aggregate `progressPercent` across all content in a course to derive an overall completion percentage (not stored — computed on the fly)
