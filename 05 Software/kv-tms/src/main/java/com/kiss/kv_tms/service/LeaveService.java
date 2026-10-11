package com.kiss.kv_tms.service;

import com.kiss.kv_tms.dto.LeaveApplyRequest;
import com.kiss.kv_tms.dto.LeaveReviewRequest;
import com.kiss.kv_tms.entity.LeaveRequest;
import com.kiss.kv_tms.entity.LeaveStatus;
import com.kiss.kv_tms.entity.User;
import com.kiss.kv_tms.repository.LeaveRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class LeaveService {

    @Autowired
    private LeaveRequestRepository leaveRepo;

    @Autowired
    private com.kiss.kv_tms.repository.TraineeRepository traineeRepo;

    // 1. Submit Leave Request
    @Transactional
    public LeaveRequest applyLeave(User applicant, LeaveApplyRequest req) {
        LeaveRequest leave = LeaveRequest.builder()
                .applicant(applicant)
                .startDate(req.getStartDate())
                .endDate(req.getEndDate())
                .reason(req.getReason())
                .status(LeaveStatus.PENDING)
                .build();

        return leaveRepo.save(leave);
    }

    // 2. Review Leave Request (Approve / Reject)
    @Transactional
    public LeaveRequest reviewLeave(Long leaveId, User reviewer, LeaveReviewRequest req) {
        LeaveRequest leave = leaveRepo.findById(leaveId)
                .orElseThrow(() -> new RuntimeException("Leave request not found: " + leaveId));

        leave.setStatus(req.getStatus());
        leave.setReviewRemarks(req.getReviewRemarks());
        if (reviewer != null) {
            leave.setReviewedBy(reviewer);
        }

        return leaveRepo.save(leave);
    }

    // 3. View my leave applications
    public List<LeaveRequest> getMyLeaves(Long userId) {
        return leaveRepo.findByApplicantId(userId);
    }

    // 4. View leaves by College ID
    public List<java.util.Map<String, Object>> getLeavesByCollegeId(String collegeId) {
        List<LeaveRequest> list = leaveRepo.findByApplicantCollegeIdOrderByAppliedAtDesc(collegeId);
        List<java.util.Map<String, Object>> result = new java.util.ArrayList<>();
        for (LeaveRequest l : list) {
            result.add(mapLeave(l));
        }
        return result;
    }

    // 5. View all pending leave requests (for Trainers / Admin)
    public List<java.util.Map<String, Object>> getPendingLeavesMapped() {
        List<LeaveRequest> list = leaveRepo.findByStatusOrderByAppliedAtDesc(LeaveStatus.PENDING);
        List<java.util.Map<String, Object>> result = new java.util.ArrayList<>();
        for (LeaveRequest l : list) {
            result.add(mapLeave(l));
        }
        return result;
    }

    // 6. View all leave requests mapped
    public List<java.util.Map<String, Object>> getAllLeavesMapped() {
        List<LeaveRequest> list = leaveRepo.findAllByOrderByAppliedAtDesc();
        List<java.util.Map<String, Object>> result = new java.util.ArrayList<>();
        for (LeaveRequest l : list) {
            result.add(mapLeave(l));
        }
        return result;
    }

    // Helper to map LeaveRequest to Frontend JSON format
    public java.util.Map<String, Object> mapLeave(LeaveRequest l) {
        java.util.Map<String, Object> map = new java.util.HashMap<>();
        map.put("id", l.getId());
        map.put("studentId", l.getApplicant().getCollegeId());

        String name = l.getApplicant().getFullName() != null && !l.getApplicant().getFullName().isBlank()
                ? l.getApplicant().getFullName()
                : l.getApplicant().getCollegeId();
        var traineeOpt = traineeRepo.findByUserId(l.getApplicant().getId());
        if (traineeOpt.isPresent()) {
            name = traineeOpt.get().getFullName();
        }
        map.put("applicantName", name);
        map.put("applicantRole", l.getApplicant().getRole() != null ? l.getApplicant().getRole().name() : "");
        map.put("trainee", name + " (" + l.getApplicant().getCollegeId() + ")");
        map.put("startDate", l.getStartDate().toString());
        map.put("endDate", l.getEndDate().toString());

        long days = java.time.temporal.ChronoUnit.DAYS.between(l.getStartDate(), l.getEndDate()) + 1;
        map.put("days", days);
        map.put("reason", l.getReason());
        map.put("status", l.getStatus().name());
        map.put("reviewRemarks", l.getReviewRemarks());
        map.put("date", l.getAppliedAt() != null ? l.getAppliedAt().toLocalDate().toString() : l.getStartDate().toString());
        return map;
    }
}