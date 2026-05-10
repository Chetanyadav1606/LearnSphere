package com.learnsphere.backend.controller;

import com.learnsphere.backend.entity.Feedback;
import com.learnsphere.backend.repository.FeedbackRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    private final FeedbackRepository feedbackRepository;

    public FeedbackController(FeedbackRepository feedbackRepository) {
        this.feedbackRepository = feedbackRepository;
    }

    // Submit feedback for a course
    @PostMapping
    public Feedback submitFeedback(@RequestBody Feedback feedback) {
        feedback.setCreatedAt(LocalDateTime.now());
        return feedbackRepository.save(feedback);
    }

    // Get all feedback for a course
    @GetMapping("/course/{courseId}")
    public List<Feedback> getFeedbackByCourse(@PathVariable Long courseId) {
        return feedbackRepository.findByCourse_CourseId(courseId);
    }
}
