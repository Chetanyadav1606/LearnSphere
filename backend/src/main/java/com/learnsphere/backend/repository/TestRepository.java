package com.learnsphere.backend.repository;

import com.learnsphere.backend.entity.Test;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TestRepository extends JpaRepository<Test, Long> {

    List<Test> findByCourse_CourseId(Long courseId);
}
