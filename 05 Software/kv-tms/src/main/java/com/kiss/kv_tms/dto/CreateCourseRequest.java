package com.kiss.kv_tms.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class CreateCourseRequest {

    @NotBlank(message = "Course name is mandatory")
    private String name;

    @NotBlank(message = "Course code is mandatory")
    private String code;

    private String description;

    private Integer durationMonths = 6;

    private Double fee = 12000.0;

    private List<SyllabusModuleDTO> syllabusModules;
}

