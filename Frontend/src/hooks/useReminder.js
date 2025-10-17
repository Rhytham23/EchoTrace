import { useEffect, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { toast } from "react-toastify";
import { getMyProfile } from "../api/api";

const WEBSOCKET_URL = "http://localhost:8082/reminders";

export const useReminders = () => {
  const [reminders, setReminders] = useState([]);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const fetchPreference = async () => {
      try {
        const res = await getMyProfile();
        setEnabled(res.data.remindersEnabled);
      } catch (err) {
        console.error("Failed to fetch reminders preference", err);
      }
    };
    fetchPreference();
  }, []);

  useEffect(() => {
    if (!enabled) return; // Don't connect if disabled

    const client = new Client({
      webSocketFactory: () => new SockJS(WEBSOCKET_URL),
      reconnectDelay: 5000,
    });

    client.onConnect = () => {
      client.subscribe("/topic/reminders", (message) => {
        if (message.body && enabled) {
          const reminder = JSON.parse(message.body);
          setReminders(prev => [reminder, ...prev]);

          toast.info(`${reminder.type.toUpperCase()} Reminder: ${reminder.message}`, {
            position: "top-right",
            autoClose: 10000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });

          if (Notification.permission === "granted") {
            const notif = new Notification(`${reminder.type.toUpperCase()} Reminder`, {
              body: reminder.message,
              icon: "/logo192.png",
            });
            notif.onclick = () => {
              window.focus();
              window.location.href = "/";
            };
          }
        }
      });
    };

    client.activate();
    return () => client.deactivate();
  }, [enabled]);

  return { reminders, enabled, setEnabled };
};
