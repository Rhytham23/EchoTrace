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
import com.echotrace.util.LogEntryMapper;
import com.echotrace.util.SecurityUtil;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LogServiceTest {

    @Mock
    private LogRepository repository;
    @Mock
    private LogMongoRepository logMongoRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private FileStorageService fileStorageService;
    @Mock
    private LogEntryMapper mapper;

    @InjectMocks
    private LogService logService;

    private User testUser;
    private LogEntry logEntry;
    private LogEntryResponse logResponse;
    private MockedStatic<SecurityUtil> securityUtilMock;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId("u1");
        testUser.setUsername("testUser");

        logEntry = new LogEntry();
        logEntry.setId("log1");
        logEntry.setTitle("Bug Fix");
        logEntry.setProblem("NullPointer");
        logEntry.setTags(List.of("java", "spring"));
        logEntry.setCreatedAt(LocalDateTime.now());
        logEntry.setCreatedBy(new LogEntry.EmbeddedUser(testUser.getId(), testUser.getUsername()));

        logResponse = LogEntryResponse.builder()
                .id(logEntry.getId())
                .title("Bug Fix")
                .problem("NullPointer")
                .solution("Added null check")
                .tags(List.of("java", "spring"))
                .createdBy("testUser")
                .createdAt(logEntry.getCreatedAt())
                .updatedAt(LocalDateTime.now())
                .attachments(List.of("file1.txt"))
                .build();

        securityUtilMock = mockStatic(SecurityUtil.class);
        securityUtilMock.when(SecurityUtil::getCurrentUsername).thenReturn("testUser");
    }

    @AfterEach
    void tearDown() {
        securityUtilMock.close();
    }

    @Test
    void createLog_ShouldSaveAndReturnMappedResponse_WithFiles() {
        LogEntryRequest request = new LogEntryRequest();
        request.setTitle("Bug Fix");
        request.setProblem("NullPointerException");
        request.setSolution("Added null check");
        request.setTags(List.of("java", "spring"));

        MockMultipartFile mockFile = new MockMultipartFile(
                "file", "test.txt", "text/plain", "file content".getBytes()
        );

        when(mapper.toEntity(request)).thenReturn(logEntry);
        when(fileStorageService.saveFile(mockFile)).thenReturn("file1.txt");
        when(repository.save(any(LogEntry.class))).thenReturn(logEntry);
        when(mapper.toResponse(logEntry)).thenReturn(logResponse);
        when(userRepository.findByUsername("testUser")).thenReturn(Optional.of(testUser));

        LogEntryResponse response = logService.createLog(request, List.of(mockFile));

        assertThat(response.getTitle()).isEqualTo("Bug Fix");
        assertThat(response.getCreatedBy()).isEqualTo("testUser");
        assertThat(response.getAttachments()).containsExactly("file1.txt");

        verify(repository).save(any(LogEntry.class));
        verify(fileStorageService).saveFile(mockFile);
    }

    @Test
    void createLog_ShouldThrow_WhenUserNotFound() {
        LogEntryRequest request = new LogEntryRequest();
        when(userRepository.findByUsername("testUser")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> logService.createLog(request, null))
                .isInstanceOf(UsernameNotFoundException.class);
    }

    @Test
    void getLogById_ShouldReturnResponse_WhenOwner() {
        when(repository.findById("log1")).thenReturn(Optional.of(logEntry));
        when(mapper.toResponse(logEntry)).thenReturn(logResponse);

        LogEntryResponse response = logService.getLogById("log1");

        assertThat(response.getCreatedBy()).isEqualTo("testUser");
    }

    @Test
    void getLogById_ShouldThrow_WhenNotFound() {
        when(repository.findById("wrongId")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> logService.getLogById("wrongId"))
                .isInstanceOf(LogNotFoundException.class);
    }

    @Test
    void getLogById_ShouldThrow_WhenUnauthorized() {
        logEntry.setCreatedBy(new LogEntry.EmbeddedUser("u2", "otherUser"));
        when(repository.findById("log1")).thenReturn(Optional.of(logEntry));

        assertThatThrownBy(() -> logService.getLogById("log1"))
                .isInstanceOf(UnauthorizedException.class);
    }

    @Test
    void getAllLogs_ShouldReturnPage() {
        Page<LogEntry> page = new PageImpl<>(List.of(logEntry));
        when(repository.findByCreatedByUsername(eq("testUser"), any(Pageable.class)))
                .thenReturn(page);
        when(mapper.toResponse(logEntry)).thenReturn(logResponse);

        Page<LogEntryResponse> result = logService.getAllLogs(0, 10, "createdAt");

        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    void updateLog_ShouldUpdateFields_WhenOwner() {
        LogEntryRequest request = new LogEntryRequest();
        request.setTitle("Updated Title");

        when(repository.findById("log1")).thenReturn(Optional.of(logEntry));
        when(repository.save(any(LogEntry.class))).thenReturn(logEntry);
        when(mapper.toResponse(logEntry)).thenReturn(logResponse);

        LogEntryResponse response = logService.updateLog("log1", request, null);

        assertThat(response).isNotNull();
        verify(repository).save(logEntry);
    }

    @Test
    void deleteLog_ShouldDeleteLogAndFiles_WhenOwner() throws IOException {
        logEntry.setFilePaths(List.of("file1.txt"));
        when(repository.findById("log1")).thenReturn(Optional.of(logEntry));
        when(fileStorageService.loadFile("file1.txt")).thenReturn(Path.of("file1.txt"));

        try (MockedStatic<Files> filesMock = mockStatic(Files.class)) {
            filesMock.when(() -> Files.deleteIfExists(any(Path.class))).thenReturn(true);

            logService.deleteLog("log1");

            filesMock.verify(() -> Files.deleteIfExists(Path.of("file1.txt")));
            verify(repository).delete(logEntry);
        }
    }

    @Test
    void filterLogs_ShouldReturnMatchedOnTagAndKeyword() {
        logEntry.setTags(List.of("java"));
        logEntry.setTitle("Spring Boot test");

        Page<LogEntry> page = new PageImpl<>(List.of(logEntry));
        when(logMongoRepository.filterLogs(
                eq("testUser"), any(), any(), any(), any(), any(), any(), any(Pageable.class)))
                .thenReturn(page);
        when(mapper.toResponse(logEntry)).thenReturn(logResponse);

        Page<LogEntryResponse> result = logService.filterLogs(
                "spring", "java", null, null, null, null, 0, 10, "createdAt");

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getMatchedOn()).isNotEmpty();
    }
}
