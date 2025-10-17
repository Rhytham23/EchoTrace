package com.echotrace.controller;

import com.echotrace.dto.LogEntryRequest;
import com.echotrace.dto.LogEntryResponse;
import com.echotrace.service.ILogService;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@Tag(name = "LogController" , description = "CRUD operations for tracking problems and solutions")
@RequestMapping("/api/logs")
@RequiredArgsConstructor
public class LogController {

    private final ILogService logService;

    @PostMapping
    public ResponseEntity<LogEntryResponse> createLog(@Parameter(description = "Log details") @Valid @RequestPart("log")LogEntryRequest request,
                                                      @Parameter(description = "Optional files") @RequestPart(value = "files",required = false) List<MultipartFile> files){
        LogEntryResponse createdLog = logService.createLog(request,files);
        return ResponseEntity.ok(createdLog);
    }

    @GetMapping("id/{id}")
    public ResponseEntity<LogEntryResponse> getLogById(@PathVariable String id){
        LogEntryResponse log = logService.getLogById(id);
        return ResponseEntity.ok(log);
    }

    @GetMapping
    public ResponseEntity<Page<LogEntryResponse>> getAllLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {

        Page<LogEntryResponse> pagedLogs = logService.getAllLogs(page, size, sort);
        return ResponseEntity.ok(pagedLogs);
    }


    @PatchMapping("/{id}")
    public ResponseEntity<LogEntryResponse> updateLog(@PathVariable String id,
                                                      @RequestPart(value = "log", required = false) LogEntryRequest request,
                                                      @RequestPart(value = "files", required = false) List<MultipartFile> files){
        LogEntryResponse updatedLog = logService.updateLog(id, request, files);
        return ResponseEntity.ok(updatedLog);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteLog(@PathVariable String id){
        logService.deleteLog(id);
        return ResponseEntity.ok("Log deleted successfully");
    }

    @GetMapping("/filter")
    public ResponseEntity<Page<LogEntryResponse>> filterAdvanced(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime beforeDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime afterDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime betweenStart,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime betweenEnd,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {

        // Trim and normalize empty strings
        if (keyword != null && keyword.isBlank()) {
            keyword = null;
        }
        if (tag != null && tag.isBlank()) {
            tag = null;
        }

        Page<LogEntryResponse> result = logService.filterLogs(
                keyword, tag, beforeDate, afterDate, betweenStart, betweenEnd, page, size, sort
        );

        return ResponseEntity.ok(result);
    }



}
