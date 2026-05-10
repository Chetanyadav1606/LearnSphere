package com.learnsphere.backend.repository;

import com.learnsphere.backend.entity.CourseContent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourseContentRepository extends JpaRepository<CourseContent, Long> {

    List<CourseContent> findByModule_ModuleIdOrderByPositionAsc(Long moduleId);
}
