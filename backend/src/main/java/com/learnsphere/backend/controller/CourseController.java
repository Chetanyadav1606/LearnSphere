package com.learnsphere.backend.controller;

import com.learnsphere.backend.entity.Course;
import com.learnsphere.backend.repository.CourseRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final CourseRepository courseRepository;

    public CourseController(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    // Create course
    @PostMapping
    public Course createCourse(@RequestBody Course course) {
        return courseRepository.save(course);
    }

    // Get all courses
    @GetMapping
    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    // Get published courses
    @GetMapping("/published")
    public List<Course> getPublishedCourses() {
        return courseRepository.findByIsPublishedTrue();
    }
}
