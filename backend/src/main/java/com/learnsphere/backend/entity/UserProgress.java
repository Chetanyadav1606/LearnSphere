package com.learnsphere.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Table(
    name = "user_progress",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "content_id"})
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "progress_id")
    private Long progressId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private UserAccount user;

    @ManyToOne
    @JoinColumn(name = "content_id", nullable = false)
    private CourseContent content;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "progress_percent", precision = 5, scale = 2)
    private BigDecimal progressPercent;

    @Column(name = "seconds_watched")
    private Integer secondsWatched;
}
