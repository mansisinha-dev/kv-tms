package com.kiss.kv_tms.repository;

import com.kiss.kv_tms.entity.TrainerAttendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TrainerAttendanceRepository extends JpaRepository<TrainerAttendance, Long> {
    List<TrainerAttendance> findByTrainerIdOrderByDateDesc(Long trainerId);
    Optional<TrainerAttendance> findByTrainerIdAndDate(Long trainerId, LocalDate date);
    long countByTrainerIdAndStatus(Long trainerId, String status);
}
