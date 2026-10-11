package com.kiss.kv_tms.dto;

import com.kiss.kv_tms.entity.LeaveStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LeaveReviewRequest {
    @NotNull(message = "Action status (APPROVED / REJECTED) is mandatory")
    private LeaveStatus status;
    private String reviewRemarks;
}