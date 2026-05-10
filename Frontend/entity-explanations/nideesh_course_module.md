# 📘 Entities: Course & Module
**Assigned to:** Nideesh

> All fields below are taken directly from the actual Java entity classes in the backend (`Course.java`, `Module.java`).

---

## 1. Course

### What is a Course?
A **Course** is the top-level educational unit in the platform. It represents a structured learning program that learners can enroll in. A course has a defined title, description, and a set of modules that guide the learner through a subject.

### Entity: `course` table

| Field | Java Type | DB Column | Description |
|---|---|---|---|
| `courseId` | `Long` | `course_id` (PK) | Auto-generated unique identifier |
| `title` | `String` | `title` (NOT NULL) | Name of the course |
| `description` | `String` (TEXT) | `description` | Detailed overview of the course |
| `imageUrl` | `String` (TEXT) | `image_url` | URL to the course cover image |
| `department` | `Department` (ManyToOne) | `department_id` (FK) | The department this course belongs to |
| `creator` | `UserAccount` (ManyToOne) | `creator_id` (FK) | The user (instructor/admin) who created it |
| `isPublished` | `Boolean` | `is_published` | Whether students can see and enroll (default: `false`) |
| `createdAt` | `LocalDateTime` | `created_at` | Auto-set on creation, not updatable |

> **Note:** `createdAt` and `isPublished` are both auto-initialised via `@PrePersist` — the client should not set them directly.

### Relationships
- A **Course** belongs to one **Department**
- A **Course** belongs to one **UserAccount** (`creator`)
- A **Course** has many **Modules**
- A **Course** has many **Enrollments**
- A **Course** has many **Tests**
- A **Course** has many **Leaderboard** entries
- A **Course** has many **Feedback** entries

### Business Rules
- `title` is non-null — every course must have a name
- A course cannot be enrolled in unless `isPublished = true`
- Only users with appropriate roles (Instructor/Admin) should create or update a course
- Deleting a course should cascade-delete or archive its modules

### API Endpoints (suggested)
```
GET    /api/courses              → List all published courses
POST   /api/courses              → Create a new course
GET    /api/courses/:id          → Get course by ID
PUT    /api/courses/:id          → Update course
DELETE /api/courses/:id          → Delete/archive course
GET    /api/courses/:id/modules  → Get all modules in a course
```

---

## 2. Module

### What is a Module?
A **Module** is a sub-unit of a Course. It groups related course content into a logical section with a defined order. For example, a "Web Development" course might have modules like "HTML Basics", "CSS Layouts", and "JavaScript Fundamentals".

### Entity: `module` table

| Field | Java Type | DB Column | Description |
|---|---|---|---|
| `moduleId` | `Long` | `module_id` (PK) | Auto-generated unique identifier |
| `course` | `Course` (ManyToOne) | `course_id` (FK, NOT NULL) | The course this module belongs to |
| `title` | `String` | `title` | Name of the module |
| `position` | `Integer` | `position` | Sequence/order within the course |
| `createdAt` | `LocalDateTime` | `created_at` | Auto-set on creation, not updatable |

### Relationships
- A **Module** belongs to one **Course**
- A **Module** has many **CourseContent** items
- A **Module** has many **Assignments**

### Business Rules
- Modules should be ordered by `position` when displayed
- Reordering modules updates `position` values across multiple records
- `course_id` is non-null — a module must always belong to a course

### API Endpoints (suggested)
```
GET    /api/modules/:id              → Get module by ID
POST   /api/courses/:id/modules      → Create module under a course
PUT    /api/modules/:id              → Update module
DELETE /api/modules/:id              → Delete module
GET    /api/modules/:id/contents     → Get all content items in this module
```

---

## Relationship Diagram
```
Department
    └── Course (many)
            └── Module (many, ordered by position)
                    ├── CourseContent (many)
                    └── Assignment (many)
```

---

## Notes for Development
- Use **optimistic UI updates** when reordering modules (drag-and-drop)
- Consider a **soft-delete** strategy for courses to preserve enrollment history
- The `position` field should be re-normalised on deletion to avoid gaps
- `imageUrl` is stored as `TEXT` in the DB — no character length limit
