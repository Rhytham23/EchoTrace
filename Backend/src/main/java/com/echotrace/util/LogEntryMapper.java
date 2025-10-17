package com.echotrace.util;

import com.echotrace.dto.LogEntryRequest;
import com.echotrace.dto.LogEntryResponse;
import com.echotrace.model.LogEntry;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class LogEntryMapper {

    public LogEntry toEntity(LogEntryRequest request) {
        return LogEntry.builder()
                .title(request.getTitle())
                .problem(request.getProblem())
                .solution(request.getSolution())
                .referenceLinks(request.getReferenceLinks())
                .tags(request.getTags())
                .codeSnippet(request.getCodeSnippet())
                .build();
    }

    public LogEntryResponse toResponse(LogEntry entity) {

        List<String> previews = new ArrayList<>();
        if (entity.getFilePaths() != null && !entity.getFilePaths().isEmpty()) {
            for (String filename : entity.getFilePaths()) {
                String previewPath = "http://localhost:8082/uploads/" + filename; // full URL
                previews.add(previewPath);
            }
        }
        // Only include updatedAt if it differs from createdAt
        LocalDateTime updatedAt = null;
        if (entity.getUpdatedAt() != null && !entity.getUpdatedAt().equals(entity.getCreatedAt())) {
            updatedAt = entity.getUpdatedAt();
        }
        return LogEntryResponse.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .problem(entity.getProblem())
                .solution(entity.getSolution())
                .referenceLinks(entity.getReferenceLinks())
                .tags(entity.getTags())
                .codeSnippet(entity.getCodeSnippet())
                .attachments(previews)
                .createdAt(entity.getCreatedAt())
                .updatedAt(updatedAt)
                .createdBy(entity.getCreatedBy() != null ? entity.getCreatedBy().getUsername() : null)
                .build();
    }
}
