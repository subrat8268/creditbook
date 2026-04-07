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
  Animated,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Plus,
  NotebookPen,
  IndianRupee,
  BellRing,
  TrendingUp,
  TrendingDown,
  Minus,
  Wallet,
  Truck,
} from "lucide-react-native";
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetFlatList,
} from "@gorhom/bottom-sheet";
import { colors, gradients } from "@/src/utils/theme";
import { useDashboard, useNetPositionReport } from "@/src/hooks/useDashboard";
import { useAuthStore } from "@/src/store/authStore";
import { useRouter } from "expo-router";
import Loader from "@/src/components/feedback/Loader";
import DashboardHeader from "@/src/components/dashboard/DashboardHeader";
import DashboardHeroCard from "@/src/components/dashboard/DashboardHeroCard";
import DashboardStatCards from "@/src/components/dashboard/DashboardStatCards";
import DashboardSupplierFollowups from "@/src/components/dashboard/DashboardSupplierFollowups";
import {
  NET_POSITION_RANGE_OPTIONS,
  usePreferencesStore,
} from "@/src/store/preferencesStore";
import { Supplier, SupplierDetail } from "@/src/types/supplier";
import { useSuppliers, supplierKeys } from "@/src/hooks/useSuppliers";
import RecordCustomerPaymentModal from "@/src/components/customers/RecordCustomerPaymentModal";
import RecordPaymentMadeModal from "@/src/components/suppliers/RecordPaymentMadeModal";
import { fetchCustomerDetail } from "@/src/api/customers";
import { fetchSupplierDetail, recordPaymentMade } from "@/src/api/suppliers";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/src/components/feedback/Toast";
import {
  cancelAllOverdueReminders,
  scheduleOverdueReminder,
} from "@/src/lib/notifications";

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

const NOTIFICATION_HOUR = 9;
const NOTIFICATION_MINUTE = 30;

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

