# 🔐 Entities: User Account & User Role (+ Auth)
**Assigned to:** Chetan

> All fields below are taken directly from the actual Java entity classes in the backend (`UserAccount.java`, `UserRole.java`).

---

## 1. User Account

### What is a User Account?
A **UserAccount** is the core identity entity in the system. It represents any person who interacts with the platform — students, instructors, or admins. Authentication and authorisation are built on top of this entity.

### Entity: `user_account` table

| Field | Java Type | DB Column | Description |
|---|---|---|---|
| `userId` | `Long` | `user_id` (PK) | Auto-generated unique identifier |
| `fullName` | `String` | `full_name` | Full display name of the user |
| `email` | `String` | `email` (NOT NULL, UNIQUE) | Email — used as the login identifier |
| `password` | `String` | `password` (NOT NULL) | Hashed password (stored via bcrypt, never plain text) |
| `department` | `Department` (ManyToOne) | `dept_id` (FK) | Department the user belongs to |
| `isActive` | `Boolean` | `is_active` | Whether the account is enabled (default: `true`) |
| `createdAt` | `LocalDateTime` | `created_at` | Auto-set on creation via `@PrePersist`, not updatable |
| `lastLogin` | `LocalDateTime` | `last_login` | Timestamp of the most recent successful login |

> **Note:** There is **no** `firstName`/`lastName` split — the entity uses a single `fullName` field. There is also no `profilePictureUrl`, `isEmailVerified`, or `updatedAt` in the current schema.

### Authentication Flow
```
Register → Login → JWT Issued → Refresh Token Rotation
```

#### JWT Strategy
- **Access Token**: Short-lived (15 min), contains `userId`, `roles`, `dept_id`
- **Refresh Token**: Long-lived (7 days), stored securely (HttpOnly cookie or DB table)
- On each request: validate access token → if expired, use refresh token to reissue

#### Password Rules
- Stored as a `bcrypt` hash — **never** store or log plain text passwords
- The field is named `password` in Java (not `passwordHash`) but should always be treated as a hash

### Business Rules
- `email` must be unique — enforced by `@Column(unique = true)`
- `email` and `password` are non-null
- `isActive` defaults to `true` via `@PrePersist`; set to `false` to deactivate an account
- Deactivated accounts (`isActive = false`) should be rejected at login
- `lastLogin` should be updated every time a user successfully logs in
- `createdAt` is auto-set and must never be changed

### API Endpoints (suggested)
```
POST   /api/auth/register          → Register a new user
POST   /api/auth/login             → Login, returns JWT
POST   /api/auth/refresh           → Refresh access token
POST   /api/auth/logout            → Invalidate refresh token
GET    /api/users/me               → Get own profile
PUT    /api/users/me               → Update own profile (fullName, etc.)
GET    /api/users/:id              → Admin: get any user profile
PATCH  /api/users/:id/status       → Admin: activate/deactivate account
```

---

## 2. User Role

### What is a User Role?
**UserRole** is a **join/pivot table** that maps a `UserAccount` to a `Role`. It enables a single user to hold multiple roles (e.g., STUDENT and MODERATOR). The unique constraint on `(user_id, role_id)` prevents duplicate assignments.

### Entity: `user_role` table

| Field | Java Type | DB Column | Description |
|---|---|---|---|
| `userRoleId` | `Long` | `user_role_id` (PK) | Auto-generated unique identifier |
| `user` | `UserAccount` (ManyToOne) | `user_id` (FK, NOT NULL) | The user being assigned the role |
| `role` | `Role` (ManyToOne) | `role_id` (FK, NOT NULL) | The role being assigned |
| `assignedAt` | `LocalDateTime` | `assigned_at` | Auto-set when the role is assigned, not updatable |

### Unique Constraint
`@UniqueConstraint(columnNames = {"user_id", "role_id"})` — one record per user-role pair.

> **Note:** There is no `assignedBy` field in the current schema.

### Relationships
- **UserRole** links **UserAccount** ↔ **Role**
- One user can have multiple `UserRole` rows (one per role)
- One role can appear in multiple `UserRole` rows (many users can share a role)

### Business Rules
- Duplicate `(userId, roleId)` pairs are rejected by the unique constraint
- `user_id` and `role_id` are both non-null
- `assignedAt` is auto-set and must never be modified
- Only Admins should assign or revoke roles

### API Endpoints (suggested)
```
GET    /api/users/:id/roles          → List roles for a user
POST   /api/users/:id/roles          → Assign role to user (admin only)
DELETE /api/users/:id/roles/:roleId  → Remove role from user (admin only)
```

---

## Relationship Diagram
```
UserAccount
    ├── UserRole (many) → Role
    ├── Enrollment (many) → Course
    ├── AssignmentSubmission (many) → Assignment
    ├── TestAttempt (many) → Test
    ├── UserProgress (many) → CourseContent
    ├── Feedback (many) → Course
    └── Leaderboard (many) → Course
```

---

## Notes for Development
- Use Spring Security with a JWT filter for authentication
- Store refresh tokens in a `refresh_tokens` DB table to support revocation on logout
- Angular frontend: store access token **in memory** (not `localStorage`) to prevent XSS attacks
- Use `HttpOnly` cookies for the refresh token
- The `password` field must **never** be included in API responses — exclude via `@JsonIgnore`
