package com.kiss.kv_tms.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ScoreRecordRequest {
    @NotNull(message = "Trainee ID is mandatory")
    private Long traineeId;

    @NotNull(message = "Course ID is mandatory")
    private Long courseId;

    @NotNull(message = "Overall score is mandatory")
    private Double overallScore;

    private String grade;
    private Double practicalMarks;
    private String remarks;
}