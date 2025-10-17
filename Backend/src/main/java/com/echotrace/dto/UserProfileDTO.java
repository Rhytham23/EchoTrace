package com.echotrace.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDate;

@Data
@Schema(name = "UserProfileDTO", description = "User's profile details for read/update")
public class UserProfileDTO {

    private String username;

    private String name;

    @Email
    private String email;

    private String role;

    private boolean remindersEnabled;

}