package com.learnsphere.backend.controller;

import com.learnsphere.backend.entity.DiscussionThread;
import com.learnsphere.backend.entity.Post;
import com.learnsphere.backend.repository.DiscussionThreadRepository;
import com.learnsphere.backend.repository.PostRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/discussions")
public class DiscussionController {

    private final DiscussionThreadRepository threadRepository;
    private final PostRepository postRepository;

    public DiscussionController(DiscussionThreadRepository threadRepository,
                                PostRepository postRepository) {
        this.threadRepository = threadRepository;
        this.postRepository = postRepository;
    }

    // =========================
    // THREAD APIs
    // =========================

    // Create discussion thread
    @PostMapping("/thread")
    public DiscussionThread createThread(@RequestBody DiscussionThread thread) {
        thread.setCreatedAt(LocalDateTime.now());
        return threadRepository.save(thread);
    }

    // Get all threads of a course
    @GetMapping("/course/{courseId}")
    public List<DiscussionThread> getThreadsByCourse(@PathVariable Long courseId) {
        return threadRepository.findByCourse_CourseId(courseId);
    }

    // =========================
    // POST APIs
    // =========================

    // Add post / reply
    @PostMapping("/post")
    public Post createPost(@RequestBody Post post) {
        post.setCreatedAt(LocalDateTime.now());
        return postRepository.save(post);
    }

    // Get posts of a thread
    @GetMapping("/thread/{threadId}/posts")
    public List<Post> getPostsByThread(@PathVariable Long threadId) {
        return postRepository.findByThread_ThreadId(threadId);
    }
}
