package com.learnsphere.backend.controller;

import com.learnsphere.backend.entity.*;
import com.learnsphere.backend.repository.*;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/tests")
public class TestController {

    private final TestRepository testRepository;
    private final QuestionRepository questionRepository;
    private final TestAttemptRepository testAttemptRepository;
    private final StudentAnswerRepository studentAnswerRepository;

    public TestController(TestRepository testRepository,
                          QuestionRepository questionRepository,
                          TestAttemptRepository testAttemptRepository,
                          StudentAnswerRepository studentAnswerRepository) {
        this.testRepository = testRepository;
        this.questionRepository = questionRepository;
        this.testAttemptRepository = testAttemptRepository;
        this.studentAnswerRepository = studentAnswerRepository;
    }

    // =========================
    // TEST APIs
    // =========================

    // Create a test
    @PostMapping
    public Test createTest(@RequestBody Test test) {
        return testRepository.save(test);
    }

    // Get tests of a course
    @GetMapping("/course/{courseId}")
    public List<Test> getTestsByCourse(@PathVariable Long courseId) {
        return testRepository.findByCourse_CourseId(courseId);
    }

    // =========================
    // QUESTION APIs
    // =========================

    // Add question to test
    @PostMapping("/question")
    public Question addQuestion(@RequestBody Question question) {
        return questionRepository.save(question);
    }

    // Get questions of a test
    @GetMapping("/{testId}/questions")
    public List<Question> getQuestions(@PathVariable Long testId) {
        return questionRepository.findByTest_TestId(testId);
    }

    // =========================
    // TEST ATTEMPT APIs
    // =========================

    // Start test attempt
    @PostMapping("/attempt")
    public TestAttempt startAttempt(@RequestBody TestAttempt attempt) {
        attempt.setStartedAt(LocalDateTime.now());
        attempt.setStatus("IN_PROGRESS");
        return testAttemptRepository.save(attempt);
    }

    // Submit test attempt
    @PutMapping("/attempt/{attemptId}/submit")
    public TestAttempt submitAttempt(@PathVariable Long attemptId) {
        TestAttempt attempt = testAttemptRepository.findById(attemptId).orElse(null);
        if (attempt == null) return null;

        attempt.setCompletedAt(LocalDateTime.now());
        attempt.setStatus("COMPLETED");
        return testAttemptRepository.save(attempt);
    }

    // =========================
    // ANSWER APIs
    // =========================

    // Submit answer
    @PostMapping("/answer")
    public StudentAnswer submitAnswer(@RequestBody StudentAnswer answer) {
        return studentAnswerRepository.save(answer);
    }
}
