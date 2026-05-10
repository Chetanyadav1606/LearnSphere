package com.learnsphere.backend.repository;

import com.learnsphere.backend.entity.StudentAnswer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudentAnswerRepository extends JpaRepository<StudentAnswer, Long> {

    List<StudentAnswer> findByAttempt_AttemptId(Long attemptId);
}
