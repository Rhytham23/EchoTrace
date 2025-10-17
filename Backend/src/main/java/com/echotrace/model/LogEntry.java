package com.echotrace.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Document(collection = "log_entries")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LogEntry {

    @Id
    private String id = UUID.randomUUID().toString();

    private String title;

    private String problem;

    private String solution;

    private List<String> referenceLinks = new ArrayList<>();

    private String codeSnippet;

    private List<String> tags = new ArrayList<>();

    private List<String> filePaths = new ArrayList<>();

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    private EmbeddedUser createdBy;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class EmbeddedUser {
        private String id;
        private String username;
    }
}
