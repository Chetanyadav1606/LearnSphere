package com.learnsphere.backend.repository;

import com.learnsphere.backend.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {

    List<Post> findByThread_ThreadId(Long threadId);
}
