package com.learnsphere.backend.repository;

import com.learnsphere.backend.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long> {

    List<Course> findByIsPublishedTrue();

    List<Course> findByDepartment_DepartmentId(Integer departmentId);
}
