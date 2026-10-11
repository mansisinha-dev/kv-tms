package com.kiss.kv_tms.repository;

import com.kiss.kv_tms.entity.IncentiveStatus;
import com.kiss.kv_tms.entity.StudentIncentive;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentIncentiveRepository extends JpaRepository<StudentIncentive, Long> {

    List<StudentIncentive> findByTraineeId(Long traineeId);

    List<StudentIncentive> findByStatus(IncentiveStatus status);

    boolean existsByProductionRunIdAndTraineeId(Long runId, Long traineeId);

    @Query("SELECT COALESCE(SUM(s.amountEarned), 0.0) FROM StudentIncentive s WHERE s.trainee.id = :traineeId")
    Double getTotalEarnedByTraineeId(@Param("traineeId") Long traineeId);

    @Query("SELECT COALESCE(SUM(s.amountEarned), 0.0) FROM StudentIncentive s WHERE s.trainee.id = :traineeId AND s.status = 'PENDING'")
    Double getTotalPendingByTraineeId(@Param("traineeId") Long traineeId);

    @Query("SELECT COALESCE(SUM(s.amountEarned), 0.0) FROM StudentIncentive s WHERE s.trainee.id = :traineeId AND s.status = 'DISBURSED'")
    Double getTotalDisbursedByTraineeId(@Param("traineeId") Long traineeId);
}