package com.kiss.kv_tms.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank(message = "Username (College ID or Email) is required")
    private String username;

    @NotBlank(message = "Password is required")
    private String password;
}