package com.learnsphere.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "question")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "question_id")
    private Long questionId;

    @ManyToOne
    @JoinColumn(name = "test_id", nullable = false)
    private Test test;

    @Column(columnDefinition = "TEXT")
    private String body;

    @Column(name = "question_type")
    private String questionType; // MCQ / TEXT / TF

    private Integer marks;

    @Column(name = "correct_answer", columnDefinition = "TEXT")
    private String correctAnswer;

    @Column(columnDefinition = "TEXT")
    private String extra;
}
