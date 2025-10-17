package com.echotrace.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;

@AllArgsConstructor
@Data
public class SignupRequest {

    @Schema(description = "Unique username for new account", example = "rhytham123")
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 20, message = "Username must be between 3 and 20 characters")
    private String username;

    @Schema(description = "Password for the new account", example = "StrongP@ss123")
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters long")
    private String password;

    @Schema(description = "User's full name", example = "Rhytham Sharma")
    private String name;

    @Schema(description = "User's primary email", example = "rhytham@echotrace.com")
    private String email;

    @Schema(description = "User's developer role", example = "Software Developer")
    private String role;

}
