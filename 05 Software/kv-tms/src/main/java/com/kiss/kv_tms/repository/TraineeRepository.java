package com.kiss.kv_tms.repository;

import com.kiss.kv_tms.entity.Trainee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TraineeRepository extends JpaRepository<Trainee, Long> {
    Optional<Trainee> findByUserId(Long userId);
    Optional<Trainee> findByUserCollegeId(String collegeId);
    List<Trainee> findByAssignedCourseId(Long courseId);
    long countByAssignedCourseId(Long courseId);
}