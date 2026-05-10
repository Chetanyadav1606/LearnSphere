package com.learnsphere.backend.repository;

import com.learnsphere.backend.entity.TestAttempt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TestAttemptRepository extends JpaRepository<TestAttempt, Long> {

    List<TestAttempt> findByUser_UserId(Long userId);

    List<TestAttempt> findByTest_TestId(Long testId);
}
