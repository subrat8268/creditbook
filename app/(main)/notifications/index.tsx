import ActivityRow from "@/src/components/dashboard/ActivityRow";
import { useDashboard } from "@/src/hooks/useDashboard";
import { ensureNotificationPermission } from "@/src/lib/notifications";
import { useAuthStore } from "@/src/store/authStore";
import { usePreferencesStore } from "@/src/store/preferencesStore";
import { formatINR } from "@/src/utils/dashboardUi";
import { colors, spacing } from "@/src/utils/theme";
import { Stack, useRouter } from "expo-router";
import {
    AlertCircle,
    ArrowLeft,
    Bell,
    CheckCircle2,
    MessageCircle,
} from "lucide-react-native";
import {
    Linking,
    ScrollView,
    StatusBar,
    Text,
    Switch,
    TouchableOpacity,
    View,
} from "react-native";
import { useMemo } from "react";
import type { ReminderLogEntry } from "@/src/store/preferencesStore";
import { SafeAreaView } from "react-native-safe-area-context";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function sendWhatsAppReminder(
  name: string,
  phone: string,
  balance: number,
  onSuccess?: () => void,
) {
  const message = encodeURIComponent(
    `Hi ${name}, you have an outstanding balance of ${formatINR(balance)}. Please clear it at your earliest convenience. Thank you!`,
  );
  const cleaned = phone.replace(/\D/g, "");
  const number = cleaned.startsWith("91") ? cleaned : `91${cleaned}`;
  Linking.openURL(`https://wa.me/${number}?text=${message}`)
    .then(() => onSuccess?.())
    .catch(() => {});
}

const REMINDER_TIME_OPTIONS = [
  { label: "9:30 AM", hour: 9, minute: 30 },
  { label: "1:00 PM", hour: 13, minute: 0 },
  { label: "6:30 PM", hour: 18, minute: 30 },
];

const formatTimeLabel = (hour: number, minute: number) => {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const formatSnoozeDate = (timestamp: number) => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
};

