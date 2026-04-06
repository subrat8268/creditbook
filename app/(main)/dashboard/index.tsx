import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Alert,
  Linking,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Plus,
  NotebookPen,
  IndianRupee,
  BellRing,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react-native";
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetFlatList,
} from "@gorhom/bottom-sheet";
import { colors, gradients } from "@/src/utils/theme";
import { useDashboard } from "@/src/hooks/useDashboard";
import { useAuthStore } from "@/src/store/authStore";
import { useRouter } from "expo-router";
import Loader from "@/src/components/feedback/Loader";
import DashboardHeader from "@/src/components/dashboard/DashboardHeader";
import RecordCustomerPaymentModal from "@/src/components/customers/RecordCustomerPaymentModal";
import { fetchCustomerDetail } from "@/src/api/customers";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
});

const formatCurrency = (value: number) => {
  const isNegative = value < 0;
  const absolute = Math.abs(value);
  return `${isNegative ? "-" : ""}₹${currencyFormatter.format(absolute)}`;
};

const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("") || "KB";

const getAvatarBg = (name: string) => {
  const palette = colors.avatarPalette;
  if (!palette.length) return colors.primary;
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return palette[Math.abs(hash) % palette.length];
};

const formatActivityDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
};

const statusStyles = {
  Paid: { bg: colors.paid.bg, text: colors.paid.text, label: "PAID" },
  Pending: { bg: colors.pending.bg, text: colors.pending.text, label: "PENDING" },
  Overdue: { bg: colors.overdue.bg, text: colors.overdue.text, label: "OVERDUE" },
  "Partially Paid": {
    bg: colors.partial.bg,
    text: colors.partial.text,
    label: "PARTIAL",
  },
} as const;

const getStatusStyle = (status: string) =>
  statusStyles[status as keyof typeof statusStyles] ?? {
    bg: colors.warningBg,
    text: colors.warning,
    label: status?.toUpperCase?.() ?? "STATUS",
  };

type OverdueCustomer = {
  id: string;
  name: string;
  phone?: string;
  balance: number;
  daysSince: number;
};

type QuickActionMode = "collect" | "remind";

type PaymentContext = {
  orderId: string;
  balanceDue: number;
  customerId: string;
  customerName: string;
};

const normalizePhoneForWhatsApp = (phone?: string) => {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length >= 11 && digits.startsWith("91")) return digits;
  if (digits.length === 10) return `91${digits}`;
  return digits.length >= 10 ? digits : null;
};

const buildReminderMessage = (name: string, amount: number) =>
  `Hi ${name}, you have an outstanding balance of ${formatCurrency(amount)}. Please clear it at your earliest convenience. Thank you!`;

const sendWhatsAppReminder = (customer: OverdueCustomer) => {
  const number = normalizePhoneForWhatsApp(customer.phone);
  if (!number) {
    Alert.alert(
      "Missing number",
      `${customer.name} does not have a valid phone number saved.`,
    );
    return;
  }
  const message = encodeURIComponent(
    buildReminderMessage(customer.name, customer.balance ?? 0),
  );
  Linking.openURL(`https://wa.me/${number}?text=${message}`).catch(() => {
    Alert.alert("Unable to open WhatsApp", "Please try again later.");
  });
};

