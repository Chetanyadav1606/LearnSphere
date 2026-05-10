# ❓ Entities: Question & Student Answer
**Assigned to:** Vishank

> All fields below are taken directly from the actual Java entity classes in the backend (`Question.java`, `StudentAnswer.java`).

---

## 1. Question

### What is a Question?
A **Question** is a single item within a **Test**. It presents a problem or prompt to the student and expects a response. The question type determines how it is displayed and how it is graded.

### Entity: `question` table

| Field | Java Type | DB Column | Description |
|---|---|---|---|
| `questionId` | `Long` | `question_id` (PK) | Auto-generated unique identifier |
| `test` | `Test` (ManyToOne) | `test_id` (FK, NOT NULL) | The test this question belongs to |
| `body` | `String` (TEXT) | `body` | The question text/prompt |
| `questionType` | `String` | `question_type` | Type: `MCQ`, `TEXT`, or `TF` (True/False) |
| `marks` | `Integer` | `marks` | Points awarded for a correct answer |
| `correctAnswer` | `String` (TEXT) | `correct_answer` | The correct answer (stored as text — for MCQ: the correct option value; for TF: "true"/"false"; for TEXT: model answer) |
| `extra` | `String` (JSON) | `extra` | JSON field for additional data — e.g., MCQ options list |

> **Note:** There is **no** separate `QuestionOption` table. MCQ options are stored in the `extra` JSON field. There is also no `orderIndex`, `explanation`, or `imageUrl` in the current entity.

### The `extra` JSON Field
The `extra` field (stored as `json` in the DB) holds type-specific data:

- **For MCQ**: a JSON array of option strings  
  ```json
  ["Option A", "Option B", "Option C", "Option D"]
  ```
- **For TF**: typically not used (only two fixed options: true/false)
- **For TEXT**: could hold hints or word limits

### Question Types
| `questionType` | Description | Grading |
|---|---|---|
| `MCQ` | Multiple Choice — one correct option from `extra` | Auto-graded via `correctAnswer` |
| `TF` | True/False | Auto-graded via `correctAnswer` ("true" or "false") |
| `TEXT` | Free-text written answer | Manual grading by instructor |

### Relationships
- A **Question** belongs to one **Test**
- A **Question** has many **StudentAnswers** (one per test attempt)

### Business Rules
- `test_id` is non-null — a question must always belong to a test
- `marks` must be > 0
- For `MCQ` questions, `extra` must contain valid JSON and `correctAnswer` must match one of the options
- For `TF`, `correctAnswer` must be `"true"` or `"false"`
- `correctAnswer` must **never** be sent to the client before the test is submitted — hide it in the API response

### API Endpoints (suggested)
```
GET    /api/questions/:id           → Get question (correctAnswer hidden for students)
POST   /api/tests/:id/questions     → Add question to a test
PUT    /api/questions/:id           → Update question
DELETE /api/questions/:id           → Delete question
GET    /api/tests/:id/questions     → Get all questions in a test
```

---

## 2. Student Answer

### What is a Student Answer?
A **StudentAnswer** records the response a student gave to a specific **Question** during a **TestAttempt**. It stores what the student wrote or selected, and how many marks were awarded.

### Entity: `student_answer` table

| Field | Java Type | DB Column | Description |
|---|---|---|---|
| `studentAnswerId` | `Long` | `student_answer_id` (PK) | Auto-generated unique identifier |
| `attempt` | `TestAttempt` (ManyToOne) | `attempt_id` (FK, NOT NULL) | The test attempt this answer belongs to |
| `question` | `Question` (ManyToOne) | `question_id` (FK, NOT NULL) | The question being answered |
| `answerText` | `String` (TEXT) | `answer_text` | The student's written or selected answer |
| `marksAwarded` | `BigDecimal(8,2)` | `marks_awarded` | Marks given for this answer (null until graded) |

> **Note:** There is **no** `selectedOptionId`, `isCorrect`, or `answeredAt` field. All answers — including MCQ — are stored as text in `answerText`.

### How Answers Are Stored by Type
| Question Type | `answerText` content |
|---|---|
| `MCQ` | The text of the selected option (e.g., `"Option B"`) |
| `TF` | `"true"` or `"false"` |
| `TEXT` | The student's free-form written response |

### Relationships
- A **StudentAnswer** belongs to one **TestAttempt**
- A **StudentAnswer** belongs to one **Question**

### Grading Flow
```
MCQ / TF  → answerText is compared to question.correctAnswer (server-side)
            → if match: marksAwarded = question.marks
            → if no match: marksAwarded = 0

TEXT      → marksAwarded = null (pending manual review)
            → Instructor sets marksAwarded via PATCH /api/answers/:id/grade
```

### Business Rules
- `attempt_id` and `question_id` are non-null
- `marksAwarded` is `null` until graded; use `BigDecimal(8,2)` for precision
- MCQ/TF answers are auto-graded server-side on submission
- TEXT answers require manual grading — `marksAwarded` stays `null` until the instructor acts
- The sum of all `marksAwarded` in an attempt = `TestAttempt.score`

### API Endpoints (suggested)
```
POST   /api/attempts/:id/answers       → Submit answers for an attempt
GET    /api/attempts/:id/answers       → Get all answers in an attempt (instructor/admin)
PATCH  /api/answers/:id/grade          → Instructor: manually set marksAwarded
```

---

## Relationship Diagram
```
Test
  └── Question (many)
        └── StudentAnswer (many) → TestAttempt
```

---

## Notes for Development
- **Never** expose `question.correctAnswer` to the client before the attempt is submitted
- `extra` is stored as a `json` column — parse it in the service layer, not the entity
- For MCQ grading, do a case-insensitive or trimmed string comparison between `answerText` and `correctAnswer`
- Recalculate `TestAttempt.score` after all auto-gradable answers are processed