const formatReminderAge = (timestamp: string) => {
  const time = new Date(timestamp).getTime();
  if (Number.isNaN(time)) return "";
  const diff = Date.now() - time;
  const days = Math.floor(diff / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
};

export default function NotificationsScreen() {
  const router = useRouter();
  const { profile } = useAuthStore();
  const { data } = useDashboard(profile?.id);
  const remindersEnabled = usePreferencesStore(
    (s) => s.overdueRemindersEnabled,
  );
  const reminderHour = usePreferencesStore((s) => s.overdueReminderHour);
  const reminderMinute = usePreferencesStore((s) => s.overdueReminderMinute);
  const setRemindersEnabled = usePreferencesStore(
    (s) => s.setOverdueRemindersEnabled,
  );
  const setReminderTime = usePreferencesStore((s) => s.setOverdueReminderTime);
  const reminderSnoozes = usePreferencesStore(
    (s) => s.overdueReminderSnoozes,
  );
  const snoozeReminder = usePreferencesStore((s) => s.snoozeOverdueReminder);
  const clearReminderSnooze = usePreferencesStore(
    (s) => s.clearOverdueReminderSnooze,
  );
  const reminderLog = usePreferencesStore((s) => s.reminderLog);
  const logReminderSent = usePreferencesStore((s) => s.logReminderSent);

  const overdueList = data?.overdueCustomersList ?? [];
  const recentActivity = data?.recentActivity ?? [];

  const lastReminderByCustomer = useMemo(() => {
    const map = new Map<string, { createdAt: string }>();
    for (const entry of reminderLog) {
      if (!map.has(entry.customerId)) {
        map.set(entry.customerId, { createdAt: entry.createdAt });
      }
    }
    return map;
  }, [reminderLog]);

  const recentReminders = reminderLog.slice(0, 5);

  const totalNotifications = overdueList.length + recentActivity.length;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView
        edges={["top"]}
        style={{ flex: 1, backgroundColor: colors.background }}
      >
        <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

        {/* ── Header ── */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: spacing.screenPadding,
            paddingVertical: spacing.md,
            backgroundColor: colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{ marginRight: 12 }}
          >
            <ArrowLeft size={22} color={colors.textPrimary} strokeWidth={2.2} />
          </TouchableOpacity>
          <Text
            style={{
              flex: 1,
              fontSize: 18,
              fontWeight: "700",
              color: colors.textPrimary,
            }}
          >
            Notifications
          </Text>
          {totalNotifications > 0 && (
            <View
              style={{
                backgroundColor: colors.overdue.bg,
                borderRadius: 999,
                paddingHorizontal: 10,
                paddingVertical: 3,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "700",
                  color: colors.overdue.text,
                }}
              >
                {totalNotifications}
              </Text>
            </View>
          )}
        </View>

        <ScrollView
          contentContainerStyle={{
            padding: spacing.lg,
            paddingBottom: 60,
            gap: spacing.lg,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Reminder Settings ── */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: spacing.lg,
              shadowColor: colors.textPrimary,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
              gap: 12,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "700",
                    color: colors.textPrimary,
                  }}
                >
                  Daily payment reminders
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.textSecondary,
                    marginTop: 4,
                  }}
                >
                  {remindersEnabled
                    ? `Scheduled at ${formatTimeLabel(reminderHour, reminderMinute)}`
                    : "Reminders are off"}
                </Text>
              </View>
              <Switch
                value={remindersEnabled}
                onValueChange={async (next) => {
                  if (next) {
                    const granted = await ensureNotificationPermission();
                    if (!granted) {
                      setRemindersEnabled(false);
                      return;
                    }
                  }
                  setRemindersEnabled(next);
                }}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={remindersEnabled ? colors.primary : colors.surface}
              />
            </View>

            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {REMINDER_TIME_OPTIONS.map((opt) => {
                const active =
                  reminderHour === opt.hour && reminderMinute === opt.minute;
                return (
                  <TouchableOpacity
                    key={opt.label}
                    disabled={!remindersEnabled}
                    onPress={() => setReminderTime(opt.hour, opt.minute)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: active ? colors.primary : colors.border,
                      backgroundColor: active
                        ? colors.primaryLight
                        : colors.background,
                      opacity: remindersEnabled ? 1 : 0.5,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "700",
                        color: active ? colors.primary : colors.textSecondary,
                      }}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={{ fontSize: 11, color: colors.textSecondary }}>
              Up to 10 highest-balance people are scheduled each day.
            </Text>
          </View>
          {/* ── Empty state ── */}
          {totalNotifications === 0 && (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 80,
                gap: 12,
              }}
            >
              <View
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  backgroundColor: colors.paid.bg,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Bell size={32} color={colors.primary} strokeWidth={1.5} />
              </View>
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: "700",
                  color: colors.textPrimary,
                }}
              >
                All caught up!
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                  textAlign: "center",
                }}
              >
                No pending follow-ups or alerts at the moment.
              </Text>
            </View>
          )}

          {/* ── Overdue Reminders ── */}
          {overdueList.length > 0 && (
            <View>
              {/* Section header */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <AlertCircle size={16} color={colors.danger} strokeWidth={2} />
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "700",
                    color: colors.textPrimary,
                    flex: 1,
                  }}
                >
                  Overdue Follow-ups
                </Text>
                <View
                  style={{
                    backgroundColor: colors.overdue.bg,
                    borderRadius: 999,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "700",
                      color: colors.overdue.text,
                    }}
                  >
                    {overdueList.length}
                  </Text>
                </View>
              </View>

              {/* People cards */}
              <View
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 16,
                  overflow: "hidden",
                  shadowColor: colors.textPrimary,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                {overdueList.map((customer, index) => (
                  <View
                    key={customer.id}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingHorizontal: spacing.lg,
                      paddingVertical: 14,
                      borderBottomWidth: index < overdueList.length - 1 ? 1 : 0,
                      borderBottomColor: colors.borderLight,
                    }}
                  >
                    {/* Avatar */}
                    <View
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 21,
                        backgroundColor: colors.overdue.bg,
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 12,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: "700",
                          color: colors.overdue.text,
                        }}
                      >
                        {getInitials(customer.name)}
                      </Text>
                    </View>

                    {/* Info */}
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "600",
                          color: colors.textPrimary,
                        }}
                        numberOfLines={1}
                      >
                        {customer.name}
                      </Text>
                        <Text
                          style={{
                            fontSize: 12,
                            color: colors.danger,
                            marginTop: 2,
                          }}
                        >
                          {customer.daysSince} days overdue
                        </Text>
                        {lastReminderByCustomer.has(customer.id) && (
                          <Text
                            style={{
                              fontSize: 11,
                              color: colors.textSecondary,
                              marginTop: 2,
                            }}
                          >
                            Reminded {formatReminderAge(
                              lastReminderByCustomer.get(customer.id)!
                                .createdAt,
                            )}
                          </Text>
                        )}
                    </View>

                    {/* Balance + remind button */}
                     <View style={{ alignItems: "flex-end", gap: 6 }}>
                       <Text
                         style={{
                           fontSize: 14,
                           fontWeight: "700",
                           color: colors.danger,
                         }}
                       >
                         {formatINR(customer.balance)}
                       </Text>
                       {reminderSnoozes[customer.id] &&
                       reminderSnoozes[customer.id] > Date.now() ? (
                         <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                           Snoozed till {formatSnoozeDate(reminderSnoozes[customer.id])}
                         </Text>
                       ) : null}
                        <TouchableOpacity
                          onPress={() =>
                            sendWhatsAppReminder(
                              customer.name,
                              customer.phone,
                              customer.balance,
                              () =>
                                logReminderSent({
                                  customerId: customer.id,
                                  customerName: customer.name,
                                  amount: customer.balance,
                                  channel: "whatsapp",
                                }),
                            )
                          }
                         activeOpacity={0.75}
                         style={{
                           flexDirection: "row",
                           alignItems: "center",
                           gap: 4,
                           backgroundColor: colors.paid.bg,
                           borderRadius: 999,
                           paddingHorizontal: 10,
                           paddingVertical: 4,
                         }}
                       >
                         <MessageCircle
                           size={12}
                           color={colors.primary}
                           strokeWidth={2}
                         />
                         <Text
                           style={{
                             fontSize: 11,
                             fontWeight: "700",
                             color: colors.primaryDark,
                           }}
                         >
                           Remind
                         </Text>
                       </TouchableOpacity>
                       <TouchableOpacity
                         onPress={() => {
                           const until = reminderSnoozes[customer.id] ?? 0;
                           if (until > Date.now()) {
                             clearReminderSnooze(customer.id);
                           } else {
                             snoozeReminder(customer.id, 7);
                           }
                         }}
                         activeOpacity={0.75}
                         style={{
                           flexDirection: "row",
                           alignItems: "center",
                           gap: 4,
                           backgroundColor: colors.background,
                           borderRadius: 999,
                           paddingHorizontal: 10,
                           paddingVertical: 4,
                           borderWidth: 1,
                           borderColor: colors.border,
                         }}
                       >
                         <Text
                           style={{
                             fontSize: 11,
                             fontWeight: "700",
                             color: colors.textSecondary,
                           }}
                         >
                           {(reminderSnoozes[customer.id] ?? 0) > Date.now()
                             ? "Undo snooze"
                             : "Snooze 7d"}
                         </Text>
                       </TouchableOpacity>
                     </View>
                   </View>
                 ))}
              </View>
            </View>
          )}

          {/* ── Recent Activity ── */}
          {recentActivity.length > 0 && (
            <View>
              {/* Section header */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <CheckCircle2
                  size={16}
                  color={colors.primary}
                  strokeWidth={2}
                />
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "700",
                    color: colors.textPrimary,
                  }}
                >
                  Recent Activity
                </Text>
              </View>

              <View
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 16,
                  overflow: "hidden",
                  shadowColor: colors.textPrimary,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                {recentActivity.map((item) => (
                  <ActivityRow key={item.id} item={item} />
                ))}
              </View>
            </View>
          )}

          {/* ── Reminder Activity (Local) ── */}
          {recentReminders.length > 0 && (
            <View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <MessageCircle
                  size={16}
                  color={colors.primary}
                  strokeWidth={2}
                />
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "700",
                    color: colors.textPrimary,
                  }}
                >
                  Reminder Activity
                </Text>
              </View>
              <View
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 16,
                  overflow: "hidden",
                  shadowColor: colors.textPrimary,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                {recentReminders.map((entry: ReminderLogEntry, idx: number) => (
                  <View
                    key={entry.id}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingHorizontal: spacing.lg,
                      paddingVertical: 12,
                      borderBottomWidth:
                        idx < recentReminders.length - 1 ? 1 : 0,
                      borderBottomColor: colors.borderLight,
                    }}
                  >
                    <View>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "600",
                          color: colors.textPrimary,
                        }}
                      >
                        {entry.customerName}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: colors.textSecondary,
                          marginTop: 2,
                        }}
                      >
                        {formatReminderAge(entry.createdAt)}
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "700",
                        color: colors.primary,
                      }}
                    >
                      {formatINR(entry.amount)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
