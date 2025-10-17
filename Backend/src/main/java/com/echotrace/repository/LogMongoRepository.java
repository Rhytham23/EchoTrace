package com.echotrace.repository;

import com.echotrace.model.LogEntry;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Repository
@AllArgsConstructor
public class LogMongoRepository {

    private final MongoTemplate mongoTemplate;

    public Page<LogEntry> filterLogs(
            String username,
            String keyword,
            String tag,
            LocalDateTime beforeDate,
            LocalDateTime afterDate,
            LocalDateTime betweenStart,
            LocalDateTime betweenEnd,
            Pageable pageable
    ) {
        List<Criteria> criteriaList = new ArrayList<>();

        // Filter by current user
        if (username != null && !username.isEmpty()) {
            criteriaList.add(Criteria.where("createdBy.username").is(username));
        }

        // Keyword search in title, problem, solution, tags
        if (keyword != null && !keyword.isEmpty()) {
            criteriaList.add(new Criteria().orOperator(
                    Criteria.where("title").regex(keyword, "i"),
                    Criteria.where("problem").regex(keyword, "i"),
                    Criteria.where("solution").regex(keyword, "i"),
                    Criteria.where("tags").regex(keyword, "i")
            ));
        }

        // Exact tag match
        if (tag != null && !tag.isEmpty()) {
            criteriaList.add(Criteria.where("tags").is(tag));
        }

        // Date filters
        if (beforeDate != null) {
            criteriaList.add(new Criteria().orOperator(
                    Criteria.where("createdAt").lt(beforeDate),
                    Criteria.where("updatedAt").lt(beforeDate)
            ));
        }

        if (afterDate != null) {
            criteriaList.add(new Criteria().orOperator(
                    Criteria.where("createdAt").gt(afterDate),
                    Criteria.where("updatedAt").gt(afterDate)
            ));
        }

        if (betweenStart != null && betweenEnd != null) {
            criteriaList.add(new Criteria().orOperator(
                    Criteria.where("createdAt").gte(betweenStart).lte(betweenEnd),
                    Criteria.where("updatedAt").gte(betweenStart).lte(betweenEnd)
            ));
        }

        // Combine criteria with AND
        Criteria criteria = new Criteria();
        if (!criteriaList.isEmpty()) {
            criteria.andOperator(criteriaList.toArray(new Criteria[0]));
        }

        Query query = new Query(criteria);
        long total = mongoTemplate.count(query, LogEntry.class);

        query.with(pageable);
        List<LogEntry> logs = mongoTemplate.find(query, LogEntry.class);

        return new PageImpl<>(logs, pageable, total);
    }
}
