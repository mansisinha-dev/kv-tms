package com.kiss.kv_tms.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemAnalyticsDTO {

    // 1. Training & Students
    private Long totalStudentsEnrolled;
    private Long totalVocationalCourses;

    // 2. Manufacturing & Inventory
    private Long completedProductionBatches;
    private Long activeRawMaterials;
    private Integer totalFinishedGoodsInStock;

    // 3. Sales & Financials
    private Long totalSalesOrders;
    private Double totalRevenueGenerated;

    // 4. "Earn While Learn"
    private Double totalStudentIncentivesPaid;
}