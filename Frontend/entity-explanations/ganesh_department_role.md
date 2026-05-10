# 🏛️ Entities: Department & Role
**Assigned to:** Ganesh

> All fields below are taken directly from the actual Java entity classes in the backend (`Department.java`, `Role.java`).

---

## 1. Department

### What is a Department?
A **Department** is an organisational unit within the institution. Courses and user accounts are grouped under departments. It provides structure to categorise academic content and users.

### Entity: `department` table

| Field | Java Type | DB Column | Description |
|---|---|---|---|
| `departmentId` | `Integer` | `department_id` (PK) | Auto-generated unique identifier |
| `name` | `String` | `name` (NOT NULL, UNIQUE) | Department name (e.g., "Computer Science") |
| `createdAt` | `LocalDateTime` | `created_at` | Auto-set on creation via `@PrePersist`, not updatable |

> **Note:** The `Department` entity is intentionally lean — only `name` and `createdAt`. Fields like `code`, `headOfDepartment`, `logoUrl` are **not** present in the current schema.

### Relationships
- A **Department** has many **Courses** (`Course.department`)
- A **Department** has many **UserAccounts** (`UserAccount.department`)

### Business Rules
- `name` must be unique across all departments — enforced by `@Column(unique = true)`
- `name` is non-null — every department must have a name
- `createdAt` is auto-set via `@PrePersist` and must never be changed by the client
- Deactivating or deleting a department should be done carefully — courses and users still reference it

### API Endpoints (suggested)
```
GET    /api/departments              → List all departments
POST   /api/departments              → Create department (admin only)
GET    /api/departments/:id          → Get department by ID
PUT    /api/departments/:id          → Update department name
DELETE /api/departments/:id          → Delete department (admin only)
GET    /api/departments/:id/courses  → Get all courses in a department
```

---

## 2. Role

### What is a Role?
A **Role** defines a named access level within the system. Every user is assigned one or more roles via the `UserRole` join table that determines what they can do on the platform.

### Entity: `role` table

| Field | Java Type | DB Column | Description |
|---|---|---|---|
| `roleId` | `Integer` | `role_id` (PK) | Auto-generated unique identifier |
| `name` | `String` | `name` (NOT NULL, UNIQUE) | Role identifier (e.g., `ADMIN`, `INSTRUCTOR`, `STUDENT`) |

> **Note:** `Role` is a simple two-field entity. There are no `permissions`, `description`, or `isSystemRole` fields — keep the implementation accordingly.

### Common Role Names
| `name` value | Intended purpose |
|---|---|
| `ADMIN` | Full system access |
| `INSTRUCTOR` | Creates and manages courses, tests, assignments |
| `STUDENT` | Enrolls in courses, takes tests, submits assignments |

### Relationships
- A **Role** is referenced by many **UserRole** join records
- A **UserRole** links one **UserAccount** to one **Role**

### Business Rules
- `name` must be unique — enforced by `@Column(unique = true)`
- `name` is non-null
- Roles are typically seeded at startup (e.g., via a `DataInitializer`) — not created at runtime by regular users
- Only Admins should be able to assign or revoke roles via the `UserRole` table

### API Endpoints (suggested)
```
GET    /api/roles              → List all roles (admin only)
POST   /api/roles              → Create a role (admin only)
DELETE /api/roles/:id          → Delete a role (admin only)
```

---

## Relationship Diagram
```
Department
    ├── Course (many) → via Course.department
    └── UserAccount (many) → via UserAccount.department

Role
    └── UserRole (many, join table)
            └── UserAccount (many)
```

---

## Notes for Development
- Both `Department` and `Role` are **lookup/reference** entities — they are read far more often than written
- Consider caching role lookups in the security filter chain since they are checked on every request
- Seed initial roles (`ADMIN`, `INSTRUCTOR`, `STUDENT`) via a `CommandLineRunner` or Flyway migration script
- `departmentId` is typed as `Integer` (not `Long`) in the entity — be consistent in DTOs and API responses
