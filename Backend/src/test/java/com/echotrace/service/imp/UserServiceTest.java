package com.echotrace.service.imp;

import com.echotrace.dto.PasswordUpdateRequest;
import com.echotrace.dto.UserProfileDTO;
import com.echotrace.exception.UnauthorizedException;
import com.echotrace.model.User;
import com.echotrace.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private UserService userService;

    private User testUser;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        // manually construct service with mocks
        userService = new UserService(userRepository, passwordEncoder);

        testUser = new User();
        testUser.setUsername("tester");
        testUser.setPassword("encodedPassword");
        testUser.setName("Test User");
        testUser.setEmail("test@example.com");
        testUser.setRole("Developer");
    }

    // ---------- getMyProfile Tests ----------

    @Test
    void testGetMyProfile_Success() {
        when(userRepository.findByUsername("tester")).thenReturn(Optional.of(testUser));

        UserProfileDTO profile = userService.getMyProfile("tester");

        assertNotNull(profile);
        assertEquals("tester", profile.getUsername());
        assertEquals("Test User", profile.getName());
        verify(userRepository).findByUsername("tester");
    }

    @Test
    void testGetMyProfile_UserNotFound() {
        when(userRepository.findByUsername("unknown")).thenReturn(Optional.empty());

        assertThrows(UnauthorizedException.class, () -> userService.getMyProfile("unknown"));
    }

    // ---------- updateMyProfile Tests ----------

    @Test
    void testUpdateMyProfile_Success() {
        when(userRepository.findByUsername("tester")).thenReturn(Optional.of(testUser));

        UserProfileDTO updatedDto = new UserProfileDTO();
        updatedDto.setName("Updated Name");
        updatedDto.setEmail("updated@example.com");
        updatedDto.setRole("Admin");

        UserProfileDTO result = userService.updateMyProfile("tester", updatedDto);

        assertEquals("Updated Name", result.getName());
        assertEquals("updated@example.com", result.getEmail());
        assertEquals("Admin", result.getRole());
        verify(userRepository).save(testUser);
    }

    @Test
    void testUpdateMyProfile_UserNotFound() {
        when(userRepository.findByUsername("unknown")).thenReturn(Optional.empty());

        UserProfileDTO dto = new UserProfileDTO();
        assertThrows(UnauthorizedException.class, () -> userService.updateMyProfile("unknown", dto));
    }

    // ---------- updatePassword Tests ----------

    @Test
    void testUpdatePassword_Success() {
        when(userRepository.findByUsername("tester")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("oldPassword", "encodedPassword")).thenReturn(true);
        when(passwordEncoder.encode("newPassword")).thenReturn("newEncodedPassword");

        PasswordUpdateRequest request = new PasswordUpdateRequest("oldPassword", "newPassword");
        userService.updatePassword("tester", request);

        verify(passwordEncoder).matches("oldPassword", "encodedPassword");
        verify(passwordEncoder).encode("newPassword");
        verify(userRepository).save(testUser);
        assertEquals("newEncodedPassword", testUser.getPassword());
    }

    @Test
    void testUpdatePassword_IncorrectCurrentPassword() {
        when(userRepository.findByUsername("tester")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("wrongPassword", "encodedPassword")).thenReturn(false);

        PasswordUpdateRequest request = new PasswordUpdateRequest("wrongPassword", "newPassword");

        assertThrows(UnauthorizedException.class, () -> userService.updatePassword("testuser", request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testUpdatePassword_UserNotFound() {
        when(userRepository.findByUsername("unknown")).thenReturn(Optional.empty());

        PasswordUpdateRequest request = new PasswordUpdateRequest("oldPassword", "newPassword");

        assertThrows(UnauthorizedException.class, () -> userService.updatePassword("unknown", request));
    }
}
