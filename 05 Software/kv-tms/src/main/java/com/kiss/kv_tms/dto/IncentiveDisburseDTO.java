package com.kiss.kv_tms.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDate;

@Data
public class IncentiveDisburseDTO {
    @NotBlank(message = "Transaction reference / receipt number is mandatory")
    private String transactionReference; // e.g. "KISS-PAY-2026-0089"

    private LocalDate disbursedDate;
}