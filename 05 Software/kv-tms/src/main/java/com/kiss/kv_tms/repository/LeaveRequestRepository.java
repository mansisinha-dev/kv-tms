package com.kiss.kv_tms.repository;

import com.kiss.kv_tms.entity.LeaveRequest;
import com.kiss.kv_tms.entity.LeaveStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {

    // View leaves applied by a specific user (Trainee or Trainer)
    List<LeaveRequest> findByApplicantId(Long applicantId);

    // View leaves applied by user college ID
    List<LeaveRequest> findByApplicantCollegeIdOrderByAppliedAtDesc(String collegeId);

    // View pending leave requests
    List<LeaveRequest> findByStatusOrderByAppliedAtDesc(LeaveStatus status);

    // View all leaves in reverse chronological order
    List<LeaveRequest> findAllByOrderByAppliedAtDesc();
}