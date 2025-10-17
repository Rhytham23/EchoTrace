package com.echotrace.controller;

import com.echotrace.dto.AuthRequest;
import com.echotrace.dto.AuthResponse;
import com.echotrace.dto.SignupRequest;
import com.echotrace.model.User;
import com.echotrace.repository.UserRepository;
import com.echotrace.security.JwtUtil;
import com.echotrace.util.AuthMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Objects;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AuthControllerTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthMapper authMapper;

    @InjectMocks
    private AuthController authController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    // ---------- REGISTER TESTS ----------

    @Test
    void testRegister_Success() {
        SignupRequest signupRequest = new SignupRequest(
                "tester", "password123", "Test User",
                "test@example.com", "Developer"
        );

        when(userRepository.existsByUsername("tester")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");
        User user = new User();
        when(authMapper.toUser(signupRequest, "encodedPassword")).thenReturn(user);

        ResponseEntity<String> response = authController.register(signupRequest);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals("Registration completed successfully", response.getBody());
        verify(userRepository).save(user);
    }

    @Test
    void testRegister_UsernameAlreadyExists() {
        SignupRequest signupRequest = new SignupRequest(
                "tester", "password123", "Test User",
                "test@example.com", "Developer"
        );

        when(userRepository.existsByUsername("tester")).thenReturn(true);

        ResponseEntity<String> response = authController.register(signupRequest);

        assertEquals(400, response.getStatusCodeValue());
        assertEquals("Username already exists", response.getBody());
        verify(userRepository, never()).save(any(User.class));
    }

    // ---------- LOGIN TESTS ----------

    @Test
    void testLogin_Success() {
        AuthRequest loginRequest = new AuthRequest("tester", "password123");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(mock(org.springframework.security.core.Authentication.class));
        when(jwtUtil.generateToken("tester")).thenReturn("jwtToken");
        when(jwtUtil.generateRefreshToken("tester")).thenReturn("refreshToken");

        User user = new User();
        user.setUsername("tester");
        when(userRepository.findByUsername("tester")).thenReturn(Optional.of(user));

        AuthResponse mappedResponse = new AuthResponse("jwtToken", "tester", "refreshToken");
        when(authMapper.toAuthResponse("jwtToken", "tester", "refreshToken"))
                .thenReturn(mappedResponse);

        ResponseEntity<AuthResponse> response = authController.login(loginRequest);

        assertEquals(200, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertEquals("jwtToken", response.getBody().getToken());
        assertEquals("refreshToken", response.getBody().getRefreshToken());
        verify(userRepository).save(user);
    }

    // ---------- REFRESH TOKEN TESTS ----------

    @Test
    void testRefreshToken_Valid() {
        AuthResponse refreshRequest = new AuthResponse("oldJwt", "tester", "validRefreshToken");

        when(jwtUtil.validateToken("validRefreshToken")).thenReturn(true);
        when(jwtUtil.extractUsername("validRefreshToken")).thenReturn("tester");

        User user = new User();
        user.setUsername("tester");
        user.setRefreshToken("validRefreshToken");
        when(userRepository.findByUsername("tester")).thenReturn(Optional.of(user));

        when(jwtUtil.generateToken("tester")).thenReturn("newJwtToken");
        AuthResponse mappedResponse = new AuthResponse("newJwtToken", "tester", "validRefreshToken");
        when(authMapper.toAuthResponse("newJwtToken", "tester", "validRefreshToken"))
                .thenReturn(mappedResponse);

        ResponseEntity<AuthResponse> response = authController.refreshToken(refreshRequest);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals("newJwtToken", Objects.requireNonNull(response.getBody()).getToken());
    }

    @Test
    void testRefreshToken_Invalid() {
        AuthResponse refreshRequest = new AuthResponse("oldJwt", "tester", "invalidRefreshToken");

        when(jwtUtil.validateToken("invalidRefreshToken")).thenReturn(false);

        ResponseEntity<AuthResponse> response = authController.refreshToken(refreshRequest);

        assertEquals(400, response.getStatusCodeValue());
        assertNull(response.getBody());
    }
}
