package com.kiss.kv_tms.dto;

import com.kiss.kv_tms.entity.AttendanceStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class BatchAttendanceRequest {

    @NotNull(message = "Course ID is mandatory")
    private Long courseId;

    @NotNull(message = "Attendance date is mandatory")
    private LocalDate date;

    private List<AttendanceItem> attendanceList;

    @Data
    public static class AttendanceItem {
        private Long traineeId;
        private AttendanceStatus status;
        private String remarks;
    }
}