const usePulseShimmer = () => {
  const animated = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(animated, {
          toValue: 0.85,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(animated, {
          toValue: 0.3,
          duration: 650,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [animated]);
  return animated;
};

const HeroShimmerOverlay = ({ visible }: { visible: boolean }) => {
  const opacity = usePulseShimmer();
  if (!visible) return null;
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 28,
        overflow: "hidden",
        backgroundColor: "rgba(15,23,42,0.4)",
      }}
    >
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity,
          backgroundColor: "rgba(255,255,255,0.12)",
        }}
      />
      <View style={{ padding: 24, gap: 12 }}>
        <View style={{ height: 12, borderRadius: 6, backgroundColor: "rgba(255,255,255,0.25)" }} />
        <View style={{ height: 34, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.2)", width: "70%" }} />
        <View style={{ height: 14, borderRadius: 7, backgroundColor: "rgba(255,255,255,0.18)", width: 120 }} />
        <View style={{ flexDirection: "row", gap: 12, marginTop: 14 }}>
          {[0, 1].map((item) => (
            <View
              key={`shimmer-card-${item}`}
              style={{
                flex: 1,
                height: 72,
                borderRadius: 18,
                backgroundColor: "rgba(255,255,255,0.15)",
              }}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

type OverdueCustomer = {
  id: string;
  name: string;
  phone?: string;
  balance: number;
  daysSince: number;
};

type OverdueSupplier = {
  id: string;
  name: string;
  phone?: string;
  amount: number;
  daysSince: number;
};

type QuickActionMode = "collect" | "remind";

type PaymentContext = {
  orderId: string;
  balanceDue: number;
  customerId: string;
  customerName: string;
};

type DashboardMode = "seller" | "distributor" | "both";

const normalizePhoneForWhatsApp = (phone?: string) => {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length >= 11 && digits.startsWith("91")) return digits;
  if (digits.length === 10) return `91${digits}`;
  return digits.length >= 10 ? digits : null;
};

const buildReminderMessage = (name: string, amount: number) =>
  `Hi ${name}, you have an outstanding balance of ${formatCurrency(amount)}. Please clear it at your earliest convenience. Thank you!`;

const sendWhatsAppReminder = (customer: OverdueCustomer, toast?: (opts: { message: string; type?: "success" | "error" }) => void) => {
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
  }).finally(() => {
    toast?.({ message: `Reminder sent to ${customer.name}`, type: "success" });
  });
};

const formatCountLabel = (count: number, noun: string) =>
  `${count} ${noun}${count === 1 ? "" : "s"}`;

export default function DashboardScreen() {
  const router = useRouter();
  const { profile } = useAuthStore();
  const queryClient = useQueryClient();
  const { show: showToast } = useToast();
  const {
    netPosition,
    toReceive,
    toGive,
    weekDelta,
    weekDeltaPct,
    activeBuyers,
    activeSuppliers,
    overdueCustomers,
    overdueSuppliers,
    overdueCustomersAll,
    overdueTotalCount,
    recentActivity,
    isLoading,
    refreshDashboard,
  } = useDashboard(profile?.id);
  const netPositionRange = usePreferencesStore((s) => s.netPositionRange);
  const setNetPositionRange = usePreferencesStore((s) => s.setNetPositionRange);
  const { data: netReport, isFetching: isNetReportFetching } = useNetPositionReport(
    profile?.id,
    netPositionRange,
  );
  const netRangeLabel = useMemo(() => {
    return (
      NET_POSITION_RANGE_OPTIONS.find((opt) => opt.value === netPositionRange)
        ?.label || "Last 30 days"
    );
  }, [netPositionRange]);
  const dashboardMode = (profile?.dashboard_mode ?? "both") as DashboardMode;
  const isSeller = dashboardMode === "seller";
  const isDistributor = dashboardMode === "distributor";

  const heroNet = netReport?.netBalance ?? netPosition;
  const heroToReceive = netReport?.totalReceivables ?? toReceive;
  const heroToGive = netReport?.totalPayables ?? toGive;

  const [quickActionMode, setQuickActionMode] = useState<QuickActionMode | null>(null);
  const actionSheetRef = useRef<BottomSheetModal>(null);
  const supplierPickerRef = useRef<BottomSheetModal>(null);
  const paymentModalRef = useRef<BottomSheetModal>(null);
  const [paymentContext, setPaymentContext] = useState<PaymentContext | null>(null);
  const [isFetchingCustomer, setIsFetchingCustomer] = useState(false);
  const [supplierPaymentContext, setSupplierPaymentContext] = useState<
    { id: string; name: string; balance: number } | null
  >(null);
  const [isPayingSupplier, setIsPayingSupplier] = useState(false);
  const [supplierSearch, setSupplierSearch] = useState("");
  const [preferredRatio, setPreferredRatio] = useState<Record<string, number>>({});
  const { suppliers: supplierList, isFetching: isSuppliersFetching } = useSuppliers(
    profile?.id,
    supplierSearch,
  );
  const supplierSummaryRef = useRef<BottomSheetModal>(null);
  const [supplierSummary, setSupplierSummary] = useState<
    { supplier: Supplier; detail?: SupplierDetail | null; loading: boolean } | null
  >(null);
  const SUPPLIER_RATIO_KEY = "preferredSupplierRatios";

  useEffect(() => {
    const syncOverdueReminders = async () => {
      if (!overdueCustomersAll.length) {
        await cancelAllOverdueReminders();
        return;
      }

      const now = new Date();
      const trigger = new Date();
      trigger.setHours(NOTIFICATION_HOUR, NOTIFICATION_MINUTE, 0, 0);
      if (trigger <= now) {
        trigger.setDate(trigger.getDate() + 1);
      }

      await cancelAllOverdueReminders();
      await Promise.all(
        overdueCustomersAll.map((customer) =>
          scheduleOverdueReminder(
            {
              customerId: customer.id,
              customerName: customer.name,
              balance: customer.balance,
              daysSince: customer.daysSince,
            },
            trigger,
          ),
        ),
      );
    };

    syncOverdueReminders();
  }, [overdueCustomersAll]);

  useEffect(() => {
    AsyncStorage.getItem(SUPPLIER_RATIO_KEY)
      .then((stored) => {
        if (stored) {
          setPreferredRatio(JSON.parse(stored));
        }
      })
      .catch(() => {});
  }, []);

  const updatePreferredRatio = useCallback(
    (supplierId: string, ratio: number) => {
      setPreferredRatio((prev) => {
        const next = { ...prev, [supplierId]: ratio };
        AsyncStorage.setItem(SUPPLIER_RATIO_KEY, JSON.stringify(next)).catch(() => {});
        return next;
      });
    },
    [],
  );
  const outstandingBalance = supplierSummary
    ? supplierSummary.detail?.totalOwed ?? supplierSummary.supplier.balanceOwed ?? 0
    : 0;
  const lastDelivery = supplierSummary?.detail?.deliveries?.[0];
  const lastPayment = supplierSummary?.detail?.timeline?.find((t) => t.type === "payment");
  const selectedSupplierRatio = supplierSummary
    ? preferredRatio[supplierSummary.supplier.id] ?? 1
    : 1;
  const quickPayRatios: number[] = [0.25, 0.5, 1];

  const quickActionSnapPoints = useMemo(() => ["45%", "65%"], []);
  const sheetTitle =
    quickActionMode === "collect" ? "Collect payment" : "Send reminder";
  const sheetSubtitle =
    quickActionMode === "collect"
      ? "Select a customer with outstanding balance to record a payment."
      : "Pick a customer to nudge on WhatsApp.";
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

  const handleSelectActionItem = (item: OverdueCustomer | OverdueSupplier) => {
    if (!quickActionMode) return;
    if (quickActionMode === "remind") {
      sendWhatsAppReminder(item as OverdueCustomer, showToast);
      actionSheetRef.current?.dismiss();
      return;
    }
    if (quickActionMode === "collect") {
      handleCollectFlow(item as OverdueCustomer);
      return;
    }
    // pay supplier
    setSupplierPaymentContext({
      id: (item as OverdueSupplier).id,
      name: item.name,
      balance: (item as OverdueSupplier).amount,
    });
    actionSheetRef.current?.dismiss();
  };

  const handleSubmitSupplierPayment = async ({
    amount,
    payment_mode,
    notes,
  }: {
    amount: number;
    payment_mode: string;
    notes?: string;
  }) => {
    if (!supplierPaymentContext || !profile?.id) return;
    try {
      setIsPayingSupplier(true);
      await recordPaymentMade(
        profile.id,
        supplierPaymentContext.id,
        amount,
        payment_mode,
        notes,
      );
      refreshDashboard();
      setSupplierPaymentContext(null);
      showToast({ message: "Supplier payment recorded", type: "success" });
    } catch (error: any) {
      Alert.alert(
        "Payment failed",
        error?.message || "Unable to record supplier payment.",
      );
    } finally {
      setIsPayingSupplier(false);
    }
  };

  const handleReminder = (customer: OverdueCustomer) => {
    sendWhatsAppReminder(customer);
  };

  const handleCustomerPaymentSuccess = () => {
    if (paymentContext?.customerName) {
      showToast({
        message: `Payment recorded for ${paymentContext.customerName}`,
        type: "success",
      });
    } else {
      showToast({ message: "Payment recorded", type: "success" });
    }
    refreshDashboard();
    setPaymentContext(null);
  };

const renderHeroSection = () => {
    const buyersInfo = formatCountLabel(activeBuyers, "active buyer");
    const suppliersInfo = formatCountLabel(activeSuppliers, "active supplier");
    const overdueSupplierCount = overdueSuppliers.length;

    if (isSeller) {
      return (
        <>
          <DashboardHeroCard
            variant="seller"
            label="CUSTOMERS OWE YOU"
            amount={heroToReceive}
            subInfo={buyersInfo}
            weekDelta={weekDelta}
            onPrimaryAction={() => router.push("/(main)/reports" as never)}
            onSecondaryAction={() => openQuickActionSheet("remind")}
          />
          <DashboardStatCards
            mode="seller"
            primaryCount={activeBuyers}
            overdueCount={overdueTotalCount}
          />
        </>
      );
    }

    if (isDistributor) {
      return (
        <>
          <DashboardHeroCard
            variant="distributor"
            label="SUPPLIER PAYABLES"
            amount={heroToGive}
            subInfo={suppliersInfo}
            weekDelta={weekDelta}
            onPrimaryAction={() => router.push("/(main)/suppliers" as never)}
            onSecondaryAction={() => router.push("/(main)/suppliers" as never)}
          />
          <DashboardStatCards
            mode="distributor"
            primaryCount={activeSuppliers}
            overdueCount={overdueSupplierCount}
          />
        </>
      );
    }

    return (
      <>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push("/(main)/net-position" as never)}
          className="p-6 rounded-[28px] mb-6"
          style={{ backgroundColor: gradients.netPosition, position: "relative", overflow: "hidden" }}
        >
          <HeroShimmerOverlay visible={isNetReportFetching} />
          <View style={{ position: "absolute", top: 20, right: 20 }}>
            <View
              className="w-12 h-12 rounded-2xl items-center justify-center"
              style={{
                backgroundColor: "rgba(255,255,255,0.18)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.3)",
              }}
            >
              <Wallet size={22} color={colors.surface} strokeWidth={2.2} />
            </View>
          </View>
          <View className="flex-row items-start justify-between">
            <View>
              <Text className="text-[12px] font-semibold text-surface/70 tracking-[2px] uppercase">
                Net Position
              </Text>
              <Text className="text-[40px] font-black text-surface mt-1">
                {formatCurrency(heroNet)}
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

          <View className="flex-row gap-2 mt-3 items-center flex-wrap">
            {NET_POSITION_RANGE_OPTIONS.map((option) => {
              const isActive = option.value === netPositionRange;
              return (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => setNetPositionRange(option.value)}
                  activeOpacity={0.85}
                  className="px-3 py-1.5 rounded-full"
                  style={{
                    backgroundColor: isActive
                      ? "rgba(255,255,255,0.18)"
                      : "rgba(255,255,255,0.08)",
                    borderWidth: 1,
                    borderColor: isActive
                      ? colors.surface
                      : "rgba(255,255,255,0.2)",
                  }}
                >
                  <Text
                    className="text-[12px] font-semibold"
                    style={{ color: colors.surface, opacity: isActive ? 1 : 0.7 }}
                  >
                    {option.label.replace("Last ", "")}
                  </Text>
                </TouchableOpacity>
              );
            })}
            {isNetReportFetching && (
              <ActivityIndicator size="small" color={colors.surface} />
            )}
          </View>

          <Text className="text-[12px] text-surface/70 mt-3">
            {netRangeLabel}
          </Text>

          <Text className="text-[12px] text-surface/70 mt-1">
            Includes receivables and supplier payables for {netRangeLabel.toLowerCase()}.
          </Text>

          <View className="flex-row mt-6">
            {[
              {
                label: "To Receive",
                value: heroToReceive,
                bg: colors.successBg,
                text: colors.primary,
                subtitle: "Customers owe you",
              },
              {
                label: "To Give",
                value: heroToGive,
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
        <DashboardStatCards
          mode="both"
          primaryCount={activeBuyers}
          overdueCount={overdueTotalCount}
          activeSuppliers={activeSuppliers}
          overdueSuppliers={overdueSupplierCount}
        />
      </>
    );
  };
  const openSupplierPicker = () => {
    if (!overdueSuppliers.length && !supplierList.length) {
      Alert.alert("All settled", "No supplier payments pending right now.");
      return;
    }
    supplierPickerRef.current?.present();
  };

  const handleSupplierSelected = async (supplier: Supplier) => {
    supplierPickerRef.current?.dismiss();
    const cachedDetail = queryClient.getQueryData<SupplierDetail | null>(
      supplierKeys.detail(supplier.id),
    );
    if (cachedDetail) {
      setSupplierSummary({ supplier, detail: cachedDetail, loading: false });
      supplierSummaryRef.current?.present();
      return;
    }
    setSupplierSummary({ supplier, detail: null, loading: true });
    supplierSummaryRef.current?.present();
    try {
      const detail = await fetchSupplierDetail(supplier.id);
      if (detail) {
        queryClient.setQueryData(supplierKeys.detail(supplier.id), detail);
      }
      setSupplierSummary({ supplier, detail, loading: false });
    } catch (error: any) {
      Alert.alert("Unable to load supplier", error?.message || "Please try again.");
      setSupplierSummary({ supplier, detail: null, loading: false });
    }
  };

  const quickActions = dashboardMode === "distributor"
    ? [
        {
          label: "Record Delivery",
          icon: Truck,
          iconBg: colors.primaryBlueBg,
          iconColor: colors.primaryBlue,
          onPress: () => router.push("/(main)/suppliers" as never),
        },
        {
          label: "Pay Supplier",
          icon: IndianRupee,
          iconBg: colors.successBg,
          iconColor: colors.primary,
          onPress: openSupplierPicker,
        },
        {
          label: "Reminder",
          icon: BellRing,
          iconBg: colors.warningBg,
          iconColor: colors.warning,
          onPress: () => openQuickActionSheet("remind"),
        },
      ]
    : [
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
      ];

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
          {renderHeroSection()}

          <View className="flex-row mt-6 mb-8">
            {quickActions.map((action, index, arr) => (
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

          {isDistributor ? (
            <DashboardSupplierFollowups
              suppliers={overdueSuppliers}
              onSeeAll={() =>
                router.push({ pathname: "/(main)/suppliers", params: { filter: "overdue" } } as never)
              }
              onRemind={(supplier) =>
                sendWhatsAppReminder({
                  id: supplier.id,
                  name: supplier.name,
                  phone: supplier.phone,
                  balance: supplier.amount,
                  daysSince: supplier.daysSince,
                })
              }
            />
          ) : (
            (overdueCustomers.length > 0 ? (
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
                        onPress={() => {
                          handleReminder(customer);
                          showToast({ message: `Reminder sent to ${customer.name}`, type: "success" });
                        }}
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
            ))
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
              {sheetTitle}
            </Text>
            {sheetSubtitle ? (
              <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4, marginBottom: 16 }}>
                {sheetSubtitle}
              </Text>
            ) : null}

            <BottomSheetFlatList
              data={overdueCustomersAll}
              keyExtractor={(item: OverdueCustomer) => item.id}
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: 20 }}
              renderItem={({ item }: { item: OverdueCustomer }) => (
                <TouchableOpacity
                  onPress={() => handleSelectActionItem(item)}
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

        <BottomSheetModal
          ref={supplierPickerRef}
          index={0}
          snapPoints={["65%"]}
          enablePanDownToClose
          backdropComponent={renderBackdrop}
          backgroundStyle={{ backgroundColor: colors.surface, borderRadius: 32 }}
          handleIndicatorStyle={{ backgroundColor: colors.border, width: 40, height: 4, borderRadius: 2 }}
        >
          <View style={{ paddingHorizontal: 20, paddingTop: 12, flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: "700", color: colors.textPrimary }}>
              Choose supplier
            </Text>
            <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4 }}>
              Search any supplier to record a payment.
            </Text>
            <View
              style={{
                marginTop: 16,
                marginBottom: 12,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.border,
                paddingHorizontal: 14,
                paddingVertical: 10,
              }}
            >
              <TextInput
                placeholder="Search suppliers"
                placeholderTextColor={colors.textSecondary}
                style={{ fontSize: 15, color: colors.textPrimary }}
                value={supplierSearch}
                onChangeText={setSupplierSearch}
              />
            </View>

            <BottomSheetFlatList
              data={supplierList}
              keyExtractor={(item: Supplier) => item.id}
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: 24 }}
              renderItem={({ item }: { item: Supplier }) => (
                <TouchableOpacity
                  onPress={() => handleSupplierSelected(item)}
                  activeOpacity={0.85}
                  style={{ flexDirection: "row", alignItems: "center", paddingVertical: 14 }}
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
                      Outstanding: {formatCurrency(item.balanceOwed ?? 0)}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 12, fontWeight: "700", color: colors.primary }}>
                    Pay
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={() => (
                <View style={{ alignItems: "center", paddingVertical: 40 }}>
                  <Text style={{ color: colors.textSecondary }}>
                    {isSuppliersFetching ? "Loading suppliers..." : "No suppliers found"}
                  </Text>
                </View>
              )}
            />
          </View>
        </BottomSheetModal>

        <BottomSheetModal
          ref={supplierSummaryRef}
          index={0}
          snapPoints={["45%", "60%"]}
          enablePanDownToClose
          backdropComponent={renderBackdrop}
          backgroundStyle={{ backgroundColor: colors.surface, borderRadius: 32 }}
          handleIndicatorStyle={{ backgroundColor: colors.border, width: 40, height: 4, borderRadius: 2 }}
          onDismiss={() => setSupplierSummary(null)}
        >
          <View style={{ padding: 20, flex: 1 }}>
            {supplierSummary ? (
              <>
                <Text style={{ fontSize: 18, fontWeight: "700", color: colors.textPrimary }}>
                  {supplierSummary.supplier.name}
                </Text>
                <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4 }}>
                  Outstanding balance: {formatCurrency(outstandingBalance)}
                </Text>
                {supplierSummary.loading ? (
                  <View style={{ paddingVertical: 20 }}>
                    <ActivityIndicator color={colors.primary} />
                  </View>
                ) : (
                  <View style={{ marginTop: 16, gap: 10 }}>
                    {lastDelivery ? (
                      <View style={{ padding: 12, borderRadius: 16, backgroundColor: colors.background }}>
                        <Text style={{ fontSize: 13, fontWeight: "600", color: colors.textSecondary }}>
                          Last delivery
                        </Text>
                        <Text style={{ fontSize: 15, fontWeight: "700", color: colors.textPrimary }}>
                          {formatCurrency(Number(lastDelivery.total_amount ?? 0))}
                        </Text>
                        <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                          {new Date(lastDelivery.delivery_date).toLocaleDateString("en-IN")}
                        </Text>
                      </View>
                    ) : null}
                {lastPayment ? (
                  <View style={{ padding: 12, borderRadius: 16, backgroundColor: colors.background }}>
                    <Text style={{ fontSize: 13, fontWeight: "600", color: colors.textSecondary }}>
                      Last payment made
                    </Text>
                        <Text style={{ fontSize: 15, fontWeight: "700", color: colors.textPrimary }}>
                          {formatCurrency(Number(lastPayment.paymentAmount ?? 0))}
                        </Text>
                        <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                          {new Date(lastPayment.date).toLocaleDateString("en-IN")}
                        </Text>
                      </View>
                    ) : null}
                    {supplierSummary.detail?.timeline?.length ? (
                      <View style={{ padding: 12, borderRadius: 16, backgroundColor: colors.background }}>
                        <Text style={{ fontSize: 12, fontWeight: "600", color: colors.textSecondary, marginBottom: 8 }}>
                          Recent activity
                        </Text>
                        {supplierSummary.detail.timeline.slice(0, 3).map((event) => (
                          <View key={event.id} style={{ marginBottom: 6 }}>
                            <Text style={{ fontSize: 13, fontWeight: "700", color: colors.textPrimary }}>
                              {event.type === "delivery" ? "Delivery" : "Payment"}
                            </Text>
                            <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                              {new Date(event.date).toLocaleDateString("en-IN")} •
                              {" "}
                              {formatCurrency(
                                event.type === "delivery"
                                  ? Number(event.delivery?.total_amount ?? 0)
                                  : Number(event.paymentAmount ?? 0),
                              )}
                            </Text>
                          </View>
                        ))}
                      </View>
                    ) : null}
                  </View>
                )}

                <View style={{ marginTop: 20, gap: 12 }}>
                  <View className="flex-row gap-3">
                    {quickPayRatios.map((ratio) => (
                      <TouchableOpacity
                        key={`quick-pay-${ratio}`}
                        className="flex-1"
                        style={{
                          paddingVertical: 12,
                          borderRadius: 14,
                          borderWidth: 1,
                          borderColor:
                            selectedSupplierRatio === ratio
                              ? colors.primary
                              : colors.border,
                          backgroundColor:
                            selectedSupplierRatio === ratio
                              ? "rgba(15,118,110,0.08)"
                              : "transparent",
                          alignItems: "center",
                        }}
                        onPress={() => {
                          const targetAmount = Math.max(
                            0,
                            Math.round(outstandingBalance * ratio),
                          );
                          setSupplierPaymentContext({
                            id: supplierSummary.supplier.id,
                            name: supplierSummary.supplier.name,
                            balance: targetAmount || outstandingBalance,
                          });
                          supplierSummaryRef.current?.dismiss();
                          updatePreferredRatio(supplierSummary.supplier.id, ratio);
                        }}
                      >
                        <Text style={{ fontSize: 12, fontWeight: "600", color: colors.textSecondary }}>
                          Pay {ratio === 1 ? "full" : `${ratio * 100}%`}
                        </Text>
                        <Text style={{ fontSize: 13, fontWeight: "700", color: colors.textPrimary }}>
                          {formatCurrency(
                            ratio === 1
                              ? outstandingBalance
                              : Math.round(outstandingBalance * ratio),
                          )}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TouchableOpacity
                    className="w-full"
                    style={{
                      paddingVertical: 14,
                      borderRadius: 16,
                      backgroundColor: colors.primary,
                      alignItems: "center",
                    }}
                    onPress={() => {
                      setSupplierPaymentContext({
                        id: supplierSummary.supplier.id,
                        name: supplierSummary.supplier.name,
                        balance:
                          supplierSummary.detail?.totalOwed ??
                          supplierSummary.supplier.balanceOwed ??
                          0,
                      });
                      supplierSummaryRef.current?.dismiss();
                      updatePreferredRatio(supplierSummary.supplier.id, 1);
                    }}
                  >
                    <Text style={{ color: colors.surface, fontSize: 15, fontWeight: "700" }}>
                      Record Payment
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="w-full"
                    style={{
                      paddingVertical: 14,
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: colors.border,
                      alignItems: "center",
                    }}
                    onPress={() => {
                      supplierSummaryRef.current?.dismiss();
                      router.push({ pathname: "/(main)/suppliers/[supplierId]", params: { supplierId: supplierSummary.supplier.id } } as never);
                    }}
                  >
                    <Text style={{ color: colors.textPrimary, fontSize: 15, fontWeight: "700" }}>
                      Open Supplier Detail
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
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
            onSuccess={handleCustomerPaymentSuccess}
            onDismiss={() => setPaymentContext(null)}
          />
        )}

        <RecordPaymentMadeModal
          visible={!!supplierPaymentContext}
          balanceOwed={supplierPaymentContext?.balance ?? 0}
          supplierName={supplierPaymentContext?.name}
          loading={isPayingSupplier}
          onClose={() => {
            if (!isPayingSupplier) setSupplierPaymentContext(null);
          }}
          onSubmit={async ({ amount, payment_mode, notes }) => {
            await handleSubmitSupplierPayment({ amount, payment_mode, notes });
          }}
        />

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
