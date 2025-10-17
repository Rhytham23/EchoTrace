package com.echotrace.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonInclude;


import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@Schema(name = "LogEntryResponse", description = "Response DTO representing a saved log entry")
public class LogEntryResponse {

    @Schema(description = "Unique identifier of the log entry")
    private String id;

    @Schema(description = "Title of the log entry")
    private String title;

    @Schema(description = "Problem description")
    private String problem;

    @Schema(description = "Solution to the problem")
    private String solution;

    @Schema(description = "Reference links")
    private List<String> referenceLinks;

    @Schema(description = "Tags for this log entry")
    private List<String> tags;

    @Schema(description = "Optional code snippet")
    private String codeSnippet;

    @Schema(description = "Preview of attached files")
    private List<String> attachments;

    @Schema(description = "Time when this entry was created")
    private LocalDateTime createdAt;

    @Schema(description = "Last updated timestamp")
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private LocalDateTime updatedAt;

    @Schema(description = "All matched fields")
    private List<String> matchedOn;

    @Schema(description = "User who created the log")
    private String createdBy;
}
