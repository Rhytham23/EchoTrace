package com.echotrace.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
@Schema(name = "LogEntryRequest", description = "Request DTO for creating or updating a log entry")
public class LogEntryRequest {

    @NotBlank(message = "Title cannot be blank")
    @Size(max = 200, message = "Title is too long")
    @Schema(description = "Short title or label for the log", example = "Login Bug - NullPointerException")
    private String title;

    @NotBlank(message = "Problem description cannot be blank")
    @Schema(description = "Description of the problem", example = "NullPointerException on login API")
    private String problem;

    @NotBlank(message = "Solution cannot be blank")
    @Schema(description = "How the issue was resolved", example = "Added null check for user object")
    private String solution;

    @Schema(description = "Relevant reference links", example = "[\"https://stackoverflow.com/q/123456\"]")
    private List<String> referenceLinks = new ArrayList<>();

    @Schema(description = "Tags for categorizing or searching logs", example = "[\"springboot\", \"bugfix\", \"auth\"]")
    private List<String> tags = new ArrayList<>();

    @Schema(description = "Optional code snippet related to the problem", example = "if(user != null) { login(user); }")
    private String codeSnippet;

    // New field for tracking files user wants to delete
    @Schema(description = "List of file names/paths to delete from this log")
    private List<String> filesToDelete = new ArrayList<>();

}
