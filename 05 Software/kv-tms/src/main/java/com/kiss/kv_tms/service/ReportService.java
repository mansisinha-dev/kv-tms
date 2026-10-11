package com.kiss.kv_tms.service;

import com.kiss.kv_tms.dto.SystemAnalyticsDTO;
import com.kiss.kv_tms.entity.FinishedGoodsStock;
import com.kiss.kv_tms.entity.ProductionStatus;
import com.kiss.kv_tms.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReportService {

    @Autowired private TraineeRepository traineeRepo;
    @Autowired private CourseRepository courseRepo;
    @Autowired private ProductionRunRepository runRepo;
    @Autowired private RawMaterialRepository rawMaterialRepo;
    @Autowired private FinishedGoodsStockRepository stockRepo;
    @Autowired private OrderRepository orderRepo;
    @Autowired private StudentIncentiveRepository incentiveRepo;

    public SystemAnalyticsDTO getExecutiveAnalytics() {
        long totalStudents = traineeRepo.count();
        long totalCourses = courseRepo.count();

        long completedBatches = runRepo.findByStatus(ProductionStatus.COMPLETED).size();
        long activeMaterials = rawMaterialRepo.count();

        List<FinishedGoodsStock> allStock = stockRepo.findAll();
        int totalFinishedGoods = allStock.stream().mapToInt(FinishedGoodsStock::getAvailableStock).sum();

        long totalOrders = orderRepo.count();
        Double totalRevenue = orderRepo.getTotalRevenue();

        // Calculate all disbursed student incentives
        Double totalIncentivesPaid = incentiveRepo.findAll().stream()
                .filter(i -> i.getStatus().name().equals("DISBURSED"))
                .mapToDouble(i -> i.getAmountEarned())
                .sum();

        return SystemAnalyticsDTO.builder()
                .totalStudentsEnrolled(totalStudents)
                .totalVocationalCourses(totalCourses)
                .completedProductionBatches(completedBatches)
                .activeRawMaterials(activeMaterials)
                .totalFinishedGoodsInStock(totalFinishedGoods)
                .totalSalesOrders(totalOrders)
                .totalRevenueGenerated(totalRevenue)
                .totalStudentIncentivesPaid(totalIncentivesPaid)
                .build();
    }
}
