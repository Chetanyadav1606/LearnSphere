package com.learnsphere.backend.repository;

import com.learnsphere.backend.entity.Module;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ModuleRepository extends JpaRepository<Module, Long> {

    List<Module> findByCourse_CourseIdOrderByPositionAsc(Long courseId);
}
