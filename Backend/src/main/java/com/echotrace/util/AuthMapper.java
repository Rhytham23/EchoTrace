package com.echotrace.util;

import com.echotrace.dto.AuthResponse;
import com.echotrace.dto.SignupRequest;
import com.echotrace.model.User;
import org.springframework.stereotype.Component;

@Component
public class AuthMapper {

    public User toUser(SignupRequest signupRequest, String encodedPassword){
        return User.builder()
                .username(signupRequest.getUsername())
                .password(encodedPassword)
                .name(signupRequest.getName())
                .email(signupRequest.getEmail())
                .role(signupRequest.getRole())
                .build();
    }

    public AuthResponse toAuthResponse(String token, String username, String refreshToken){
        return new AuthResponse(token, username, refreshToken);
    }
}
