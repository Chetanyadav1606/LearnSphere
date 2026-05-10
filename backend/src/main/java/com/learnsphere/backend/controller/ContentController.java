package com.learnsphere.backend.controller;

import com.learnsphere.backend.entity.Module;
import com.learnsphere.backend.entity.CourseContent;
import com.learnsphere.backend.repository.ModuleRepository;
import com.learnsphere.backend.repository.CourseContentRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/content")
public class ContentController {

    private final ModuleRepository moduleRepository;
    private final CourseContentRepository courseContentRepository;

    public ContentController(ModuleRepository moduleRepository,
                             CourseContentRepository courseContentRepository) {
        this.moduleRepository = moduleRepository;
        this.courseContentRepository = courseContentRepository;
    }

    // =========================
    // MODULE APIs
    // =========================

    // Create a module under a course
    @PostMapping("/module")
    public Module createModule(@RequestBody Module module) {
        return moduleRepository.save(module);
    }

    // Get all modules of a course (ordered)
    @GetMapping("/module/course/{courseId}")
    public List<Module> getModulesByCourse(@PathVariable Long courseId) {
        return moduleRepository.findByCourse_CourseIdOrderByPositionAsc(courseId);
    }

    // =========================
    // COURSE CONTENT APIs
    // =========================

    // Add content to a module
    @PostMapping("/item")
    public CourseContent createContent(@RequestBody CourseContent content) {
        return courseContentRepository.save(content);
    }

    // Get all content of a module (ordered)
    @GetMapping("/item/module/{moduleId}")
    public List<CourseContent> getContentsByModule(@PathVariable Long moduleId) {
        return courseContentRepository.findByModule_ModuleIdOrderByPositionAsc(moduleId);
    }
}
