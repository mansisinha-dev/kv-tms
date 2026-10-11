package com.kiss.kv_tms.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ForecastResponseDTO {

    private Long productId;
    private String productName;
    private String sku;
    private String forecastPeriod; // e.g., "Next 7 Days (Week ending 2026-10-04)"

    private Integer historicalSalesUnits;   // Past sales volume
    private Integer expectedSales;          // Predicted future demand (AI)
    private Integer currentStock;           // Current finished goods stock
    private Integer safetyBuffer;           // 15% safety stock
    private Integer recommendedProduction;  // max(0, (Expected + Buffer) - Stock)

    private Double confidenceScore;         // AI model confidence (e.g. 0.85)
    private String algorithmUsed;           // "Linear Trend Regression + Exponential Smoothing"
    private String decisionSupportNote;     // Guidance for administrator
}