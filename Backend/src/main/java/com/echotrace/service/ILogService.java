package com.echotrace.service;

import com.echotrace.dto.LogEntryRequest;
import com.echotrace.dto.LogEntryResponse;

import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface ILogService {

    LogEntryResponse createLog(LogEntryRequest request, List<MultipartFile> files);

    LogEntryResponse getLogById(String id);

    Page<LogEntryResponse> getAllLogs(int page, int size, String sort);

    LogEntryResponse updateLog(String id, LogEntryRequest request, List<MultipartFile> files);

    void deleteLog(String id);

    Page<LogEntryResponse> filterLogs(
            String keyword, String tag,
            LocalDateTime beforeDate, LocalDateTime afterDate,
            LocalDateTime betweenStart, LocalDateTime betweenEnd,
            int page, int size, String sort);

}
