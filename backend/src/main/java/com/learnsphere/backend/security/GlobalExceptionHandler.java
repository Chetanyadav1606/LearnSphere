package com.learnsphere.backend.security;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(org.springframework.dao.DataIntegrityViolationException.class)
    public ResponseEntity<?> handleConflict(Exception e) {
        return ResponseEntity.status(409).body(Map.of(
            "error", "Data Integrity Violation",
            "message", "This record already exists or a constraint was violated.",
            "details", e.getMessage()
        ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGeneral(Exception e) {
        return ResponseEntity.status(500).body(Map.of(
            "error", "Internal Server Error",
            "message", e.getMessage()
        ));
    }
}