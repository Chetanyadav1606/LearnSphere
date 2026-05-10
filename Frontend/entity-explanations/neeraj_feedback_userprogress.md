# ⭐ Entities: Feedback & User Progress
**Assigned to:** Neeraj

> All fields below are taken directly from the actual Java entity classes in the backend (`Feedback.java`, `UserProgress.java`).

---

## 1. Feedback

### What is Feedback?
**Feedback** is a rating and comment that a student leaves on a **Course** after completing or while taking it. It helps instructors and admins understand how well a course is received and where improvements can be made.

### Entity: `feedback` table

| Field | Java Type | DB Column | Description |
|---|---|---|---|
| `feedbackId` | `Long` | `feedback_id` (PK) | Auto-generated unique identifier |
| `user` | `UserAccount` (ManyToOne) | `user_id` (FK, NOT NULL) | The student who left the feedback |
| `course` | `Course` (ManyToOne) | `course_id` (FK, NOT NULL) | The course being reviewed |
| `rating` | `Short` | `rating` | Numeric rating (e.g., 1–5) |
| `message` | `String` (TEXT) | `message` | Optional written comment/review |
| `createdAt` | `LocalDateTime` | `created_at` | Auto-set on creation, not updatable |

### Relationships
- **Feedback** belongs to one **UserAccount** (the reviewer)
- **Feedback** belongs to one **Course** (what is being reviewed)

### Business Rules
- `user_id` and `course_id` are non-null — feedback must always have an author and a course
- `rating` should be validated in the range **1 to 5** (inclusive) — enforce in service layer
- `message` is optional (nullable) — a user can submit a rating without a text comment
- `createdAt` is auto-set and must never be set by the client
- Typically, a user should only submit **one feedback per course** — enforce with a unique constraint on `(user_id, course_id)` if required by the team
- Average rating for a course can be computed: `AVG(rating) WHERE course_id = ?`

### API Endpoints (suggested)
```
POST   /api/courses/:id/feedback      → Submit feedback for a course
GET    /api/courses/:id/feedback      → Get all feedback for a course
GET    /api/feedback/:id              → Get specific feedback entry
DELETE /api/feedback/:id              → Delete feedback (admin/author only)
GET    /api/courses/:id/feedback/avg  → Get average rating for a course
```

---

## 2. User Progress

### What is User Progress?
**UserProgress** tracks how far along a student is within a specific **CourseContent** item. It records how many seconds of a video they've watched and whether they've completed it, enabling the system to resume playback and calculate overall course completion.

### Entity: `user_progress` table

| Field | Java Type | DB Column | Description |
|---|---|---|---|
| `progressId` | `Long` | `progress_id` (PK) | Auto-generated unique identifier |
| `user` | `UserAccount` (ManyToOne) | `user_id` (FK, NOT NULL) | The student whose progress this is |
| `content` | `CourseContent` (ManyToOne) | `content_id` (FK, NOT NULL) | The content item being tracked |
| `completedAt` | `LocalDateTime` | `completed_at` | Timestamp when marked as completed (nullable) |
| `progressPercent` | `BigDecimal(5,2)` | `progress_percent` | Percentage of content consumed (0.00–100.00) |
| `secondsWatched` | `Integer` | `seconds_watched` | Total seconds watched (for video content) |

### Unique Constraint
The table has a `@UniqueConstraint` on `(user_id, content_id)` — meaning **one record per user per content item**.

### Relationships
- **UserProgress** belongs to one **UserAccount**
- **UserProgress** belongs to one **CourseContent**

### Business Rules
- Only **one** progress record exists per `(user, content)` pair — if one exists, it should be **updated**, not inserted again (upsert pattern)
- `progressPercent` is a value from `0.00` to `100.00`
- `completedAt` is `null` until the student finishes the content — set when `progressPercent = 100`
- `secondsWatched` is used for video content to support resume functionality
- Aggregating all `UserProgress` records for a user in a course gives the overall course completion

### Progress Completion Example
```
Content: "Intro to Java" (video, 600 seconds)
Student watched: 580 seconds
secondsWatched = 580
progressPercent = (580 / 600) × 100 = 96.67%
completedAt = set (threshold: ≥ 90%)
```

### API Endpoints (suggested)
```
POST   /api/progress                       → Upsert progress for a content item
GET    /api/progress/me                    → Get all my progress records
GET    /api/progress/content/:id           → Get my progress on a specific content item
GET    /api/progress/course/:id/summary    → Admin: progress summary across all students
```

---

## Relationship Diagram
```
UserAccount
  ├── Feedback (many) → Course
  └── UserProgress (many) → CourseContent
```

---

## Notes for Development
- Use an **upsert** (`INSERT ... ON CONFLICT DO UPDATE` or JPA `merge`) for progress records to avoid duplicate inserts
- `BigDecimal(5,2)` for `progressPercent` means values like `96.67`, `100.00` — validate max is 100
- Feedback average rating is best computed in a **repository query** (`@Query`) rather than loading all records into memory
- Consider adding `updatedAt` to `UserProgress` if you want to track when progress was last recorded
