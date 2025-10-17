package com.echotrace.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationException( MethodArgumentNotValidException ex, HttpServletRequest request){

        Map<String,String> errors = new LinkedHashMap<>();
        for(FieldError fieldError : ex.getBindingResult().getFieldErrors()){
            errors.put(fieldError.getField(),fieldError.getDefaultMessage());
        }
        return ResponseEntity.badRequest().body(
                buildErrorResponse( HttpStatus.BAD_REQUEST, "Validation Failed", request.getRequestURI(), errors));
    }

    @ExceptionHandler(LogNotFoundException.class)
    public ResponseEntity<?> handleLogNotFoundException(LogNotFoundException ex, HttpServletRequest request){
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                buildErrorResponse( HttpStatus.NOT_FOUND, ex.getMessage(), request.getRequestURI()));
    }


    @ExceptionHandler(FileStorageException.class)
    public ResponseEntity<?> handleFileStorageException(FileStorageException ex, HttpServletRequest request){
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                buildErrorResponse( HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage(), request.getRequestURI()));
    }


    @ExceptionHandler(UnsupportedFileException.class)
    public ResponseEntity<?> handleUnsupportedFileException(UnsupportedFileException ex, HttpServletRequest request){
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                buildErrorResponse( HttpStatus.BAD_REQUEST, ex.getMessage(), request.getRequestURI()));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<String> handleBadCredentials(BadCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Invalid username or password");
    }

    @ExceptionHandler(LockedException.class)
    public ResponseEntity<String> handleLocked(LockedException ex) {
        return ResponseEntity.status(HttpStatus.LOCKED)
                .body("Account is locked. Contact admin.");
    }

    @ExceptionHandler(DisabledException.class)
    public ResponseEntity<String> handleDisabled(DisabledException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("Account is disabled. Contact support.");
    }

    @ExceptionHandler(AuthenticationException.class)  // fallback
    public ResponseEntity<String> handleAuthExceptions(AuthenticationException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Authentication failed: " + ex.getMessage());
    }
    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<String> handleUnauthorizedException(UnauthorizedException ex) {
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body("You are not authorized." + ex.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGenericException(Exception ex, HttpServletRequest request){
        ex.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                buildErrorResponse( HttpStatus.INTERNAL_SERVER_ERROR, "Something went wrong", request.getRequestURI()));
    }

    private Map<String, Object> buildErrorResponse(HttpStatus status, String message, String path){

        Map<String, Object> errorDetails = new LinkedHashMap<>();
        errorDetails.put("timestamp", LocalDateTime.now());
        errorDetails.put("status", status.value());
        errorDetails.put("error", status.getReasonPhrase());
        errorDetails.put("message", message);
        errorDetails.put("path", path);

        return errorDetails;
    }

    private Map<String, Object> buildErrorResponse(HttpStatus status, String message, String path, Map<String, String> validationErrors ){

        Map<String, Object> errorDetails = buildErrorResponse(status,message, path);
        errorDetails.put("errors", validationErrors);

        return errorDetails;
    }
}
