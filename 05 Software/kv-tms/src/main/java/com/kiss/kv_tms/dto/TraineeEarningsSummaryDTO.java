package com.kiss.kv_tms.dto;

import com.kiss.kv_tms.entity.StudentIncentive;
import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TraineeEarningsSummaryDTO {
    private Long traineeId;
    private String fullName;
    private Double totalEarned;
    private Double totalDisbursed;
    private Double totalPending;
    private List<StudentIncentive> records;
}