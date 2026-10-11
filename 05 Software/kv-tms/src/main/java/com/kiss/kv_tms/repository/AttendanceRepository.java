package com.kiss.kv_tms.repository;

import com.kiss.kv_tms.entity.Attendance;
import com.kiss.kv_tms.entity.AttendanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    // Get all attendance records for a trainee
    List<Attendance> findByTraineeId(Long traineeId);
    List<Attendance> findByTraineeIdOrderByDateDesc(Long traineeId);

    // Get attendance for a course on a specific date (for Trainer's daily view)
    List<Attendance> findByCourseIdAndDate(Long courseId, LocalDate date);
    List<Attendance> findByCourseId(Long courseId);

    // Get attendance for trainee on date (to update without duplicating)
    java.util.Optional<Attendance> findByTraineeIdAndDate(Long traineeId, LocalDate date);

    // Get all attendance for a date
    List<Attendance> findByDate(LocalDate date);

    // Get all attendance records ordered by date descending
    List<Attendance> findAllByOrderByDateDesc();

    // Helpers to compute attendance percentage
    long countByTraineeId(Long traineeId);
    long countByTraineeIdAndStatus(Long traineeId, AttendanceStatus status);
}