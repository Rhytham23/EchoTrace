package com.echotrace.service.imp;

import com.echotrace.dto.PasswordUpdateRequest;
import com.echotrace.dto.UserProfileDTO;
import com.echotrace.exception.UnauthorizedException;
import com.echotrace.model.User;
import com.echotrace.repository.UserRepository;
import com.echotrace.service.IUserService;
import lombok.AllArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class UserService implements IUserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserProfileDTO getMyProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        UserProfileDTO dto = new UserProfileDTO();
        dto.setUsername(user.getUsername());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setRemindersEnabled(user.isRemindersEnabled());
        return dto;
    }

    @Override
    public UserProfileDTO updateMyProfile(String username, UserProfileDTO profileDTO) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        //  Only update if the field is present (not null or blank)
        if (profileDTO.getName() != null && !profileDTO.getName().isBlank()) {
            user.setName(profileDTO.getName());
        }
        if (profileDTO.getEmail() != null && !profileDTO.getEmail().isBlank()) {
            user.setEmail(profileDTO.getEmail());
        }
        if (profileDTO.getRole() != null && !profileDTO.getRole().isBlank()) {
            user.setRole(profileDTO.getRole());
        }

        // RemindersEnabled is a boolean, so we update it based on the DTO value.
        user.setRemindersEnabled(profileDTO.isRemindersEnabled());

        userRepository.save(user);
        return getMyProfile(username);
    }

    @Override
    public void updatePassword(String username, PasswordUpdateRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new UnauthorizedException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}