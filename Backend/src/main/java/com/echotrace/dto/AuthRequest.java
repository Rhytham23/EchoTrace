package com.echotrace.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;

@AllArgsConstructor
@Data
public class AuthRequest {

        @Schema(description = "Unique username of the account", example = "hello123")
        @NotBlank(message = "Username cannot be blank")
        private String username;

        @Schema(description = "Password of the account", example = "P@ssw0rd")
        @NotBlank(message = "Password cannot be blank")
        private String password;

}
