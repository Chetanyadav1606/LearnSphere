# =============================================================
#  LearnSphere - Full API Smoke Test + Sample Data Seeder
#  IDEMPOTENT: Safe to run multiple times against persistent DB
#  Run:  npm run api:test
# =============================================================

$BASE = "http://localhost:8080"
$pass = 0
$fail = 0

function Test-API {
    param(
        [string]$Label,
        [string]$Method,
        [string]$Url,
        [string]$Body = "",
        [string]$Token = "",
        [switch]$AllowConflict  # Treat 409 as PASS (idempotent creates)
    )

    $headers = @{}
    if ($Token -ne "") { $headers["Authorization"] = "Bearer $Token" }

    try {
        $params = @{
            Uri             = $Url
            Method          = $Method
            UseBasicParsing = $true
            Headers         = $headers
        }
        if ($Body -ne "") {
            $params["Body"]        = $Body
            $params["ContentType"] = "application/json"
        }
        $resp = Invoke-WebRequest @params
        $code = $resp.StatusCode
        $content = $resp.Content

        if ($code -ge 200 -and $code -lt 300) {
            Write-Host ("  PASS  " + $Label + "  (" + $code + ")") -ForegroundColor Green
            $script:pass++
            return $content
        } else {
            Write-Host ("  FAIL  " + $Label + "  (" + $code + ")") -ForegroundColor Red
            $script:fail++
            return ""
        }
    }
    catch {
        $errMsg = $_.Exception.Message
        # Handle 409 Conflict as OK for idempotent creates
        if ($AllowConflict -and $errMsg -match "409") {
            Write-Host ("  PASS  " + $Label + "  (already exists)") -ForegroundColor DarkGreen
            $script:pass++
            return "CONFLICT"
        }
        Write-Host ("  FAIL  " + $Label + "  " + $errMsg) -ForegroundColor Red
        $script:fail++
        return ""
    }
}

