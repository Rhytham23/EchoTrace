package com.echotrace.controller;

import com.echotrace.dto.AuthRequest;
import com.echotrace.dto.AuthResponse;
import com.echotrace.dto.SignupRequest;
import com.echotrace.model.User;
import com.echotrace.repository.UserRepository;
import com.echotrace.security.JwtUtil;
import com.echotrace.util.AuthMapper;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Objects;
import java.util.Optional;

@RestController
@Tag(name = "AuthController" , description = "Authentication operations for register and login")
@RequestMapping("/api/auth")
@AllArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthMapper authMapper;

    @PostMapping("/register")
    public ResponseEntity<String> register(@Valid @RequestBody SignupRequest signupRequest){

        if(userRepository.existsByUsername(signupRequest.getUsername())) {
            return ResponseEntity.badRequest().body("Username already exists");
        }

        String encodedPassword = passwordEncoder.encode(signupRequest.getPassword());
        User user  = authMapper.toUser(signupRequest, encodedPassword);
        userRepository.save(user);

        return ResponseEntity.ok("Registration completed successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest loginRequest){
        Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));
        String token = jwtUtil.generateToken(loginRequest.getUsername());
        // Generate and store refresh token
        String refreshToken = jwtUtil.generateRefreshToken(loginRequest.getUsername());
        Optional<User> userOptional = userRepository.findByUsername(loginRequest.getUsername());
        userOptional.ifPresent(user -> {
            user.setRefreshToken(refreshToken);
            userRepository.save(user);
        });

        // Mapper now requires refreshToken
        AuthResponse authResponse = authMapper.toAuthResponse(token, loginRequest.getUsername(), refreshToken);
        return ResponseEntity.ok(authResponse);

    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(@RequestBody AuthResponse refreshRequest) {
        String refreshToken = refreshRequest.getRefreshToken();

        if (jwtUtil.validateToken(refreshToken)) {
            String username = jwtUtil.extractUsername(refreshToken);
            Optional<User> userOptional = userRepository.findByUsername(username);

            if (userOptional.isPresent() && Objects.equals(userOptional.get().getRefreshToken(), refreshToken)) {
                String newJwtToken = jwtUtil.generateToken(username);
                return ResponseEntity.ok(authMapper.toAuthResponse(newJwtToken, username, refreshToken));
            }
        }
        return ResponseEntity.badRequest().body(null);
    }
}