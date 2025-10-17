package com.echotrace.service.imp;

import com.echotrace.dto.ReminderMessage;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class ReminderServiceTest {

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private ReminderService reminderService;

    @Test
    void dailyReminder_ShouldSendDailyMessage() {
        reminderService.dailyReminder();

        verify(messagingTemplate).<Object>convertAndSend(
                eq("/topic/reminders"),
                any(ReminderMessage.class)
        );
    }

    @Test
    void weeklyReminder_ShouldSendWeeklyMessage() {
        reminderService.weeklyReminder();

        verify(messagingTemplate).<Object>convertAndSend(
                eq("/topic/reminders"),
                any(ReminderMessage.class)
        );
    }
}
