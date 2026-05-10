package com.learnsphere.backend.repository;

import com.learnsphere.backend.entity.DiscussionThread;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DiscussionThreadRepository extends JpaRepository<DiscussionThread, Long> {

    List<DiscussionThread> findByCourse_CourseId(Long courseId);
}
