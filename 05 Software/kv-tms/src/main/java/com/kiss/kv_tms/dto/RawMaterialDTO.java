package com.kiss.kv_tms.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RawMaterialDTO {
    @NotBlank(message = "Material name is mandatory")
    private String name;

    @NotBlank(message = "Unit of measure is mandatory (e.g. Meters, Kg, Units)")
    private String unitOfMeasure;

    @NotNull(message = "Initial stock is mandatory")
    private Double currentStock;

    @NotNull(message = "Reorder level is mandatory")
    private Double reorderLevel;

    private Double unitCost;
}