export default function DashboardScreen() {
  const router = useRouter();
  const { profile } = useAuthStore();
  const {
    netPosition,
    toReceive,
    toGive,
    weekDeltaPct,
    overdueCustomers,
    overdueCustomersAll,
    overdueTotalCount,
    recentActivity,
    isLoading,
    refreshDashboard,
  } = useDashboard(profile?.id);

  const [quickActionMode, setQuickActionMode] = useState<QuickActionMode | null>(null);
  const actionSheetRef = useRef<BottomSheetModal>(null);
  const paymentModalRef = useRef<BottomSheetModal>(null);
  const [paymentContext, setPaymentContext] = useState<PaymentContext | null>(null);
  const [isFetchingCustomer, setIsFetchingCustomer] = useState(false);

  const quickActionSnapPoints = useMemo(() => ["45%", "65%"], []);
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    [],
  );

  useEffect(() => {
    if (paymentContext) {
      paymentModalRef.current?.present();
    }
  }, [paymentContext]);

  const openQuickActionSheet = (mode: QuickActionMode) => {
    if (!overdueCustomersAll.length) {
      Alert.alert(
        mode === "collect" ? "Nothing to collect" : "No reminders due",
        mode === "collect"
          ? "All payments are up to date right now."
          : "Great! No customers are overdue at the moment.",
      );
      return;
    }
    setQuickActionMode(mode);
    actionSheetRef.current?.present();
  };

  const handleCollectFlow = async (customer: OverdueCustomer) => {
    setIsFetchingCustomer(true);
    try {
      const detail = await fetchCustomerDetail(customer.id);
      if (!detail?.pendingOrderId || (detail.pendingOrderBalance ?? 0) <= 0) {
        Alert.alert(
          "Up to date",
          `${detail?.name ?? customer.name} has no pending invoices to collect.`,
        );
        return;
      }
      setPaymentContext({
        orderId: detail.pendingOrderId,
        balanceDue: detail.pendingOrderBalance ?? customer.balance,
        customerId: detail.id,
        customerName: detail.name,
      });
      actionSheetRef.current?.dismiss();
    } catch (error: any) {
      Alert.alert(
        "Unable to open payment sheet",
        error?.message || "Something went wrong while loading the customer.",
      );
    } finally {
      setIsFetchingCustomer(false);
    }
  };

  const handleSelectActionCustomer = (customer: OverdueCustomer) => {
    if (!quickActionMode) return;
    if (quickActionMode === "remind") {
      sendWhatsAppReminder(customer);
      actionSheetRef.current?.dismiss();
      return;
    }
    handleCollectFlow(customer);
  };

  const handleReminder = (customer: OverdueCustomer) => {
    sendWhatsAppReminder(customer);
  };

  if (isLoading || !profile) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <Loader message="Loading dashboard..." />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={false} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <DashboardHeader
          overdueCount={overdueTotalCount}
          onPressNotifications={() => router.push("/(main)/notifications" as never)}
          onPressSettings={() => router.push("/(main)/profile" as never)}
        />

        <View className="px-5">
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push("/(main)/net-position" as never)}
            className="p-6 rounded-[28px] mb-6"
            style={{ backgroundColor: gradients.netPosition }}
          >
            <View className="flex-row items-start justify-between">
              <View>
                <Text className="text-[12px] font-semibold text-surface/70 tracking-[2px] uppercase">
                  Net Position
                </Text>
                <Text className="text-[40px] font-black text-surface mt-1">
                  {formatCurrency(netPosition)}
                </Text>
              </View>
              <View
                className="flex-row items-center px-3 py-1.5 rounded-full"
                style={{
                  backgroundColor:
                    weekDeltaPct > 0
                      ? "rgba(34,197,94,0.18)"
                      : weekDeltaPct < 0
                        ? "rgba(239,68,68,0.22)"
                        : "rgba(255,255,255,0.15)",
                }}
              >
                {weekDeltaPct === 0 ? (
                  <Minus size={16} color={colors.surface} strokeWidth={2.5} />
                ) : weekDeltaPct > 0 ? (
                  <TrendingUp size={16} color={colors.surface} strokeWidth={2.5} />
                ) : (
                  <TrendingDown size={16} color={colors.surface} strokeWidth={2.5} />
                )}
                <Text className="text-[12px] font-semibold text-surface ml-1.5">
                  {weekDeltaPct === 0
                    ? "No change vs last week"
                    : `${Math.abs(weekDeltaPct)}% ${weekDeltaPct > 0 ? "up" : "down"} from last week`}
                </Text>
              </View>
            </View>

            <View className="flex-row mt-6">
              {[
                {
                  label: "To Receive",
                  value: toReceive,
                  bg: colors.successBg,
                  text: colors.primary,
                  subtitle: "Customers owe you",
                },
                {
                  label: "To Give",
                  value: toGive,
                  bg: colors.dangerBg,
                  text: colors.danger,
                  subtitle: "You owe suppliers",
                },
              ].map((stat, index) => (
                <View
                  key={stat.label}
                  className="flex-1 p-4 rounded-2xl"
                  style={{
                    backgroundColor: stat.bg,
                    marginRight: index === 0 ? 12 : 0,
                  }}
                >
                  <Text className="text-[12px] font-semibold text-textSecondary uppercase tracking-tight">
                    {stat.label}
                  </Text>
                  <Text className="text-[22px] font-extrabold mt-1" style={{ color: stat.text }}>
                    {formatCurrency(stat.value)}
                  </Text>
                  <Text className="text-[12px] text-textSecondary mt-1">
                    {stat.subtitle}
                  </Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>

          <View className="flex-row mt-6 mb-8">
            {[
              {
                label: "New Bill",
                icon: NotebookPen,
                iconBg: colors.primaryBlueBg,
                iconColor: colors.primaryBlue,
                onPress: () => router.push("/(main)/orders/create" as never),
              },
              {
                label: "Collect",
                icon: IndianRupee,
                iconBg: colors.successBg,
                iconColor: colors.primary,
                onPress: () => openQuickActionSheet("collect"),
              },
              {
                label: "Remind",
                icon: BellRing,
                iconBg: colors.warningBg,
                iconColor: colors.warning,
                onPress: () => openQuickActionSheet("remind"),
              },
            ].map((action, index, arr) => (
              <TouchableOpacity
                key={action.label}
                activeOpacity={0.85}
                onPress={action.onPress}
                className="flex-1 bg-surface rounded-2xl p-4"
                style={{
                  marginRight: index !== arr.length - 1 ? 12 : 0,
                  shadowColor: "#0F172A10",
                  shadowOpacity: 0.2,
                  shadowOffset: { width: 0, height: 4 },
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <View
                  className="w-11 h-11 rounded-2xl items-center justify-center mb-3"
                  style={{ backgroundColor: action.iconBg }}
                >
                  <action.icon size={20} color={action.iconColor} strokeWidth={2.4} />
                </View>
                <Text className="text-[15px] font-semibold text-textPrimary">{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {overdueCustomers && overdueCustomers.length > 0 ? (
              <View className="mb-8">
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-[18px] font-extrabold text-textPrimary">
                    Pending Follow-ups
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      router.push({ pathname: "/(main)/customers", params: { filter: "overdue" } } as never)
                    }
                  >
                    <Text className="text-[14px] font-semibold text-primary">See All</Text>
                  </TouchableOpacity>
                </View>

                {overdueCustomers.map((customer: OverdueCustomer) => {
                  const initials = getInitials(customer.name);
                  const avatarBg = getAvatarBg(customer.name);
                  return (
                    <View
                      key={customer.id}
                      className="flex-row items-center p-4 mb-3 bg-surface rounded-2xl border border-border"
                    >
                      <View
                        className="w-12 h-12 rounded-full items-center justify-center mr-3"
                        style={{ backgroundColor: avatarBg }}
                      >
                        <Text className="text-[13px] font-bold text-surface">{initials}</Text>
                      </View>
                      <View className="flex-1 mr-2">
                        <Text className="text-[16px] font-bold text-textPrimary" numberOfLines={1}>
                          {customer.name}
                        </Text>
                        <Text className="text-[13px] font-semibold text-danger mt-0.5">
                          {formatCurrency(customer.balance)} • {customer.daysSince} days overdue
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleReminder(customer)}
                        className="px-3.5 py-2 rounded-full"
                        style={{ backgroundColor: colors.primary }}
                      >
                        <Text className="text-[13px] font-bold text-surface">Remind</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            ) : (
              <View className="mb-8 p-5 bg-surface rounded-2xl border border-border">
                <Text className="text-[15px] font-semibold text-textPrimary">No pending follow-ups 🎉</Text>
                <Text className="text-[13px] text-textSecondary mt-1">
                  Great! Customers are paying on time.
                </Text>
              </View>
            )}

            <View className="mb-6">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-[18px] font-extrabold text-textPrimary">
                  Recent Activity
                </Text>
                <TouchableOpacity onPress={() => router.push("/(main)/orders" as never)}>
                  <Text className="text-[14px] font-semibold text-primary">See All</Text>
                </TouchableOpacity>
              </View>

              {recentActivity.length === 0 ? (
                <View className="p-6 items-center justify-center bg-surface rounded-2xl border border-border">
                  <Text className="text-[14px] text-textSecondary font-semibold">
                    No recent activity yet.
                  </Text>
                </View>
              ) : (
                <View className="bg-surface rounded-[24px] border border-border overflow-hidden">
                  {recentActivity.map((activity, index) => {
                    const isLast = index === recentActivity.length - 1;
                    const initials = getInitials(activity.name);
                    const avatarBg = getAvatarBg(activity.name);
                    const status = getStatusStyle(activity.status);
                    const amountColor = status.text;

                    return (
                      <View
                        key={activity.id}
                        className={`flex-row items-center p-4 ${
                          !isLast ? "border-b border-border" : ""
                        }`}
                      >
                        <View
                          className="w-12 h-12 rounded-full items-center justify-center mr-3"
                          style={{ backgroundColor: avatarBg }}
                        >
                          <Text className="text-[13px] font-bold text-surface">{initials}</Text>
                        </View>

                        <View className="flex-1 mr-3">
                          <Text className="text-[16px] font-bold text-textPrimary" numberOfLines={1}>
                            {activity.name}
                          </Text>
                          <Text className="text-[13px] text-textSecondary" numberOfLines={1}>
                            {activity.title}
                          </Text>
                          <Text className="text-[12px] text-textSecondary mt-0.5">
                            {formatActivityDate(activity.date)}
                          </Text>
                        </View>

                        <View className="items-end">
                          <Text className="text-[16px] font-extrabold" style={{ color: amountColor }}>
                            {formatCurrency(activity.amount)}
                          </Text>
                          <View
                            className="px-2.5 py-1 rounded-full mt-1"
                            style={{ backgroundColor: status.bg }}
                          >
                            <Text className="text-[11px] font-bold" style={{ color: status.text }}>
                              {status.label}
                            </Text>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        <BottomSheetModal
          ref={actionSheetRef}
          index={0}
          snapPoints={quickActionSnapPoints}
          enablePanDownToClose
          backdropComponent={renderBackdrop}
          backgroundStyle={{ backgroundColor: colors.surface, borderRadius: 32 }}
          handleIndicatorStyle={{ backgroundColor: colors.border, width: 40, height: 4, borderRadius: 2 }}
          onDismiss={() => {
            setQuickActionMode(null);
            setIsFetchingCustomer(false);
          }}
        >
          <View style={{ paddingHorizontal: 20, paddingTop: 12, flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: "700", color: colors.textPrimary }}>
              {quickActionMode === "collect"
                ? "Collect payment"
                : quickActionMode === "remind"
                  ? "Send reminder"
                  : "Quick action"}
            </Text>
            <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4, marginBottom: 16 }}>
              {quickActionMode === "collect"
                ? "Select a customer with outstanding balance to record a payment."
                : "Pick a customer to nudge on WhatsApp."}
            </Text>

            <BottomSheetFlatList
              data={overdueCustomersAll}
              keyExtractor={(item: OverdueCustomer) => item.id}
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: 20 }}
              renderItem={({ item }: { item: OverdueCustomer }) => (
                <TouchableOpacity
                  onPress={() => handleSelectActionCustomer(item)}
                  activeOpacity={0.85}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 14,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  }}
                >
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: getAvatarBg(item.name),
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: "700", color: colors.surface }}>
                      {getInitials(item.name)}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: "600", color: colors.textPrimary }}>
                      {item.name}
                    </Text>
                    <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                      {formatCurrency(item.balance)} • {item.daysSince} days overdue
                    </Text>
                  </View>
                  <Text style={{ fontSize: 12, fontWeight: "700", color: colors.primary }}>
                    {quickActionMode === "collect" ? "Collect" : "Remind"}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={() => (
                <View style={{ alignItems: "center", paddingVertical: 40 }}>
                  <Text style={{ color: colors.textSecondary }}>No overdue customers 🎉</Text>
                </View>
              )}
            />

            {isFetchingCustomer && (
              <View style={{ paddingVertical: 12 }}>
                <ActivityIndicator color={colors.primary} />
              </View>
            )}
          </View>
        </BottomSheetModal>

        {paymentContext && (
          <RecordCustomerPaymentModal
            ref={paymentModalRef}
            orderId={paymentContext.orderId}
            balanceDue={paymentContext.balanceDue}
            customerId={paymentContext.customerId}
            customerName={paymentContext.customerName}
            onSuccess={() => {
              refreshDashboard();
              setPaymentContext(null);
            }}
            onDismiss={() => setPaymentContext(null)}
          />
        )}

        {/* FLOATING ACTION BUTTON */}
        <TouchableOpacity
          onPress={() => router.push("/(main)/orders/create" as any)}
          activeOpacity={0.8}
          className="absolute bottom-6 right-5 w-14 h-14 rounded-full bg-primary items-center justify-center shadow-lg elevation-xl"
          style={{
            shadowColor: colors.fab, // Explicitly mapped to tokens
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 10,
            elevation: 10,
          }}
        >
          <Plus size={30} color={colors.surface} strokeWidth={2.5} />
        </TouchableOpacity>
      </SafeAreaView>
  );
}
