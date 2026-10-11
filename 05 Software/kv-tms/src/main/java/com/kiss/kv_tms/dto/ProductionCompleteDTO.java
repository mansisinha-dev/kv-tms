package com.kiss.kv_tms.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class ProductionCompleteDTO {

    @NotNull(message = "Completed quantity is mandatory")
    private Integer completedQuantity;

    // Which students crafted this batch
    private List<ContributorItem> contributors;

    @Data
    public static class ContributorItem {
        private Long traineeId;
        private Integer unitsCrafted;
    }
}