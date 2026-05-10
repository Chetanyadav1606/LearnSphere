package com.learnsphere.backend.repository;

import com.learnsphere.backend.entity.UserProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserProgressRepository extends JpaRepository<UserProgress, Long> {

    Optional<UserProgress> findByUser_UserIdAndContent_ContentId(
            Long userId, Long contentId
    );

    List<UserProgress> findByUser_UserId(Long userId);
}
