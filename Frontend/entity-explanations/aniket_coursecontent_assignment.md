# 📗 Entities: Course Content & Assignment
**Assigned to:** Aniket

> All fields below are taken directly from the actual Java entity classes in the backend (`CourseContent.java`, `Assignment.java`).

---

## 1. Course Content

### What is Course Content?
**CourseContent** represents the actual learning material inside a **Module**. It can be a video, PDF, or quiz. It is the atomic unit that a student consumes to make progress in a course.

### Entity: `course_content` table

| Field | Java Type | DB Column | Description |
|---|---|---|---|
| `contentId` | `Long` | `content_id` (PK) | Auto-generated unique identifier |
| `module` | `Module` (ManyToOne) | `module_id` (FK, NOT NULL) | The module this content belongs to |
| `contentType` | `String` | `content_type` | Type of content: `VIDEO`, `PDF`, `QUIZ` |
| `title` | `String` | `title` | Name/label of the content item |
| `filePath` | `String` (TEXT) | `file_path` | Storage path or URL to the file |
| `durationSeconds` | `Integer` | `duration_seconds` | Length of the content in seconds (for videos) |
| `position` | `Integer` | `position` | Order/sequence within the module |
| `uploadedAt` | `LocalDateTime` | `uploaded_at` | Auto-set on creation, not updatable |

### Relationships
- **CourseContent** belongs to one **Module**
- **CourseContent** is tracked in **UserProgress** (one record per student per content item)

### Business Rules
- `module_id` is non-null — content must always belong to a module
- `contentType` should be one of `VIDEO`, `PDF`, or `QUIZ`
- `position` determines the order content appears within its module
- `durationSeconds` is used by **UserProgress** to calculate how much has been watched
- `uploadedAt` is auto-set and must never be set by the client

### API Endpoints (suggested)
```
GET    /api/contents/:id              → Get content item
POST   /api/modules/:id/contents      → Add content to a module
PUT    /api/contents/:id              → Update content metadata
DELETE /api/contents/:id              → Delete content item
```

---

## 2. Assignment

### What is an Assignment?
An **Assignment** is a task given to students as part of a **Module**. Students must produce and submit work by a deadline, after which it can be graded.

> **Important:** In this project, `Assignment` belongs to a **Module** (not directly to a Course).

### Entity: `assignment` table

| Field | Java Type | DB Column | Description |
|---|---|---|---|
| `assignmentId` | `Long` | `assignment_id` (PK) | Auto-generated unique identifier |
| `module` | `Module` (ManyToOne) | `module_id` (FK, NOT NULL) | The module this assignment belongs to |
| `title` | `String` | `title` (NOT NULL) | Assignment name |
| `description` | `String` (TEXT) | `description` | Detailed instructions for the assignment |
| `maxMarks` | `Integer` | `max_marks` | Maximum marks that can be awarded |
| `dueDate` | `LocalDateTime` | `due_date` | Submission deadline |
| `createdAt` | `LocalDateTime` | `created_at` | Auto-set on creation, not updatable |

### Relationships
- An **Assignment** belongs to one **Module** (and indirectly to a Course through the module)
- An **Assignment** has many **AssignmentSubmissions** (one per student)

### Business Rules
- `title` and `module_id` are non-null — every assignment must have a name and belong to a module
- `dueDate` should be validated as a future date when creating the assignment
- `maxMarks` must be greater than 0
- `createdAt` is auto-set and must never be modified
- Each student may have only **one submission** per assignment

### API Endpoints (suggested)
```
GET    /api/assignments/:id               → Get assignment details
POST   /api/modules/:id/assignments       → Create assignment under a module
PUT    /api/assignments/:id               → Update assignment
DELETE /api/assignments/:id               → Delete assignment
GET    /api/assignments/:id/submissions   → Get all submissions for this assignment
```

---

## Relationship Diagram
```
Course
  └── Module (many)
        ├── CourseContent (many, ordered by position)
        │       └── UserProgress (per student)
        └── Assignment (many)
                └── AssignmentSubmission (per student)
```

---

## Notes for Development
- `filePath` in `CourseContent` is stored as `TEXT` — use cloud storage paths (e.g., S3 keys) not raw file system paths
- `durationSeconds` enables the progress bar and resume feature for videos
- Assignment `dueDate` should be stored and compared as UTC in the backend
- When a module is deleted, decide whether to cascade-delete its content and assignments or prevent deletion if submissions exist
