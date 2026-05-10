package com.learnsphere.backend.controller;

import com.learnsphere.backend.entity.Enrollment;
import com.learnsphere.backend.repository.EnrollmentRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/enrollments")
public class EnrollmentController {

    private final EnrollmentRepository enrollmentRepository;

    public EnrollmentController(EnrollmentRepository enrollmentRepository) {
        this.enrollmentRepository = enrollmentRepository;
    }

    // Enroll user in a course
    @PostMapping
    public Enrollment enrollUser(@RequestBody Enrollment enrollment) {
        return enrollmentRepository.save(enrollment);
    }

    // Get all enrollments of a user
    @GetMapping("/user/{userId}")
    public List<Enrollment> getEnrollmentsByUser(@PathVariable Long userId) {
        return enrollmentRepository.findByUser_UserId(userId);
    }

    // Get all enrollments of a course
    @GetMapping("/course/{courseId}")
    public List<Enrollment> getEnrollmentsByCourse(@PathVariable Long courseId) {
        return enrollmentRepository.findByCourse_CourseId(courseId);
    }
}
