package com.kiss.kv_tms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private String token;
    @Builder.Default
    private String type = "Bearer";
    private Long userId;
    private String collegeId;
    private String fullName;
    private String role;
    private String email;
    private String contactNumber;
    private String trade;
    private String courseName;
    private String courseCode;
    private String category;
    private String admissionDate;
    private String address;
    private String dob;
    private String joiningDate;
    private String bloodGroup;
    private String passOutDate;
    private Double courseFee;
    private String scholarshipType;
    private Integer scholarshipPercentage;
    private Double netFeePayable;
    private String feeStatus;
    private String message;
}