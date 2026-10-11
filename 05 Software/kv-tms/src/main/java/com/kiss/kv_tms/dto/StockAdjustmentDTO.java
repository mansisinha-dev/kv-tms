package com.kiss.kv_tms.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StockAdjustmentDTO {
    @NotNull(message = "Product ID is mandatory")
    private Long productId;

    @NotNull(message = "Available stock quantity is mandatory")
    private Integer availableStock;

    @NotNull(message = "Reorder level is mandatory")
    private Integer reorderLevel;
}