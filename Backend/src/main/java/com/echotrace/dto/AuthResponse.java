package com.echotrace.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AuthResponse {
    @Schema(description = "JWT token generated after login")
    private String token;

    @Schema(description = "Username tied to the token", example = "rhytham123")
    private String username;

    @Schema(description = "Refresh token for long-lived sessions")
    private String refreshToken;
}
