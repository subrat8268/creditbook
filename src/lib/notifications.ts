import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { colors } from "../utils/theme";

export type OverdueReminder = {
  customerId: string;
  customerName: string;
  balance: number;
  daysSince: number;
};

const OVERDUE_CATEGORY = "overdue-reminders";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function ensureNotificationPermission(): Promise<boolean> {
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.AUTHORIZED) {
    return true;
  }

  const request = await Notifications.requestPermissionsAsync();
  return Boolean(
    request.granted || request.ios?.status === Notifications.IosAuthorizationStatus.AUTHORIZED,
  );
}

export async function configureNotificationChannels() {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync(OVERDUE_CATEGORY, {
    name: "Overdue reminders",
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: undefined,
    vibrationPattern: [0, 250, 100, 250],
    lightColor: colors.primary,
  });
}

export async function scheduleOverdueReminder(
  reminder: OverdueReminder,
  triggerDate: Date,
) {
  return Notifications.scheduleNotificationAsync({
    identifier: `overdue-${reminder.customerId}`,
    content: {
      title: `Payment pending: ${reminder.customerName}`,
      body: `₹${Math.round(reminder.balance).toLocaleString("en-IN")} overdue for ${reminder.daysSince} days`,
      data: { type: "overdue", customerId: reminder.customerId },
      sound: false,
    },
    trigger: {
      date: triggerDate,
      channelId: OVERDUE_CATEGORY,
    } as Notifications.NotificationTriggerInput,
  });
}

export async function cancelOverdueReminder(customerId: string) {
  await Notifications.cancelScheduledNotificationAsync(`overdue-${customerId}`);
}

export async function cancelAllOverdueReminders() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const overdueIds = scheduled
    .filter((n: Notifications.NotificationRequest) =>
      n.identifier.startsWith("overdue-"),
    )
    .map((n: Notifications.NotificationRequest) => n.identifier);

  await Promise.all(
    overdueIds.map((id: string) =>
      Notifications.cancelScheduledNotificationAsync(id),
    ),
  );
}
