package com.kiss.kv_tms.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SyllabusModuleDTO {
    @NotBlank(message = "Module title is mandatory")
    private String moduleTitle;
    private String description;
    private Integer durationHours;
    private Integer orderNo;
}