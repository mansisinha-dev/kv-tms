package com.kiss.kv_tms.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class ProductCreateDTO {

    @NotNull(message = "Course ID is mandatory")
    private Long courseId;

    @NotBlank(message = "Product name is mandatory")
    private String name;

    @NotBlank(message = "Product SKU / Code is mandatory")
    private String sku;

    private String description;

    @NotNull(message = "Selling price is mandatory")
    private Double sellingPrice;

    @NotNull(message = "Student incentive rate per unit is mandatory")
    private Double incentiveRatePerUnit;

    // Optional recipe items (BOM)
    private List<BOMItemDTO> bomList;

    @Data
    public static class BOMItemDTO {
        private Long rawMaterialId;
        private Double quantityPerUnit;
    }
}