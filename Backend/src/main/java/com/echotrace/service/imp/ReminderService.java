package com.echotrace.service.imp;

import com.echotrace.dto.ReminderMessage;
import com.echotrace.repository.UserRepository;
import com.echotrace.model.User;
import lombok.AllArgsConstructor;
import java.util.List;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
public class ReminderService {

    private final SimpMessagingTemplate messagingTemplate;
    private final UserRepository userRepository;


    private void sendReminders(String type, String message) {
        List<User> usersWithReminders = userRepository.findByRemindersEnabled(true);

        ReminderMessage reminder = new ReminderMessage(type, message);

        for(User user : usersWithReminders) {
            // In a production app, we would send to a unique user topic (e.g., /user/{userId}/topic/reminders)
            // For now, we use the general topic but only trigger once to prevent broadcast spam.
            messagingTemplate.convertAndSend("/topic/reminders", reminder);
            return; // Exit after one send for demo purposes on a general topic
        }
    }
    @Scheduled(cron = "0 0 20 * * *")
    public void dailyReminder(){
        String message = """
                Daily check-in :
                - Did you fix any issue or bug today?
                - Did you learn something worth noting down?
                """;

        ReminderMessage reminder = new ReminderMessage("daily",message);
        messagingTemplate.convertAndSend("/topic/reminders",reminder);
    }

    @Scheduled(cron = "0 0 20 * * MON")
    public void weeklyReminder(){
        String message = """
                Weekly reflection :
                - What was the toughest problem you solved this week? Remember the approach?
                - What do you want to improve next week?
                """;

        ReminderMessage reminder = new ReminderMessage("weekly",message);
        messagingTemplate.convertAndSend("/topic/reminders",reminder);
    }
}
