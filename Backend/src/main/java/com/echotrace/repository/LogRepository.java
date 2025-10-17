package com.echotrace.repository;

import com.echotrace.model.LogEntry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LogRepository extends MongoRepository<LogEntry, String> {

    Page<LogEntry> findByCreatedByUsername(String username, Pageable pageable);
}