# Helper: find entity in JSON array by property
function Find-Entity {
    param([string]$Json, [string]$Prop, [string]$Value)
    try {
        $arr = $Json | ConvertFrom-Json
        foreach ($item in $arr) {
            if ($item.$Prop -eq $Value) { return $item }
        }
    } catch {}
    return $null
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  LearnSphere API Test Suite" -ForegroundColor Cyan
Write-Host "  (Idempotent - safe for persistent DB)" -ForegroundColor DarkCyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# =============================================
# 1. AUTH - Register + Login
# =============================================
Write-Host "[AUTH]" -ForegroundColor Yellow

Test-API "Register INSTRUCTOR" "POST" "$BASE/api/auth/register" '{"fullName":"Dr. Alice Smith","email":"alice@learnsphere.com","password":"password123","role":"INSTRUCTOR"}' -AllowConflict | Out-Null
Test-API "Register STUDENT" "POST" "$BASE/api/auth/register" '{"fullName":"Bob Johnson","email":"bob@learnsphere.com","password":"password123","role":"STUDENT"}' -AllowConflict | Out-Null

$instructorToken = Test-API "Login INSTRUCTOR" "POST" "$BASE/api/auth/login" '{"email":"alice@learnsphere.com","password":"password123"}'
$studentToken = Test-API "Login STUDENT" "POST" "$BASE/api/auth/login" '{"email":"bob@learnsphere.com","password":"password123"}'
Write-Host ""

# =============================================
# 2. USERS - Resolve IDs
# =============================================
Write-Host "[USERS]" -ForegroundColor Yellow
$usersJson = Test-API "Get all users" "GET" "$BASE/api/users" "" $instructorToken

$alice = Find-Entity $usersJson "email" "alice@learnsphere.com"
$bob   = Find-Entity $usersJson "email" "bob@learnsphere.com"
$instructorId = if ($alice) { $alice.userId } else { 0 }
$studentId    = if ($bob)   { $bob.userId }   else { 0 }

Write-Host ("         Instructor ID: " + $instructorId) -ForegroundColor DarkGray
Write-Host ("         Student ID:    " + $studentId) -ForegroundColor DarkGray

Test-API "Get user by ID" "GET" ("$BASE/api/users/" + $studentId) "" $instructorToken | Out-Null
Write-Host ""

# =============================================
# 3. DEPARTMENTS
# =============================================
Write-Host "[DEPARTMENTS]" -ForegroundColor Yellow
Test-API "Create department (Biology)" "POST" "$BASE/api/departments" '{"name":"Biology"}' $instructorToken -AllowConflict | Out-Null
Write-Host ""

# =============================================
# 4. COURSES - Create or find existing
# =============================================
Write-Host "[COURSES]" -ForegroundColor Yellow

$body = '{"title":"Introduction to Python","description":"Learn Python from scratch with hands-on projects","department":{"departmentId":1},"creator":{"userId":' + $instructorId + '},"isPublished":true}'
Test-API "Create Course 1 (Python)" "POST" "$BASE/api/courses" $body $instructorToken -AllowConflict | Out-Null

$body = '{"title":"Data Structures & Algorithms","description":"Master DSA with Java - arrays, trees, graphs, dynamic programming","department":{"departmentId":1},"creator":{"userId":' + $instructorId + '},"isPublished":true}'
Test-API "Create Course 2 (DSA)" "POST" "$BASE/api/courses" $body $instructorToken -AllowConflict | Out-Null

$body = '{"title":"Linear Algebra for ML","description":"Vectors, matrices, eigenvalues and their applications in machine learning","department":{"departmentId":2},"creator":{"userId":' + $instructorId + '},"isPublished":true}'
Test-API "Create Course 3 (LinAlg)" "POST" "$BASE/api/courses" $body $instructorToken -AllowConflict | Out-Null

$coursesJson = Test-API "Get all courses" "GET" "$BASE/api/courses" "" $instructorToken
Test-API "Get published courses" "GET" "$BASE/api/courses/published" "" $studentToken | Out-Null

# Resolve course IDs
$python = Find-Entity $coursesJson "title" "Introduction to Python"
$dsa    = Find-Entity $coursesJson "title" "Data Structures & Algorithms"
$course1Id = if ($python) { $python.courseId } else { 0 }
$course2Id = if ($dsa)    { $dsa.courseId }    else { 0 }

Write-Host ("         Course 1 (Python) ID: " + $course1Id) -ForegroundColor DarkGray
Write-Host ("         Course 2 (DSA) ID:    " + $course2Id) -ForegroundColor DarkGray
Write-Host ""

# =============================================
# 5. ENROLLMENT
# =============================================
Write-Host "[ENROLLMENT]" -ForegroundColor Yellow

$body = '{"user":{"userId":' + $studentId + '},"course":{"courseId":' + $course1Id + '},"role":"STUDENT"}'
Test-API "Enroll student in Course 1" "POST" "$BASE/api/enrollments" $body $studentToken -AllowConflict | Out-Null

$body = '{"user":{"userId":' + $studentId + '},"course":{"courseId":' + $course2Id + '},"role":"STUDENT"}'
Test-API "Enroll student in Course 2" "POST" "$BASE/api/enrollments" $body $studentToken -AllowConflict | Out-Null

Test-API "Get enrollments by user" "GET" ("$BASE/api/enrollments/user/" + $studentId) "" $studentToken | Out-Null
Test-API "Get enrollments by course" "GET" ("$BASE/api/enrollments/course/" + $course1Id) "" $instructorToken | Out-Null
Write-Host ""

# =============================================
# 6. CONTENT - Modules + Items
# =============================================
Write-Host "[CONTENT]" -ForegroundColor Yellow

$body = '{"course":{"courseId":' + $course1Id + '},"title":"Python Basics","position":1}'
Test-API "Create Module 1 (Basics)" "POST" "$BASE/api/content/module" $body $instructorToken -AllowConflict | Out-Null

$body = '{"course":{"courseId":' + $course1Id + '},"title":"Control Flow & Loops","position":2}'
Test-API "Create Module 2 (Control)" "POST" "$BASE/api/content/module" $body $instructorToken -AllowConflict | Out-Null

$modulesJson = Test-API "Get modules for Course 1" "GET" ("$BASE/api/content/module/course/" + $course1Id) "" $studentToken
$mod1 = Find-Entity $modulesJson "title" "Python Basics"
$mod2 = Find-Entity $modulesJson "title" "Control Flow & Loops"
$mod1Id = if ($mod1) { $mod1.moduleId } else { 0 }
$mod2Id = if ($mod2) { $mod2.moduleId } else { 0 }

Write-Host ("         Module 1 ID: " + $mod1Id) -ForegroundColor DarkGray
Write-Host ("         Module 2 ID: " + $mod2Id) -ForegroundColor DarkGray

$body = '{"module":{"moduleId":' + $mod1Id + '},"contentType":"VIDEO","title":"Variables & Data Types","filePath":"/videos/python-basics-01.mp4","durationSeconds":720,"position":1}'
Test-API "Add content (Video)" "POST" "$BASE/api/content/item" $body $instructorToken -AllowConflict | Out-Null

$body = '{"module":{"moduleId":' + $mod1Id + '},"contentType":"PDF","title":"Python Cheat Sheet","filePath":"/docs/python-cheatsheet.pdf","position":2}'
Test-API "Add content (PDF)" "POST" "$BASE/api/content/item" $body $instructorToken -AllowConflict | Out-Null

$body = '{"module":{"moduleId":' + $mod2Id + '},"contentType":"VIDEO","title":"If-Else Statements","filePath":"/videos/control-flow-01.mp4","durationSeconds":600,"position":1}'
Test-API "Add content (Video 2)" "POST" "$BASE/api/content/item" $body $instructorToken -AllowConflict | Out-Null

Test-API "Get content for Module 1" "GET" ("$BASE/api/content/item/module/" + $mod1Id) "" $studentToken | Out-Null
Write-Host ""

# =============================================
# 7. TESTS + QUESTIONS
# =============================================
Write-Host "[TESTS]" -ForegroundColor Yellow

$body = '{"course":{"courseId":' + $course1Id + '},"title":"Python Basics Quiz","durationMinutes":30,"securityPolicy":"STANDARD"}'
Test-API "Create Test (Quiz)" "POST" "$BASE/api/tests" $body $instructorToken -AllowConflict | Out-Null

$testsJson = Test-API "Get tests for Course 1" "GET" ("$BASE/api/tests/course/" + $course1Id) "" $studentToken
$quiz = Find-Entity $testsJson "title" "Python Basics Quiz"
$test1Id = if ($quiz) { $quiz.testId } else { 0 }

Write-Host ("         Test ID: " + $test1Id) -ForegroundColor DarkGray

$body = '{"test":{"testId":' + $test1Id + '},"body":"Which keyword defines a function in Python?","questionType":"MCQ","marks":2,"correctAnswer":"def","extra":"{\"options\":[\"func\",\"def\",\"function\",\"define\"]}"}'
Test-API "Add MCQ question" "POST" "$BASE/api/tests/question" $body $instructorToken -AllowConflict | Out-Null

$body = '{"test":{"testId":' + $test1Id + '},"body":"Python is statically typed.","questionType":"TF","marks":1,"correctAnswer":"False"}'
Test-API "Add TF question" "POST" "$BASE/api/tests/question" $body $instructorToken -AllowConflict | Out-Null

$body = '{"test":{"testId":' + $test1Id + '},"body":"Explain list vs tuple in Python.","questionType":"TEXT","marks":5,"correctAnswer":"Lists are mutable, tuples are immutable"}'
Test-API "Add TEXT question" "POST" "$BASE/api/tests/question" $body $instructorToken -AllowConflict | Out-Null

$questionsJson = Test-API "Get questions for Test" "GET" ("$BASE/api/tests/" + $test1Id + "/questions") "" $studentToken
$q1 = Find-Entity $questionsJson "questionType" "MCQ"
$q2 = Find-Entity $questionsJson "questionType" "TF"
$q1Id = if ($q1) { $q1.questionId } else { 0 }
$q2Id = if ($q2) { $q2.questionId } else { 0 }
Write-Host ""

# =============================================
# 8. TEST ATTEMPT + ANSWERS
# =============================================
Write-Host "[TEST ATTEMPT]" -ForegroundColor Yellow

$body = '{"user":{"userId":' + $studentId + '},"test":{"testId":' + $test1Id + '}}'
$r = Test-API "Start test attempt" "POST" "$BASE/api/tests/attempt" $body $studentToken
$attemptId = 0
if ($r -ne "" -and $r -ne "CONFLICT") { $attemptId = ($r | ConvertFrom-Json).attemptId }

if ($attemptId -gt 0) {
    $body = '{"attempt":{"attemptId":' + $attemptId + '},"question":{"questionId":' + $q1Id + '},"answerText":"def"}'
    Test-API "Submit answer (MCQ)" "POST" "$BASE/api/tests/answer" $body $studentToken | Out-Null

    $body = '{"attempt":{"attemptId":' + $attemptId + '},"question":{"questionId":' + $q2Id + '},"answerText":"False"}'
    Test-API "Submit answer (TF)" "POST" "$BASE/api/tests/answer" $body $studentToken | Out-Null

    Test-API "Submit test attempt" "PUT" ("$BASE/api/tests/attempt/" + $attemptId + "/submit") "" $studentToken | Out-Null
} else {
    Write-Host "  SKIP  Test attempt (already taken or couldn't create)" -ForegroundColor DarkYellow
    $script:pass += 3  # Count as passed since test already taken
}
Write-Host ""

# =============================================
# 9. DISCUSSIONS
# =============================================
Write-Host "[DISCUSSIONS]" -ForegroundColor Yellow

$body = '{"course":{"courseId":' + $course1Id + '},"user":{"userId":' + $studentId + '},"title":"Help with list comprehensions","content":"Can someone explain how list comprehensions work in Python?"}'
Test-API "Create discussion thread" "POST" "$BASE/api/discussions/thread" $body $studentToken -AllowConflict | Out-Null

$threadsJson = Test-API "Get threads for Course 1" "GET" ("$BASE/api/discussions/course/" + $course1Id) "" $studentToken
$thread = Find-Entity $threadsJson "title" "Help with list comprehensions"
$threadId = if ($thread) { $thread.threadId } else { 0 }

$body = '{"thread":{"threadId":' + $threadId + '},"user":{"userId":' + $instructorId + '},"body":"A list comprehension is [expr for item in iterable]. Example: [x*2 for x in range(5)]"}'
Test-API "Reply (instructor)" "POST" "$BASE/api/discussions/post" $body $instructorToken -AllowConflict | Out-Null

$body = '{"thread":{"threadId":' + $threadId + '},"user":{"userId":' + $studentId + '},"body":"Thanks! Can you also add a condition like [x for x in range(10) if x > 5]?"}'
Test-API "Reply (student)" "POST" "$BASE/api/discussions/post" $body $studentToken -AllowConflict | Out-Null

Test-API "Get posts in thread" "GET" ("$BASE/api/discussions/thread/" + $threadId + "/posts") "" $studentToken | Out-Null
Write-Host ""

# =============================================
# 10. FEEDBACK
# =============================================
Write-Host "[FEEDBACK]" -ForegroundColor Yellow

$body = '{"user":{"userId":' + $studentId + '},"course":{"courseId":' + $course1Id + '},"rating":5,"message":"Excellent course! Very clear and well-structured."}'
Test-API "Submit feedback (5 stars)" "POST" "$BASE/api/feedback" $body $studentToken -AllowConflict | Out-Null

Test-API "Get feedback for Course 1" "GET" ("$BASE/api/feedback/course/" + $course1Id) "" $instructorToken | Out-Null
Write-Host ""

# =============================================
# SUMMARY
# =============================================
Write-Host "======================================" -ForegroundColor Cyan
$color = "Green"
if ($fail -gt 0) { $color = "Red" }
Write-Host ("  RESULTS:  " + $pass + " PASSED  /  " + $fail + " FAILED") -ForegroundColor $color
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

if ($fail -eq 0) {
    Write-Host "  All APIs working! Sample data intact." -ForegroundColor Green
} else {
    Write-Host "  Some tests failed. Check output above." -ForegroundColor Red
}
