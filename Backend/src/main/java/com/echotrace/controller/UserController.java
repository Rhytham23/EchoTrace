package com.echotrace.controller;

import com.echotrace.dto.PasswordUpdateRequest;
import com.echotrace.dto.UserProfileDTO;
import com.echotrace.service.IUserService;
import com.echotrace.util.SecurityUtil;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@Tag(name = "UserController", description = "Operations for user profile and settings")
@RequestMapping("/api/users")
@AllArgsConstructor
public class UserController {

    private final IUserService userService;

    @GetMapping("/profile")
    public ResponseEntity<UserProfileDTO> getProfile() {
        String username = SecurityUtil.getCurrentUsername();
        UserProfileDTO profile = userService.getMyProfile(username);
        return ResponseEntity.ok(profile);
    }

    @PatchMapping("/profile")
    public ResponseEntity<UserProfileDTO> updateProfile(@Valid @RequestBody UserProfileDTO profileDTO) {
        String username = SecurityUtil.getCurrentUsername();
        UserProfileDTO updatedProfile = userService.updateMyProfile(username, profileDTO);
        return ResponseEntity.ok(updatedProfile);
    }

    @PostMapping("/password")
    public ResponseEntity<String> changePassword(@Valid @RequestBody PasswordUpdateRequest request) {
        String username = SecurityUtil.getCurrentUsername();
        userService.updatePassword(username, request);
        return ResponseEntity.ok("Password updated successfully");
    }
}