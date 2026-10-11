package com.kiss.kv_tms.service;

import com.kiss.kv_tms.dto.IncentiveDisburseDTO;
import com.kiss.kv_tms.dto.TraineeEarningsSummaryDTO;
import com.kiss.kv_tms.entity.*;
import com.kiss.kv_tms.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class IncentiveService {

    @Autowired private StudentIncentiveRepository incentiveRepo;
    @Autowired private ProductionRunRepository runRepo;
    @Autowired private ProductionContributorRepository contributorRepo;
    @Autowired private TraineeRepository traineeRepo;

    // 1. Calculate and generate student incentives for a completed batch
    @Transactional
    public List<StudentIncentive> generateIncentivesForBatch(Long productionRunId) {
        ProductionRun run = runRepo.findById(productionRunId)
                .orElseThrow(() -> new RuntimeException("Batch not found: " + productionRunId));

        if (run.getStatus() != ProductionStatus.COMPLETED && run.getStatus() != ProductionStatus.PENDING_APPROVAL && run.getStatus() != ProductionStatus.APPROVED_FOR_SALE) {
            throw new RuntimeException("Cannot calculate incentives: Batch is not yet completed or submitted for approval!");
        }

        List<ProductionContributor> contributors = contributorRepo.findByProductionRunId(run.getId());
        if (contributors.isEmpty()) {
            throw new RuntimeException("No student craft contributors recorded for batch: " + run.getBatchNumber());
        }

        List<StudentIncentive> createdList = new ArrayList<>();
        double ratePerUnit = run.getProduct().getIncentiveRatePerUnit();

        for (ProductionContributor contrib : contributors) {
            // Prevent duplicate incentive calculations
            if (incentiveRepo.existsByProductionRunIdAndTraineeId(run.getId(), contrib.getTrainee().getId())) {
                continue;
            }

            double earned = contrib.getUnitsCrafted() * ratePerUnit;

            StudentIncentive incentive = StudentIncentive.builder()
                    .trainee(contrib.getTrainee())
                    .productionRun(run)
                    .product(run.getProduct())
                    .unitsCrafted(contrib.getUnitsCrafted())
                    .ratePerUnit(ratePerUnit)
                    .amountEarned(earned)
                    .status(IncentiveStatus.PENDING)
                    .build();

            createdList.add(incentiveRepo.save(incentive));
        }

        return createdList;
    }

    // 2. Trainee Earnings Summary (Total Earned, Disbursed, Pending)
    public TraineeEarningsSummaryDTO getTraineeEarnings(Long traineeId) {
        Trainee trainee = traineeRepo.findById(traineeId)
                .orElseThrow(() -> new RuntimeException("Trainee not found: " + traineeId));

        Double totalEarned = incentiveRepo.getTotalEarnedByTraineeId(traineeId);
        Double totalPending = incentiveRepo.getTotalPendingByTraineeId(traineeId);
        Double totalDisbursed = incentiveRepo.getTotalDisbursedByTraineeId(traineeId);
        List<StudentIncentive> records = incentiveRepo.findByTraineeId(traineeId);

        return TraineeEarningsSummaryDTO.builder()
                .traineeId(trainee.getId())
                .fullName(trainee.getFullName())
                .totalEarned(totalEarned)
                .totalPending(totalPending)
                .totalDisbursed(totalDisbursed)
                .records(records)
                .build();
    }

    // 3. Get All Pending Disbursals for Admin
    public List<StudentIncentive> getAllPendingIncentives() {
        return incentiveRepo.findByStatus(IncentiveStatus.PENDING);
    }

    // 4. Admin Disburses Incentive (Marks as Paid)
    @Transactional
    public StudentIncentive disburseIncentive(Long incentiveId, IncentiveDisburseDTO dto) {
        StudentIncentive incentive = incentiveRepo.findById(incentiveId)
                .orElseThrow(() -> new RuntimeException("Incentive record not found: " + incentiveId));

        incentive.setStatus(IncentiveStatus.DISBURSED);
        incentive.setTransactionReference(dto.getTransactionReference());
        incentive.setDisbursedDate(dto.getDisbursedDate() != null ? dto.getDisbursedDate() : LocalDate.now());

        return incentiveRepo.save(incentive);
    }

    // 5. Admin Disburses all incentives for a whole batch at once
    @Transactional
    public List<StudentIncentive> disburseIncentivesForBatch(Long productionRunId, String txRef) {
        // First ensure incentives are generated
        try {
            generateIncentivesForBatch(productionRunId);
        } catch (Exception ignored) {}

        List<StudentIncentive> batchIncentives = incentiveRepo.findAll().stream()
                .filter(i -> i.getProductionRun() != null && i.getProductionRun().getId().equals(productionRunId))
                .toList();

        List<StudentIncentive> updated = new ArrayList<>();
        String ref = (txRef != null && !txRef.isBlank()) ? txRef : ("DBT-KISS-" + System.currentTimeMillis());
        for (StudentIncentive i : batchIncentives) {
            i.setStatus(IncentiveStatus.DISBURSED);
            i.setTransactionReference(ref);
            i.setDisbursedDate(LocalDate.now());
            updated.add(incentiveRepo.save(i));
        }
        return updated;
    }

    // 6. Get All Incentives
    public List<StudentIncentive> getAllIncentives() {
        return incentiveRepo.findAll();
    }
}