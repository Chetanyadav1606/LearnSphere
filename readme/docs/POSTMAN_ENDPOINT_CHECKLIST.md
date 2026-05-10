# Postman Endpoint Checklist

This file is a practical checklist for testing every current backend endpoint in this project with Postman.

Base URL:

```text
http://localhost:8080
```

Recommended Postman variables:

```text
baseUrl = http://localhost:8080
token =
studentUserId =
instructorUserId =
courseId =
moduleId =
assignmentId =
submissionId =
testId =
questionId =
attemptId =
threadId =
feedbackId =
contentId =
```

## Headers

Public auth endpoints do not need a token:

- `POST {{baseUrl}}/api/auth/register`
- `POST {{baseUrl}}/api/auth/login`
- `POST {{baseUrl}}/api/auth/activate`

Most other endpoints are protected. For those, send:

```text
Authorization: Bearer {{token}}
Content-Type: application/json
```

## Suggested Order

1. Register users
2. Login and save token
3. Create department
4. Create course
5. Create module
6. Add content
7. Create assignment
8. Create test
9. Add question
10. Enroll student
11. Submit assignment
12. Start test attempt
13. Submit answer
14. Submit test attempt
15. Check progress, feedback, discussions, leaderboard-related attempt APIs

## 1. Auth

### Register

`POST {{baseUrl}}/api/auth/register`

```json
{
  "fullName": "Instructor One",
  "email": "instructor1@example.com",
  "password": "password123",
  "role": "INSTRUCTOR"
}
```

Student example:

```json
{
  "fullName": "Student One",
  "email": "student1@example.com",
  "password": "password123",
  "role": "STUDENT"
}
```

### Login

`POST {{baseUrl}}/api/auth/login`

```json
{
  "email": "instructor1@example.com",
  "password": "password123"
}
```

Save:

- `token` from response
- `user.userId` into `instructorUserId` or `studentUserId`

### Activate Account

`POST {{baseUrl}}/api/auth/activate`

```json
{
  "code": "123456"
}
```

## 2. Users

### Create User

`POST {{baseUrl}}/api/users`

```json
{
  "fullName": "Manual User",
  "email": "manual@example.com",
  "password": "plain-text-for-dev-only"
}
```

### Get All Users

`GET {{baseUrl}}/api/users`

### Get User By ID

`GET {{baseUrl}}/api/users/{{studentUserId}}`

## 3. Departments

### Create Department

`POST {{baseUrl}}/api/departments`

```json
{
  "name": "Computer Science"
}
```

## 4. Courses

### Create Course

`POST {{baseUrl}}/api/courses`

```json
{
  "title": "Intro to Java",
  "description": "Java fundamentals course",
  "isPublished": true,
  "department": {
    "departmentId": 1
  },
  "creator": {
    "userId": {{instructorUserId}}
  }
}
```

Save returned `courseId`.

### Get All Courses

`GET {{baseUrl}}/api/courses`

### Get Published Courses

`GET {{baseUrl}}/api/courses/published`

### Get Instructor Courses

`GET {{baseUrl}}/api/courses/instructor/{{instructorUserId}}`

## 5. Content / Modules

### Create Module

`POST {{baseUrl}}/api/content/module`

```json
{
  "course": {
    "courseId": {{courseId}}
  },
  "title": "Week 1",
  "position": 1
}
```

Save returned `moduleId`.

### Get Modules By Course

`GET {{baseUrl}}/api/content/module/course/{{courseId}}`

### Add Content Item

`POST {{baseUrl}}/api/content/item`

```json
{
  "module": {
    "moduleId": {{moduleId}}
  },
  "contentType": "VIDEO",
  "title": "Lesson 1",
  "filePath": "https://example.com/video.mp4",
  "durationSeconds": 300,
  "position": 1
}
```

### Get Content By Module

`GET {{baseUrl}}/api/content/item/module/{{moduleId}}`

Save a returned `contentId` for progress testing.

## 6. Assignments

### Create Assignment

`POST {{baseUrl}}/api/assignments`

```json
{
  "module": {
    "moduleId": {{moduleId}}
  },
  "title": "Assignment 1",
  "description": "Solve the exercise and paste your answer.",
  "maxMarks": 10,
  "dueDate": "2026-04-30T18:00:00"
}
```

Save returned `assignmentId`.

### Get Assignments By Module

`GET {{baseUrl}}/api/assignments/module/{{moduleId}}`

### Submit Assignment

`POST {{baseUrl}}/api/assignments/submit`

```json
{
  "assignment": {
    "assignmentId": {{assignmentId}}
  },
  "student": {
    "userId": {{studentUserId}}
  },
  "submissionText": "My answer goes here",
  "fileUrl": "https://example.com/submission.pdf"
}
```

Save returned `submissionId`.

### Get All Submissions For Assignment

`GET {{baseUrl}}/api/assignments/{{assignmentId}}/submissions`

### Get One Student Submission

`GET {{baseUrl}}/api/assignments/{{assignmentId}}/student/{{studentUserId}}`

### Grade Submission

`PUT {{baseUrl}}/api/assignments/submission/{{submissionId}}/grade`

```json
{
  "marksAwarded": 8,
  "feedback": "Good work. Improve formatting."
}
```

