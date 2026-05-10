package com.learnsphere.backend.controller;

import org.springframework.web.bind.annotation.*;
import com.learnsphere.backend.entity.Department;
import com.learnsphere.backend.repository.DepartmentRepository;

@RestController
@RequestMapping("/api/departments")
public class DepartmentController {

    private final DepartmentRepository departmentRepository;

    public DepartmentController(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    @PostMapping
    public Department create(@RequestBody Department department) {
        return departmentRepository.save(department);
    }
}
