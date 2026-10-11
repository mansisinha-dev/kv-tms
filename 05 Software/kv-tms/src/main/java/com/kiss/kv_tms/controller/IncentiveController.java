package com.kiss.kv_tms.controller;

import com.kiss.kv_tms.dto.IncentiveDisburseDTO;
import com.kiss.kv_tms.dto.TraineeEarningsSummaryDTO;
import com.kiss.kv_tms.entity.StudentIncentive;
import com.kiss.kv_tms.entity.Trainee;
import com.kiss.kv_tms.entity.User;
import com.kiss.kv_tms.repository.TraineeRepository;
import com.kiss.kv_tms.repository.UserRepository;
import com.kiss.kv_tms.service.IncentiveService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/incentives")
public class IncentiveController {

    @Autowired private IncentiveService incentiveService;
    @Autowired private UserRepository userRepo;
    @Autowired private TraineeRepository traineeRepo;

    // 1. Calculate & Generate Incentives for a Completed Production Batch (Admin/Trainer)
    @PostMapping("/batches/{runId}/calculate")
    public ResponseEntity<List<StudentIncentive>> calculateBatchIncentives(@PathVariable Long runId) {
        return ResponseEntity.ok(incentiveService.generateIncentivesForBatch(runId));
    }

    // 2. Trainee Portal: View My Personal Earnings Ledger
    @GetMapping("/my-earnings")
    public ResponseEntity<TraineeEarningsSummaryDTO> getMyEarnings() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String collegeId = auth.getName();
        User user = userRepo.findByCollegeId(collegeId)
                .orElseThrow(() -> new RuntimeException("User not found: " + collegeId));

        Trainee trainee = traineeRepo.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Trainee profile not found for: " + collegeId));

        return ResponseEntity.ok(incentiveService.getTraineeEarnings(trainee.getId()));
    }

    // 3. Admin / Trainer: View any trainee's earnings
    @GetMapping("/trainees/{traineeId}")
    public ResponseEntity<TraineeEarningsSummaryDTO> getTraineeEarningsById(@PathVariable Long traineeId) {
        return ResponseEntity.ok(incentiveService.getTraineeEarnings(traineeId));
    }

    // 4. Admin Portal: View All Pending Payouts
    @GetMapping("/pending")
    public ResponseEntity<List<StudentIncentive>> getPendingIncentives() {
        return ResponseEntity.ok(incentiveService.getAllPendingIncentives());
    }

    // 5. Admin Portal: Disburse / Pay Out Incentive
    @PutMapping("/{incentiveId}/disburse")
    public ResponseEntity<StudentIncentive> disburseIncentive(
            @PathVariable Long incentiveId,
            @Valid @RequestBody IncentiveDisburseDTO dto) {
        return ResponseEntity.ok(incentiveService.disburseIncentive(incentiveId, dto));
    }

    // 6. Trainee Portal / Public Query: View Earnings by College ID directly
    @GetMapping("/by-college-id/{collegeId}")
    public ResponseEntity<TraineeEarningsSummaryDTO> getEarningsByCollegeId(@PathVariable String collegeId) {
        User user = userRepo.findByCollegeId(collegeId)
                .orElseThrow(() -> new RuntimeException("User not found: " + collegeId));
        Trainee trainee = traineeRepo.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Trainee profile not found for: " + collegeId));
        return ResponseEntity.ok(incentiveService.getTraineeEarnings(trainee.getId()));
    }

    // 7. Get All Incentives (Admin)
    @GetMapping("/all")
    public ResponseEntity<List<StudentIncentive>> getAllIncentives() {
        return ResponseEntity.ok(incentiveService.getAllIncentives());
    }

    // 8. Admin Disburses all incentives for a whole batch
    @PutMapping("/batches/{runId}/disburse")
    public ResponseEntity<List<StudentIncentive>> disburseBatchIncentives(
            @PathVariable Long runId,
            @RequestParam(required = false) String transactionReference) {
        return ResponseEntity.ok(incentiveService.disburseIncentivesForBatch(runId, transactionReference));
    }
}