package com.learnsphere.backend.repository;

import com.learnsphere.backend.entity.Leaderboard;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LeaderboardRepository extends JpaRepository<Leaderboard, Long> {

    List<Leaderboard> findByCourse_CourseIdOrderByGlobalRankAsc(Long courseId);
}
