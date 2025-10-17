package com.echotrace.util;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.ArrayList;
import java.util.List;

public class PaginationUtil {

    /**
     * Creates a Pageable object from page, size, and sort parameters.
     *
     * Example sortParams: "title,desc&sort=createdAt,asc"
     */
    public static Pageable createPageRequest(int page, int size, String sortParams) {
        List<Sort.Order> orders = new ArrayList<>();

        if (sortParams != null && !sortParams.isEmpty()) {
            String[] sortArray = sortParams.split("&sort=");
            for (String sortParam : sortArray) {
                String[] parts = sortParam.split(",");
                String property = parts[0].trim();
                Sort.Direction direction = (parts.length > 1)
                        ? Sort.Direction.fromString(parts[1].trim())
                        : Sort.Direction.ASC;

                orders.add(new Sort.Order(direction, property));
            }
        }

        return PageRequest.of(page, size, Sort.by(orders));
    }
}
