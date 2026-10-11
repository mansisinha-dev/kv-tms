package com.kiss.kv_tms.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class WorkshopProposeDTO {

    @NotBlank(message = "Workshop name is required")
    private String name;

    private String shortName;
    private String category;
    private Long courseId;
    private String productName;
    private String sku;
    private String batchPrefix;
    private Double sellingPrice;
    private Double incentiveRate;
    private String bomSummary;
    private String proposalRemarks;
}
