package com.echotrace.service.imp;

import com.echotrace.dto.LogEntryRequest;
import com.echotrace.dto.LogEntryResponse;
import com.echotrace.exception.LogNotFoundException;
import com.echotrace.exception.UnauthorizedException;
import com.echotrace.model.LogEntry;
import com.echotrace.model.User;
import com.echotrace.repository.LogMongoRepository;
import com.echotrace.repository.LogRepository;
import com.echotrace.repository.UserRepository;
import com.echotrace.service.ILogService;
import com.echotrace.util.LogEntryMapper;
import com.echotrace.util.PaginationUtil;
import com.echotrace.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;

@Service
@RequiredArgsConstructor
public class LogService implements ILogService {

    private final LogRepository repository; // MongoRepository<LogEntry, String>
    private final LogMongoRepository logMongoRepository; // custom Mongo filter repo
    private final FileStorageService fileStorageService;
    private final LogEntryMapper mapper;
    private final UserRepository userRepository;
    private final SecurityUtil securityUtil;

    private static final Logger log = LoggerFactory.getLogger(LogService.class);

    @Override
    public LogEntryResponse createLog(LogEntryRequest request, List<MultipartFile> files) {
        LogEntry logEntry = mapper.toEntity(request);

        String username = SecurityUtil.getCurrentUsername();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User " + username + " not found"));
        LogEntry.EmbeddedUser embeddedUser = new LogEntry.EmbeddedUser(user.getId(), user.getUsername());
        logEntry.setCreatedBy(embeddedUser);


        if (files != null && !files.isEmpty()) {
            List<String> storedPaths = files.stream()
                    .map(fileStorageService::saveFile)
                    .toList();
            logEntry.setFilePaths(storedPaths);
        }

        LogEntry savedLog = repository.save(logEntry); // Mongo save
        return mapper.toResponse(savedLog);
    }

    @Override
    public LogEntryResponse getLogById(String id) {
        LogEntry logEntry = repository.findById(id)
                .orElseThrow(() -> new LogNotFoundException("Log not found with id: " + id));

        String username = SecurityUtil.getCurrentUsername();
        if (!logEntry.getCreatedBy().getUsername().equals(username)) {
            throw new UnauthorizedException("You cannot access this log.");
        }
        return mapper.toResponse(logEntry);
    }

    @Override
    public Page<LogEntryResponse> getAllLogs(int page, int size, String sort) {
        Pageable pageable = PaginationUtil.createPageRequest(page, size, sort);
        String username = SecurityUtil.getCurrentUsername();

        Page<LogEntry> logPage = repository.findByCreatedByUsername(username, pageable);
        return logPage.map(mapper::toResponse);
    }

    @Override
    public LogEntryResponse updateLog(String id, LogEntryRequest request, List<MultipartFile> files) {
        LogEntry existingLog = repository.findById(id)
                .orElseThrow(() -> new LogNotFoundException("Log not found with id: " + id));

        String username = SecurityUtil.getCurrentUsername();
        if (!existingLog.getCreatedBy().getUsername().equals(username)) {
            throw new UnauthorizedException("You cannot update this log");
        }

        if (request.getTitle() != null) {
            existingLog.setTitle(request.getTitle());
        }
        if (request.getProblem() != null) {
            existingLog.setProblem(request.getProblem());
        }
        if (request.getReferenceLinks() != null) {
            existingLog.setReferenceLinks(request.getReferenceLinks());
        }
        if (request.getTags() != null) {
            existingLog.setTags(request.getTags());
        }
        if (request.getCodeSnippet() != null) {
            existingLog.setCodeSnippet(request.getCodeSnippet());
        }

        if(request.getFilesToDelete() != null && !request.getFilesToDelete().isEmpty()){
            List<String> currentPaths = existingLog.getFilePaths();
            if(currentPaths != null){
                currentPaths.removeAll(request.getFilesToDelete());

                for(String fileToDelete : request.getFilesToDelete()){
                    fileStorageService.deleteFile(fileToDelete);
                }
            }
        }

        if (files != null && !files.isEmpty()) {
            List<String> existingPaths = existingLog.getFilePaths();
            if (existingPaths == null) {
                existingPaths = new ArrayList<>();
            }
            for (MultipartFile file : files) {
                String savedPath = fileStorageService.saveFile(file);
                existingPaths.add(savedPath);
            }
            existingLog.setFilePaths(existingPaths);
        }

        LogEntry updatedLog = repository.save(existingLog);
        return mapper.toResponse(updatedLog);
    }

