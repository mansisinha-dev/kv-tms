package com.kiss.kv_tms.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminRegisterRequest {

    @NotBlank(message = "College / Staff ID is required")
    private String collegeId;

    @NotBlank(message = "Full Name is required")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Valid email is required")
    private String email;

    private String contactNumber;

    private String department;

    @NotBlank(message = "Password is required")
    private String password;
}
