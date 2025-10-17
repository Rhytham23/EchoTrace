package com.echotrace.repository;

import com.echotrace.model.LogEntry;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TestRepo extends MongoRepository<LogEntry, String> {
}
