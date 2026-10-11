package com.kiss.kv_tms.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProductionRunCreateDTO {

    @NotNull(message = "Product ID is mandatory")
    private Long productId;

    @NotBlank(message = "Batch number is mandatory")
    private String batchNumber; // e.g. "BATCH-2026-SEW-001"

    @NotNull(message = "Target quantity is mandatory")
    private Integer targetQuantity;

    private String remarks;
}