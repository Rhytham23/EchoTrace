/**
 * Requests browser permission for desktop notifications.
 * Must be called once (e.g., on app startup).
 */
export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    alert("This browser does not support desktop notifications.");
    return false;
  }

  let permission = Notification.permission;
  if (permission === "default") {
    permission = await Notification.requestPermission();
  }

  return permission === "granted";
};