    @Override
    public void deleteLog(String id) {
        LogEntry logEntry = repository.findById(id)
                .orElseThrow(() -> new LogNotFoundException("Log not found with id: " + id));

        String username = SecurityUtil.getCurrentUsername();
        if (!logEntry.getCreatedBy().getUsername().equals(username)) {
            throw new UnauthorizedException("You cannot delete this log");
        }

        if (logEntry.getFilePaths() != null) {
            for (String filename : logEntry.getFilePaths()) {
                try {
                    Path fullPath = fileStorageService.loadFile(filename);
                    Files.deleteIfExists(fullPath);
                } catch (IOException e) {
                    log.error("Failed to delete file: {}", filename, e);
                }
            }
        }

        repository.delete(logEntry);
    }

    @Override
    public Page<LogEntryResponse> filterLogs(
            String keyword,
            String tag,
            LocalDateTime beforeDate,
            LocalDateTime afterDate,
            LocalDateTime betweenStart,
            LocalDateTime betweenEnd,
            int page,
            int size,
            String sort) {

        Pageable pageable = PaginationUtil.createPageRequest(page, size, sort);
        String username = SecurityUtil.getCurrentUsername();

        Page<LogEntry> logs = logMongoRepository.filterLogs(
                username, keyword, tag, beforeDate, afterDate, betweenStart, betweenEnd, pageable
        );

        return logs.map(entry -> {
            List<String> matchedOn = new ArrayList<>();

            if (tag != null && entry.getTags() != null &&
                    entry.getTags().stream().anyMatch(t -> t.equalsIgnoreCase(tag))) {
                matchedOn.add("tag: " + tag);
            }

            if (keyword != null) {
                if ((entry.getTitle() != null && entry.getTitle().toLowerCase().contains(keyword.toLowerCase()))
                        || (entry.getProblem() != null && entry.getProblem().toLowerCase().contains(keyword.toLowerCase()))
                        || (entry.getSolution() != null && entry.getSolution().toLowerCase().contains(keyword.toLowerCase()))
                        || (entry.getTags() != null && entry.getTags().stream().anyMatch(t -> t.toLowerCase().contains(keyword.toLowerCase())))) {
                    matchedOn.add("keyword: " + keyword);
                }
            }

            if (beforeDate != null || afterDate != null || (betweenStart != null && betweenEnd != null)) {
                if (matchesDate(entry.getCreatedAt(), beforeDate, afterDate, betweenStart, betweenEnd)) {
                    matchedOn.add("createdAt: " + entry.getCreatedAt());
                }
                if (entry.getUpdatedAt() != null && !entry.getUpdatedAt().equals(entry.getCreatedAt())
                        && matchesDate(entry.getUpdatedAt(), beforeDate, afterDate, betweenStart, betweenEnd)) {
                    matchedOn.add("updatedAt: " + entry.getUpdatedAt());
                }
            }

            LogEntryResponse response = mapper.toResponse(entry);
            response.setMatchedOn(matchedOn);
            response.setCreatedBy(entry.getCreatedBy().getUsername());
            return response;
        });
    }

    private boolean matchesDate(LocalDateTime date, LocalDateTime before, LocalDateTime after,
                                LocalDateTime betweenStart, LocalDateTime betweenEnd) {
        if (date == null) {
            return false;
        }
        if (before != null && date.isAfter(before)) {
            return false;
        }
        if (after != null && date.isBefore(after)) {
            return false;
        }
        if (betweenStart != null && betweenEnd != null &&
                (date.isBefore(betweenStart) || date.isAfter(betweenEnd))) {
            return false;
        }
        return true;
    }
}
