package com.kiss.kv_tms.controller;

import com.kiss.kv_tms.dto.LeaveApplyRequest;
import com.kiss.kv_tms.dto.LeaveReviewRequest;
import com.kiss.kv_tms.entity.LeaveRequest;
import com.kiss.kv_tms.entity.User;
import com.kiss.kv_tms.repository.UserRepository;
import com.kiss.kv_tms.service.LeaveService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/leaves")
public class LeaveController {

    @Autowired
    private LeaveService leaveService;

    @Autowired
    private UserRepository userRepository;

    // Helper to get currently logged-in user from the JWT token
    private User getCurrentUser() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getName() != null && !"anonymousUser".equals(auth.getName())) {
                String collegeId = auth.getName();
                return userRepository.findByCollegeId(collegeId).orElse(null);
            }
        } catch (Exception e) {}
        return null;
    }

    // 1. Apply for Leave (Trainee or Trainer)
    @PostMapping("/apply")
    public ResponseEntity<java.util.Map<String, Object>> applyLeave(@Valid @RequestBody LeaveApplyRequest req) {
        User user = getCurrentUser();
        if (user == null && req.getCollegeId() != null) {
            user = userRepository.findByCollegeId(req.getCollegeId())
                    .orElseThrow(() -> new RuntimeException("Applicant user not found: " + req.getCollegeId()));
        }
        if (user == null) {
            throw new RuntimeException("User must be authenticated or collegeId provided!");
        }
        LeaveRequest saved = leaveService.applyLeave(user, req);
        return ResponseEntity.ok(leaveService.mapLeave(saved));
    }

    // 2. View Leaves by Student College ID
    @GetMapping("/by-student/{collegeId}")
    public ResponseEntity<List<java.util.Map<String, Object>>> getLeavesByCollegeId(@PathVariable String collegeId) {
        return ResponseEntity.ok(leaveService.getLeavesByCollegeId(collegeId));
    }

    // 3. View All Pending Leave Requests (Trainer / Admin review dashboard)
    @GetMapping("/pending")
    public ResponseEntity<List<java.util.Map<String, Object>>> getPendingLeaves() {
        return ResponseEntity.ok(leaveService.getPendingLeavesMapped());
    }

    // 4. View All Leave Requests
    @GetMapping("/all")
    public ResponseEntity<List<java.util.Map<String, Object>>> getAllLeaves() {
        return ResponseEntity.ok(leaveService.getAllLeavesMapped());
    }

    // 5. Review a Leave Request (Approve / Reject)
    @PutMapping("/{leaveId}/review")
    public ResponseEntity<java.util.Map<String, Object>> reviewLeave(
            @PathVariable Long leaveId,
            @Valid @RequestBody LeaveReviewRequest req) {
        User reviewer = getCurrentUser();
        if (reviewer == null) {
            reviewer = userRepository.findByCollegeId("KISS-FAC-001").orElse(null);
        }
        LeaveRequest updated = leaveService.reviewLeave(leaveId, reviewer, req);
        return ResponseEntity.ok(leaveService.mapLeave(updated));
    }
}