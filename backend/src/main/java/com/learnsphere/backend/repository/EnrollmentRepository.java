package com.learnsphere.backend.repository;

import com.learnsphere.backend.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    Optional<Enrollment> findByUser_UserIdAndCourse_CourseIdAndRole(
            Long userId, Long courseId, String role
    );

    List<Enrollment> findByUser_UserId(Long userId);

    List<Enrollment> findByCourse_CourseId(Long courseId);
}
