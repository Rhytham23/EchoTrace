package com.echotrace.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@AllArgsConstructor
@Data
public class ReminderMessage {
    private String type;
    private String message;
}
