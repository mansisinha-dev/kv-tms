package com.kiss.kv_tms.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.time.LocalDate;

@Data
public class TrainerRegisterRequest {

    @NotBlank(message = "College / Staff ID is mandatory")
    private String collegeId;

    @NotBlank(message = "College Email is mandatory")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Full name is mandatory")
    private String fullName;

    @NotBlank(message = "Contact number is mandatory")
    private String contactNumber;

    private String specialization;

    private String address;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dob;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate joiningDate;

    private String bloodGroup;

    @NotBlank(message = "Password is mandatory")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;
}