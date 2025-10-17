package com.echotrace.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Schema(name = "PasswordUpdateRequest", description = "DTO for changing user password")
public class PasswordUpdateRequest {

    @NotBlank(message = "Current password cannot be blank")
    private String currentPassword;

    @NotBlank(message = "New password cannot be blank")
    private String newPassword;
}