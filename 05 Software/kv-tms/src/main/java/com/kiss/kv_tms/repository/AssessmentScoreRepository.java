package com.kiss.kv_tms.repository;

import com.kiss.kv_tms.entity.AssessmentScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssessmentScoreRepository extends JpaRepository<AssessmentScore, Long> {

    // Get score for a specific trainee
    Optional<AssessmentScore> findByTraineeId(Long traineeId);

    // Get all scores for a course
    List<AssessmentScore> findByCourseId(Long courseId);
}