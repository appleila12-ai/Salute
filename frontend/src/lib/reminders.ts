import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

import { storage } from "@/src/utils/storage";

export type ReminderType = "isee" | "inps" | "verbale" | "custom";

export interface Reminder {
  id: string;
  type: ReminderType;
  date: string; // ISO
  note?: string;
  notificationId?: string; // scheduled notification identifier
  createdAt: string;
}

const REMINDERS_KEY = "salutenav:reminders";

async function readAll(): Promise<Reminder[]> {
  const raw = await storage.getItem<string>(REMINDERS_KEY, "");
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Reminder[]) : [];
  } catch {
    return [];
  }
}

async function writeAll(list: Reminder[]): Promise<void> {
  await storage.setItem(REMINDERS_KEY, JSON.stringify(list));
}

export async function getReminders(): Promise<Reminder[]> {
  const list = await readAll();
  return list.sort((a, b) => a.date.localeCompare(b.date));
}

// Configure how notifications are shown while the app is in the foreground.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function ensureNotificationPermission(): Promise<{
  granted: boolean;
  canAskAgain: boolean;
}> {
  if (Platform.OS === "web") {
    return { granted: false, canAskAgain: false };
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.status === "granted") {
    return { granted: true, canAskAgain: current.canAskAgain };
  }
  if (!current.canAskAgain) {
    return { granted: false, canAskAgain: false };
  }
  const req = await Notifications.requestPermissionsAsync();
  return {
    granted: req.status === "granted",
    canAskAgain: req.canAskAgain,
  };
}

async function scheduleNotification(
  title: string,
  body: string,
  dateISO: string,
): Promise<string | undefined> {
  if (Platform.OS === "web") return undefined;
  const at = new Date(dateISO);
  const now = Date.now();
  if (at.getTime() <= now) {
    // Past date — do not schedule.
    return undefined;
  }
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: at,
      },
    });
    return id;
  } catch (e) {
    console.warn("scheduleNotification failed", e);
    return undefined;
  }
}

export async function addReminder(
  input: {
    type: ReminderType;
    date: string;
    note?: string;
  },
  labels: { title: string; body: string },
): Promise<Reminder> {
  const notificationId = await scheduleNotification(
    labels.title,
    labels.body,
    input.date,
  );
  const reminder: Reminder = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: input.type,
    date: input.date,
    note: input.note,
    notificationId,
    createdAt: new Date().toISOString(),
  };
  const list = await readAll();
  list.unshift(reminder);
  await writeAll(list);
  return reminder;
}

export async function deleteReminder(id: string): Promise<void> {
  const list = await readAll();
  const target = list.find((r) => r.id === id);
  if (target?.notificationId && Platform.OS !== "web") {
    try {
      await Notifications.cancelScheduledNotificationAsync(target.notificationId);
    } catch (e) {
      console.warn("cancel notification failed", e);
    }
  }
  await writeAll(list.filter((r) => r.id !== id));
}
