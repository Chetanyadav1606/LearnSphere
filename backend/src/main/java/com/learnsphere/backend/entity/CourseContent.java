package com.learnsphere.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "course_content")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseContent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "content_id")
    private Long contentId;

    @ManyToOne
    @JoinColumn(name = "module_id", nullable = false)
    private Module module;

    @Column(name = "content_type")
    private String contentType; // VIDEO, PDF, QUIZ

    private String title;

    @Column(name = "file_path", columnDefinition = "TEXT")
    private String filePath;

    @Column(name = "duration_seconds")
    private Integer durationSeconds;

    private Integer position;

    @Builder.Default
    @Column(name = "uploaded_at", updatable = false)
    private LocalDateTime uploadedAt = LocalDateTime.now();
}
