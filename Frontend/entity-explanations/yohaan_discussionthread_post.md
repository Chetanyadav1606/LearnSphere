# 💬 Entities: Discussion Thread & Post
**Assigned to:** Yohaan

> All fields below are taken directly from the actual Java entity classes in the backend (`DiscussionThread.java`, `Post.java`).

---

## 1. Discussion Thread

### What is a Discussion Thread?
A **DiscussionThread** is a top-level conversation topic attached to a **Course**. It is started by a user (student or instructor) and acts as a container for **Posts** (replies). Think of it like a forum thread within a course.

### Entity: `discussion_thread` table

| Field | Java Type | DB Column | Description |
|---|---|---|---|
| `threadId` | `Long` | `thread_id` (PK) | Auto-generated unique identifier |
| `course` | `Course` (ManyToOne) | `course_id` (FK) | The course this thread belongs to |
| `user` | `UserAccount` (ManyToOne) | `user_id` (FK) | The user who created the thread |
| `title` | `String` | `title` | Subject/title of the thread |
| `content` | `String` (TEXT) | `content` | Body/opening message of the thread |
| `createdAt` | `LocalDateTime` | `created_at` | Auto-set on creation, not updatable |
| `updatedAt` | `LocalDateTime` | `updated_at` | Last modified timestamp |

### Relationships
- A **DiscussionThread** belongs to one **Course**
- A **DiscussionThread** belongs to one **UserAccount** (the creator)
- A **DiscussionThread** has many **Posts** (replies)

### Business Rules
- A thread requires both a `title` and a `content` (non-null)
- `createdAt` is set automatically via `LocalDateTime.now()` — never set by the client
- `updatedAt` should be updated whenever the thread title or content is edited
- Only the thread creator or an admin/moderator can edit or delete a thread
- Deleting a thread should cascade-delete all its **Posts**

### API Endpoints (suggested)
```
GET    /api/threads/:id               → Get thread + posts
POST   /api/courses/:id/threads       → Create thread in a course
PUT    /api/threads/:id               → Update thread (creator/admin only)
DELETE /api/threads/:id               → Delete thread + its posts
GET    /api/courses/:id/threads       → List all threads in a course
```

---

## 2. Post

### What is a Post?
A **Post** is a reply within a **DiscussionThread**. Posts support **nested replies** — a post can have a `parentPost`, enabling threaded discussions (reply-to-reply).

### Entity: `post` table

| Field | Java Type | DB Column | Description |
|---|---|---|---|
| `postId` | `Long` | `post_id` (PK) | Auto-generated unique identifier |
| `thread` | `DiscussionThread` (ManyToOne) | `thread_id` (FK, NOT NULL) | The thread this post belongs to |
| `user` | `UserAccount` (ManyToOne) | `user_id` (FK, NOT NULL) | The user who wrote the post |
| `body` | `String` (TEXT) | `body` | The text content of the post |
| `parentPost` | `Post` (ManyToOne, nullable) | `parent_post_id` (FK) | Parent post for nested replies (null = top-level) |
| `createdAt` | `LocalDateTime` | `created_at` | Auto-set on creation, not updatable |

### Relationships
- A **Post** belongs to one **DiscussionThread**
- A **Post** belongs to one **UserAccount** (author)
- A **Post** can optionally belong to another **Post** (`parentPost`) — enables threaded replies
- A **Post** can have many child **Posts** (replies to it)

### Business Rules
- `thread_id` and `user_id` are non-null — a post must always have a thread and an author
- `parentPost` is nullable — null means the post is a direct reply to the thread; non-null means it's a nested reply
- `body` should not be empty or blank
- `createdAt` is auto-set and should never be editable by the client
- Only the post author or an admin can edit/delete a post

### API Endpoints (suggested)
```
POST   /api/threads/:id/posts         → Create post in a thread
PUT    /api/posts/:id                 → Edit post (author/admin only)
DELETE /api/posts/:id                 → Delete post
GET    /api/threads/:id/posts         → Get all posts in a thread
```

---

## Nested Reply Example
```
Thread: "How does polymorphism work?"
├── Post (top-level): "It's when a subclass overrides a parent method..."
│       └── Post (reply): "So is this the same as method overriding?"
│               └── Post (reply): "Yes, but also includes interfaces..."
└── Post (top-level): "Check this link for a good explanation..."
```

---

## Relationship Diagram
```
Course
  └── DiscussionThread (many)
            └── Post (many)
                  └── Post.parentPost → Post (self-referential, optional)
```

---

## Notes for Development
- When fetching posts for a thread, sort by `createdAt ASC` and nest replies under their `parentPost`
- `parentPost` creates a **self-referential** relationship in the `post` table — handled in Java as `@ManyToOne @JoinColumn(name = "parent_post_id")` pointing to itself
- Implement a **soft delete** to preserve thread structure when a parent post is removed
