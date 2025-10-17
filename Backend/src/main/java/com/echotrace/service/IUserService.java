package com.echotrace.service;

import com.echotrace.dto.PasswordUpdateRequest;
import com.echotrace.dto.UserProfileDTO;

public interface IUserService {

    UserProfileDTO getMyProfile(String username);

    UserProfileDTO updateMyProfile(String username, UserProfileDTO profileDTO);

    void updatePassword(String username, PasswordUpdateRequest request);
}