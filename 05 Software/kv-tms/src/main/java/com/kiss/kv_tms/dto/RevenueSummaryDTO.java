package com.kiss.kv_tms.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RevenueSummaryDTO {
    private Double totalRevenue;
    private Long totalOrdersCount;
    private Long completedBatchesCount;
    private Long activeProductsCount;
}