## 7. Enrollments

### Enroll User

`POST {{baseUrl}}/api/enrollments`

```json
{
  "user": {
    "userId": {{studentUserId}}
  },
  "course": {
    "courseId": {{courseId}}
  },
  "role": "STUDENT"
}
```

### Get Enrollments By User

`GET {{baseUrl}}/api/enrollments/user/{{studentUserId}}`

### Get Enrollments By Course

`GET {{baseUrl}}/api/enrollments/course/{{courseId}}`

## 8. Tests

### Create Test

`POST {{baseUrl}}/api/tests`

```json
{
  "course": {
    "courseId": {{courseId}}
  },
  "title": "Quiz 1",
  "durationMinutes": 20,
  "securityPolicy": "STANDARD"
}
```

Save returned `testId`.

### Get Tests By Course

`GET {{baseUrl}}/api/tests/course/{{courseId}}`

### Add Question

`POST {{baseUrl}}/api/tests/question`

```json
{
  "test": {
    "testId": {{testId}}
  },
  "body": "What keyword defines a class in Java?",
  "questionType": "TEXT",
  "marks": 5,
  "correctAnswer": "class"
}
```

Save returned `questionId`.

### Get Questions By Test

`GET {{baseUrl}}/api/tests/{{testId}}/questions`

### Delete Question

`DELETE {{baseUrl}}/api/tests/question/{{questionId}}`

### Start Test Attempt

`POST {{baseUrl}}/api/tests/attempt`

```json
{
  "user": {
    "userId": {{studentUserId}}
  },
  "test": {
    "testId": {{testId}}
  }
}
```

Save returned `attemptId`.

### Submit Answer

`POST {{baseUrl}}/api/tests/answer`

```json
{
  "attempt": {
    "attemptId": {{attemptId}}
  },
  "question": {
    "questionId": {{questionId}}
  },
  "answerText": "class"
}
```

### Submit Test Attempt

`PUT {{baseUrl}}/api/tests/attempt/{{attemptId}}/submit`

Body can be empty:

```json
{}
```

### Get Attempts By User

`GET {{baseUrl}}/api/tests/attempts/user/{{studentUserId}}`

## 9. Discussions

### Create Thread

`POST {{baseUrl}}/api/discussions/thread`

```json
{
  "course": {
    "courseId": {{courseId}}
  },
  "user": {
    "userId": {{studentUserId}}
  },
  "title": "Help with week 1",
  "content": "I have a question about the first module."
}
```

Save returned `threadId`.

### Get Threads By Course

`GET {{baseUrl}}/api/discussions/course/{{courseId}}`

### Create Post / Reply

`POST {{baseUrl}}/api/discussions/post`

```json
{
  "thread": {
    "threadId": {{threadId}}
  },
  "user": {
    "userId": {{instructorUserId}}
  },
  "body": "Here is the clarification."
}
```

### Get Posts By Thread

`GET {{baseUrl}}/api/discussions/thread/{{threadId}}/posts`

## 10. Feedback

### Submit Feedback

`POST {{baseUrl}}/api/feedback`

```json
{
  "user": {
    "userId": {{studentUserId}}
  },
  "course": {
    "courseId": {{courseId}}
  },
  "rating": 5,
  "message": "Excellent course."
}
```

Save returned `feedbackId`.

### Update Feedback

`PUT {{baseUrl}}/api/feedback/{{feedbackId}}`

```json
{
  "user": {
    "userId": {{studentUserId}}
  },
  "course": {
    "courseId": {{courseId}}
  },
  "rating": 4,
  "message": "Still good, but adding an updated review."
}
```

### Get Feedback By Course

`GET {{baseUrl}}/api/feedback/course/{{courseId}}`

## 11. Progress

### Mark Content Complete

`POST {{baseUrl}}/api/progress/complete`

```json
{
  "userId": {{studentUserId}},
  "contentId": {{contentId}}
}
```

### Unmark Content Complete

`DELETE {{baseUrl}}/api/progress/complete?userId={{studentUserId}}&contentId={{contentId}}`

### Get Course Progress

`GET {{baseUrl}}/api/progress/course/{{courseId}}/user/{{studentUserId}}`

Expected response includes:

- `completedItems`
- `totalItems`
- `completedContentIds`
- `percent`
- `progressPercent`

## 12. Quick Sanity Checks

After the full flow, these are useful smoke checks:

- `GET {{baseUrl}}/api/courses/instructor/{{instructorUserId}}`
- `GET {{baseUrl}}/api/tests/attempts/user/{{studentUserId}}`
- `GET {{baseUrl}}/api/assignments/{{assignmentId}}/student/{{studentUserId}}`
- `GET {{baseUrl}}/api/progress/course/{{courseId}}/user/{{studentUserId}}`
- `GET {{baseUrl}}/api/feedback/course/{{courseId}}`

## Notes

- Some endpoints return nested objects. In Postman, copy IDs from responses into variables as you go.
- If you get `403`, make sure the `Authorization` header is present and the token is valid.
- If you get `409`, it may mean duplicate data such as repeated registration or enrollment.
- `POST /api/auth/activate` currently validates format only; it is a compatibility endpoint for the current app flow.
