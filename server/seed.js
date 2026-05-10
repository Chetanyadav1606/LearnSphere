const http = require('http');

function request(path, method, data = null, token = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 8080,
            path: '/api' + path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (token) {
            options.headers['Authorization'] = 'Bearer ' + token;
        }

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(JSON.parse(body));
                    } catch (e) {
                        resolve(body);
                    }
                } else {
                    reject(`Request failed with status ${res.statusCode}: ${body}`);
                }
            });
        });

        req.on('error', reject);

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function seed() {
    try {
        console.log("Registering Faculty...");
        await request('/auth/register', 'POST', {
            fullName: 'Prof. Alan Turing',
            email: 'faculty@learnsphere.com',
            password: 'password123',
            role: 'INSTRUCTOR'
        }).catch(e => console.log("Faculty might exist", e.message));

        console.log("Registering Student...");
        await request('/auth/register', 'POST', {
            fullName: 'Demo Student',
            email: 'student@learnsphere.com',
            password: 'password123',
            role: 'STUDENT'
        }).catch(e => console.log("Student might exist", e.message));

        console.log("Logging in Faculty...");
        const facToken = await request('/auth/login', 'POST', {
            email: 'faculty@learnsphere.com',
            password: 'password123'
        });

        console.log("Logging in Student...");
        const stuToken = await request('/auth/login', 'POST', {
            email: 'student@learnsphere.com',
            password: 'password123'
        });

        console.log("Creating Department...");
        const dept = await request('/departments', 'POST', { name: 'Computer Science ' + Date.now() }, facToken);
        const deptId = dept.departmentId;

        console.log("Creating Course...");
        const course = await request('/courses', 'POST', {
            title: 'Advanced Algorithms ' + Date.now(),
            description: 'Learn complex algorithms and data structures.',
            imageUrl: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80',
            isPublished: true,
            department: { departmentId: deptId },
            creator: { userId: 1 } 
        }, facToken);
        const courseId = course.courseId;

        console.log("Creating Module...");
        const module = await request('/content/module', 'POST', {
            course: { courseId: courseId },
            title: 'Graph Theory',
            position: 1
        }, facToken);
        const moduleId = module.moduleId;

        console.log("Creating Content...");
        await request('/content/item', 'POST', {
            module: { moduleId: moduleId },
            title: 'Introduction to Graphs',
            contentType: 'VIDEO',
            filePath: 'https://www.youtube.com/watch?v=LFKZLXUPF40',
            position: 1
        }, facToken);

        console.log("Creating Test...");
        const test = await request('/tests', 'POST', {
            course: { courseId: courseId },
            title: 'Graph Theory Midterm',
            durationMinutes: 60,
            securityPolicy: 'STANDARD'
        }, facToken);
        const testId = test.testId;

        console.log("Adding Questions...");
        const q1 = await request('/tests/question', 'POST', {
            test: { testId: testId },
            body: 'What is the time complexity of Dijkstra algorithm using min-priority queue?',
            questionType: 'TEXT',
            correctAnswer: 'O(E log V)',
            marks: 10
        }, facToken);

        const q2 = await request('/tests/question', 'POST', {
            test: { testId: testId },
            body: 'Is a tree a bipartite graph?',
            questionType: 'TEXT',
            correctAnswer: 'True',
            marks: 5
        }, facToken);

        console.log("Student Taking Test Attempt...");
        const attempt = await request('/tests/attempt', 'POST', {
            test: { testId: testId },
            user: { userId: 2 },
            status: 'IN_PROGRESS'
        }, stuToken);
        const attemptId = attempt.attemptId;

        console.log("Student Submitting Answers...");
        await request('/tests/answer', 'POST', {
            attempt: { attemptId: attemptId },
            question: { questionId: q1.questionId },
            studentAnswer: 'O(E log V)'
        }, stuToken);

        await request('/tests/answer', 'POST', {
            attempt: { attemptId: attemptId },
            question: { questionId: q2.questionId },
            studentAnswer: 'False'
        }, stuToken);

        console.log("Student Submitting Attempt...");
        await request(`/tests/attempt/${attemptId}/submit`, 'PUT', null, stuToken);
        
        console.log("Faculty Grading Submission...");
        await request(`/tests/attempt/${attemptId}/grade`, 'PUT', {
            marksAwarded: 10,
            feedback: 'Good start, but review bipartite graphs!'
        }, facToken);

        console.log("Seeding complete!");
        console.log("==========================================");
        console.log("CREDENTIALS:");
        console.log("Faculty Email: faculty@learnsphere.com | Password: password123");
        console.log("Student Email: student@learnsphere.com | Password: password123");

    } catch (err) {
        console.error("Error during seeding:", err);
    }
}

seed();
