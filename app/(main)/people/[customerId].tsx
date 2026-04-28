import EmptyState from "@/src/components/feedback/EmptyState";
import Loader from "@/src/components/feedback/Loader";
import SyncStatus from "@/src/components/feedback/SyncStatus";
import { useToast } from "@/src/components/feedback/Toast";
import RecordCustomerPaymentModal from "@/src/components/people/RecordCustomerPaymentModal";
import OverdueChip from "@/src/components/ui/OverdueChip";
import { usePersonDetail } from "@/src/hooks/usePeople";
import { supabase } from "@/src/services/supabase";
import { useAuthStore } from "@/src/store/authStore";
import { usePreferencesStore } from "@/src/store/preferencesStore";
import type { Transaction } from "@/src/types/customer";
import { useTheme } from "@/src/utils/ThemeProvider";
import { formatINR } from "@/src/utils/format";
import { buildLedgerShareMessage } from "@/src/utils/shareTemplates";
import { LinearGradient } from "expo-linear-gradient";
import * as Print from "expo-print";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Download,
  FileText,
  MessageCircle,
  Phone,
  Plus,
  Receipt,
  Share2,
} from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Linking, Pressable, ScrollView, Share, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type TxFilter = "All" | "Entries" | "Payments";

type TxListItem =
  | { kind: "header"; label: string; key: string }
  | { kind: "tx"; data: Transaction; key: string };

type QuickActionTileProps = {
  label: string;
  icon: ReactNode;
  onPress: () => void;
  disabled?: boolean;
};

const MODE_LABEL: Record<string, string> = {
  cash: "Cash",
  upi: "UPI",
  neft: "NEFT",
  draft: "Draft",
  cheque: "Cheque",
  online: "UPI",
};

const INITIAL_TX_COUNT = 10;

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function getDateLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((today.getTime() - target.getTime()) / 86_400_000);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";

  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatLastEntryDate(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getLastActiveLabel(lastActiveAt: string | null | undefined): string {
  if (!lastActiveAt) return "Last active: Never";

  const diffDays = Math.round((Date.now() - new Date(lastActiveAt).getTime()) / 86_400_000);
  if (diffDays === 0) return "Last active today";
  if (diffDays === 1) return "Last active yesterday";
  return `Last active ${diffDays} days ago`;
}

function buildStatementHtml(
  name: string,
  phone: string,
  balance: number,
  transactions: Transaction[],
  businessName: string,
  themeColors: ReturnType<typeof useTheme>["colors"],
): string {
  const rows = transactions
    .map((tx) => {
      const sign = tx.type === "payment" ? "+" : "";
      const color = tx.type === "payment" ? themeColors.success : themeColors.danger;
      const label = tx.type === "bill" ? `Entry ${tx.billNumber ?? ""}` : `Payment (${tx.paymentMode ?? ""})`;
      return `<tr>
        <td>${new Date(tx.created_at).toLocaleDateString("en-IN")}</td>
        <td>${label}</td>
        <td style="color:${color};font-weight:700;">${sign}${formatINR(tx.amount, { maximumFractionDigits: 2 })}</td>
        <td>${formatINR(tx.runningBalance, { maximumFractionDigits: 2 })}</td>
      </tr>`;
    })
    .join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<style>
  body{font-family:Arial,sans-serif;padding:24px;color:${themeColors.textPrimary};}
  h1{font-size:22px;}
  table{width:100%;border-collapse:collapse;margin-top:20px;}
  th{background:${themeColors.primary};color:white;padding:10px 8px;text-align:left;}
  td{padding:10px 8px;border-bottom:1px solid ${themeColors.border};}
  .balance{font-size:18px;font-weight:700;color:${themeColors.danger};}
</style></head><body>
 <h1>${businessName} — Customer Statement</h1>
 <p><b>Customer:</b> ${name}<br/><b>Phone:</b> ${phone || "-"}</p>
 <p class="balance">Outstanding Balance: ${formatINR(balance, { maximumFractionDigits: 2 })}</p>
<table><thead><tr><th>Date</th><th>Description</th><th>Amount</th><th>Balance</th></tr></thead>
<tbody>${rows}</tbody></table>
</body></html>`;
}

function QuickActionTile({ label, icon, onPress, disabled = false }: QuickActionTileProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      className={`flex-1 items-center rounded-xl border border-border bg-surface px-3 py-3 dark:border-border-dark dark:bg-surface-dark ${disabled ? "opacity-50" : ""}`}
    >
      <View className="mb-2 h-10 w-10 items-center justify-center rounded-full bg-search dark:bg-search-dark">{icon}</View>
      <Text className="text-caption font-inter-semibold text-textPrimary dark:text-textPrimary-dark">{label}</Text>
    </Pressable>
  );
}

function TransactionRow({ tx, withBorder }: { tx: Transaction; withBorder: boolean }) {
  const { colors } = useTheme();
  const isPayment = tx.type === "payment";
  const amountColorClass = isPayment ? "text-success" : "text-danger-strong";
  const iconBgClass = isPayment
    ? "bg-success-bg dark:bg-success-bg-dark"
    : "bg-danger-bg dark:bg-danger-bg-dark";

  const title = isPayment ? "Payment Received" : `Entry${tx.billNumber ? ` #${tx.billNumber}` : ""}`;
  const modeLabel = tx.paymentMode ? (MODE_LABEL[tx.paymentMode.toLowerCase()] ?? tx.paymentMode) : "";
  const subtitle = isPayment
    ? [modeLabel, tx.orderBillNumber ? `#${tx.orderBillNumber}` : formatTime(tx.created_at)]
        .filter(Boolean)
        .join(" · ")
    : [tx.itemCount ? `${tx.itemCount} items` : "Entry", formatTime(tx.created_at)].join(" · ");

  return (
    <View className={`px-4 py-3 ${withBorder ? "border-b border-light dark:border-border-dark" : ""}`}>
      <View className="flex-row items-center">
        <View className={`mr-3 h-10 w-10 items-center justify-center rounded-full ${iconBgClass}`}>
          {isPayment ? (
            <ArrowDown size={18} color={colors.success} strokeWidth={2.1} />
          ) : (
            <ArrowUp size={18} color={colors.dangerStrong} strokeWidth={2.1} />
          )}
        </View>

        <View className="flex-1 pr-2">
          <Text className="text-card-title font-inter-bold text-textPrimary dark:text-textPrimary-dark" numberOfLines={1}>
            {title}
          </Text>
          <Text className="mt-0.5 text-caption text-textSecondary dark:text-textSecondary-dark" numberOfLines={1}>
            {subtitle}
          </Text>
        </View>

        <View className="items-end">
          <Text className={`text-card-title font-inter-bold ${amountColorClass}`}>
            {isPayment ? "+" : ""}
            {formatINR(tx.amount, { maximumFractionDigits: 2 })}
          </Text>
          <Text className="mt-0.5 text-caption text-textMuted dark:text-textMuted-dark">Bal: {formatINR(tx.runningBalance, { maximumFractionDigits: 2 })}</Text>
        </View>
      </View>
    </View>
  );
}

export default function CustomerDetailScreen() {
  const { colors, gradients, spacing, typography, isDark } = useTheme();
  const { i18n } = useTranslation();
  const router = useRouter();
  const { customerId, focus } = useLocalSearchParams<{ customerId: string; focus?: string }>();

  const { data: customer, isLoading, isError, refetch } = usePersonDetail(customerId);
  const profile = useAuthStore((s) => s.profile);

  const { show: showToast } = useToast();
  const logReminderSent = usePreferencesStore((s) => s.logReminderSent);

  const [txFilter, setTxFilter] = useState<TxFilter>("All");
  const [exporting, setExporting] = useState(false);
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const paymentModalRef = useRef<any>(null);
  const [quickPaymentAmount, setQuickPaymentAmount] = useState<string>("");
  const [shareQueued, setShareQueued] = useState(false);
  const [isSharingLedgerLink, setIsSharingLedgerLink] = useState(false);

  const hasPendingPayment = !!customer?.pendingOrderId && (customer.pendingOrderBalance ?? 0) > 0;

  const heroGradientColors = useMemo(() => {
    if (!customer) return [gradients.customerHero.start, gradients.customerHero.end];
    if (customer.outstandingBalance > 0) return [gradients.customerHero.start, gradients.customerHero.end];
    return [gradients.zeroBalance.start, gradients.zeroBalance.end];
  }, [
    customer,
    gradients.customerHero.start,
    gradients.customerHero.end,
    gradients.zeroBalance.start,
    gradients.zeroBalance.end,
  ]);

  const heroPillText = useMemo(() => {
    if (!customer) return "No outstanding balance";
    if (customer.outstandingBalance === 0) return "No outstanding balance";
    if (customer.outstandingBalance < 0) return "Advance available";
    if (customer.isOverdue) return `OVERDUE · ${customer.daysSinceLastOrder} DAYS`;
    return "Pending balance";
  }, [customer]);

  const heroMetaText = useMemo(() => {
    if (!customer?.lastActiveAt) return "Add an entry to start this ledger";
    return `Last bill: ${formatLastEntryDate(customer.lastActiveAt)}`;
  }, [customer]);

  const filteredTransactions = useMemo(() => {
    if (!customer) return [];
    return customer.transactions.filter((tx) => {
      if (txFilter === "Entries") return tx.type === "bill";
      if (txFilter === "Payments") return tx.type === "payment";
      return true;
    });
  }, [customer, txFilter]);

  const listItems = useMemo<TxListItem[]>(() => {
    const groups: Record<string, Transaction[]> = {};
    for (const tx of filteredTransactions) {
      const label = getDateLabel(tx.created_at);
      if (!groups[label]) groups[label] = [];
      groups[label].push(tx);
    }

    const items: TxListItem[] = [];
    for (const [label, txs] of Object.entries(groups)) {
      items.push({ kind: "header", label, key: `h-${label}` });
      for (const tx of txs) {
        items.push({ kind: "tx", data: tx, key: `tx-${tx.id}` });
      }
    }
    return items;
  }, [filteredTransactions]);

  const visibleListItems = useMemo(
    () => (historyExpanded ? listItems : listItems.slice(0, INITIAL_TX_COUNT)),
    [historyExpanded, listItems],
  );

  const handleShareLedger = useCallback(async () => {
    if (!customer) return;

    setIsSharingLedgerLink(true);
    try {
      const { data, error } = await supabase.rpc("upsert_access_token", {
        p_party_id: customer.id,
      });

      if (error) throw error;

      const token = typeof data === "string" ? data : (data as { token?: string } | null)?.token;
      if (!token) {
        throw new Error("Token generation failed");
      }

      const url = `https://kredbook.app/l/${token}`;
      const locale = i18n.language?.toLowerCase().startsWith("hi") ? "hi" : "en";
      await Share.share({
        message: buildLedgerShareMessage({
          locale,
          customerName: customer.name,
          balance: customer.outstandingBalance,
          businessName: profile?.business_name || profile?.name || "KredBook",
          publicLedgerUrl: url,
        }),
      });
    } catch {
      showToast({ message: "Could not create share link.", type: "error" });
    } finally {
      setIsSharingLedgerLink(false);
    }
  }, [customer, profile?.business_name, profile?.name, i18n.language, showToast]);

  useEffect(() => {
    if (focus === "share") {
      setShareQueued(true);
    }
  }, [focus]);

  useEffect(() => {
    if (shareQueued && customer && profile) {
      handleShareLedger().finally(() => setShareQueued(false));
    }
  }, [shareQueued, customer, profile, handleShareLedger]);

  const sendWhatsAppReminder = () => {
    if (!customer?.phone) {
      showToast({ message: "Customer phone number is missing", type: "error" });
      return;
    }

    const biz = profile?.business_name || "our store";
    const msg = `Dear ${customer.name}, your outstanding balance with ${biz} is ${formatINR(customer.outstandingBalance)}. Please arrange payment. Thank you.`;
    const url = `https://wa.me/91${customer.phone}?text=${encodeURIComponent(msg)}`;

    Linking.openURL(url)
      .then(() => {
        logReminderSent({
          customerId: customer.id,
          customerName: customer.name,
          amount: customer.outstandingBalance,
          channel: "whatsapp",
        });
        showToast({
          message: `Reminder sent to ${customer.name}`,
          type: "success",
        });
      })
      .catch(() => {
        showToast({ message: "Cannot open WhatsApp", type: "error" });
      });
  };

  const callCustomer = () => {
    if (customer?.phone) {
      Linking.openURL(`tel:${customer.phone}`);
    }
  };

  const downloadStatement = async () => {
    if (!customer) return;

    if (customer.transactions.length === 0) {
      showToast({
        message: "No transactions yet — add an entry or payment first.",
        type: "error",
      });
      return;
    }

    setExporting(true);
    try {
      const html = buildStatementHtml(
        customer.name,
        customer.phone,
        customer.outstandingBalance,
        customer.transactions,
        profile?.business_name || "KredBook",
        colors,
      );

      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        UTI: ".pdf",
      });
    } catch {
      showToast({ message: "Could not generate statement.", type: "error" });
    } finally {
      setExporting(false);
    }
  };

  const openPaymentFlow = (amountSeed?: number) => {
    if (!hasPendingPayment) {
      showToast({
        message: "No outstanding balance for this customer.",
        type: "error",
      });
      return;
    }

    setQuickPaymentAmount(amountSeed && amountSeed > 0 ? String(amountSeed) : "");
    paymentModalRef.current?.present();
  };

  if (isLoading) return <Loader />;
  if (isError || !customer) return <EmptyState message="Customer not found" />;

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark" edges={["top", "left", "right"]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-row items-center border-b border-border bg-surface px-4 py-3 dark:border-border-dark dark:bg-surface-dark">
        <Pressable onPress={() => router.back()} className="mr-2 h-11 w-11 items-center justify-center rounded-full">
          <ArrowLeft size={24} color={colors.textPrimary} strokeWidth={2} />
        </Pressable>

        <View className="flex-1">
          <Text className="text-card-title font-inter-bold text-textPrimary dark:text-textPrimary-dark" numberOfLines={1}>
            {customer.name}
          </Text>
          <Text className="mt-0.5 text-caption text-textSecondary dark:text-textSecondary-dark">{getLastActiveLabel(customer.lastActiveAt)}</Text>
        </View>

        <View className="flex-row gap-2">
          <Pressable
            className="h-10 w-10 items-center justify-center rounded-full bg-search dark:bg-search-dark"
            onPress={handleShareLedger}
            disabled={isSharingLedgerLink}
          >
            {isSharingLedgerLink ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Share2 size={20} color={colors.primary} strokeWidth={2} />
            )}
          </Pressable>

          <Pressable
            className={`h-10 w-10 items-center justify-center rounded-full bg-search dark:bg-search-dark ${customer.transactions.length === 0 ? "opacity-50" : ""}`}
            onPress={downloadStatement}
            disabled={customer.transactions.length === 0 || exporting}
          >
            <FileText size={20} color={colors.primary} strokeWidth={2} />
          </Pressable>

          {customer.phone ? (
            <Pressable className="h-10 w-10 items-center justify-center rounded-full bg-search dark:bg-search-dark" onPress={callCustomer}>
              <Phone size={20} color={colors.primary} strokeWidth={2} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: spacing.tabBarHeight + spacing["2xl"],
        }}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={heroGradientColors as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="mx-4 mt-4 overflow-hidden rounded-xl px-5 py-5"
        >
          <View className={`absolute -right-8 -top-9 h-32 w-32 rounded-full ${isDark ? "bg-customer-hero-orb-dark" : "bg-customer-hero-orb"}`} />
          <View className={`absolute bottom-[-40px] right-8 h-24 w-24 rounded-full ${isDark ? "bg-customer-hero-orb-dark" : "bg-customer-hero-orb"}`} />

          <Text className="tracking-wider text-customer-hero-text-muted" style={typography.label}>
            TOTAL BALANCE DUE
          </Text>

          <Text className="mt-1 text-customer-hero-text" style={typography.heroAmount}>
            {formatINR(Math.abs(customer.outstandingBalance), { maximumFractionDigits: 2 })}
          </Text>

          <View className="mt-3 flex-row items-center justify-between gap-2">
            <View className="rounded-full border border-customer-hero-chip-border bg-customer-hero-chip-bg px-3 py-1.5">
              <Text style={[typography.caption, { color: colors.overdue.text, fontWeight: "700", letterSpacing: 0.3 }]}>
                  {heroPillText.toUpperCase()}
                </Text>
            </View>
            <Text className="text-caption text-customer-hero-text-muted" numberOfLines={1}>
              {heroMetaText}
            </Text>
          </View>
        </LinearGradient>

        <View className="mx-4 mt-4 rounded-xl border border-border bg-surface p-3 dark:border-border-dark dark:bg-surface-dark">
          <View className="flex-row gap-3">
            <Pressable
              className="flex-1 flex-row items-center justify-center rounded-xl bg-primary py-3"
              onPress={() =>
                router.push({
                  pathname: "/(main)/entries/create",
                  params: { customer: JSON.stringify(customer) },
                })
              }
            >
              <Plus size={18} color={colors.surface} strokeWidth={2.4} />
              <Text className="ml-2 text-body font-inter-bold text-surface">Add Entry</Text>
            </Pressable>

            <Pressable
              className={`flex-1 flex-row items-center justify-center rounded-xl py-3 ${hasPendingPayment ? "bg-danger" : "bg-border dark:bg-border-dark"}`}
              onPress={() => openPaymentFlow()}
              disabled={!hasPendingPayment}
            >
              <ArrowDown
                size={18}
                color={hasPendingPayment ? colors.surface : colors.textSecondary}
                strokeWidth={2.4}
              />
              <Text className={`ml-2 text-body font-inter-bold ${hasPendingPayment ? "text-surface" : "text-textSecondary dark:text-textSecondary-dark"}`}>
                Record Payment
              </Text>
            </Pressable>
          </View>

          <View className="mt-3 flex-row gap-3">
            <QuickActionTile
              label={isSharingLedgerLink ? "Sharing" : "Share"}
              icon={
                isSharingLedgerLink ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Share2 size={18} color={colors.primary} strokeWidth={2} />
                )
              }
              onPress={handleShareLedger}
              disabled={isSharingLedgerLink}
            />

            <QuickActionTile
              label={exporting ? "Exporting" : "PDF"}
              icon={<Download size={18} color={colors.primary} strokeWidth={2} />}
              onPress={downloadStatement}
              disabled={customer.transactions.length === 0 || exporting}
            />

            <QuickActionTile
              label="Call"
              icon={<Phone size={18} color={colors.primary} strokeWidth={2} />}
              onPress={callCustomer}
              disabled={!customer.phone}
            />
          </View>
        </View>

        <View className="mx-4 mt-4 overflow-hidden rounded-xl border border-border bg-surface dark:border-border-dark dark:bg-surface-dark">
          <View className="px-3 pb-2 pt-3">
            <View className="flex-row rounded-full bg-search p-1 dark:bg-search-dark">
              {(["All", "Entries", "Payments"] as TxFilter[]).map((tab) => {
                const active = txFilter === tab;
                return (
                  <Pressable
                    key={tab}
                    onPress={() => {
                      setTxFilter(tab);
                      setHistoryExpanded(false);
                    }}
                    className={`flex-1 rounded-full py-2 ${active ? "bg-primary" : ""}`}
                  >
                    <Text className={`text-center text-body font-inter-semibold ${active ? "text-surface" : "text-textSecondary dark:text-textSecondary-dark"}`}>
                      {tab}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View className="mt-2 flex-row items-center justify-end">
              <SyncStatus variant="compact" />
            </View>
          </View>

          {listItems.length === 0 ? (
            <View className="items-center px-4 pb-4 pt-5">
              <View className="h-20 w-20 items-center justify-center rounded-2xl border-2 border-dashed border-success bg-success-bg dark:bg-success-bg-dark">
                <Receipt size={30} color={colors.primary} strokeWidth={1.8} />
              </View>

              <Text className="mt-4 text-section-title text-textPrimary dark:text-textPrimary-dark">No transactions yet</Text>
              <Text className="mt-1 text-center text-body text-textSecondary dark:text-textSecondary-dark">
                Add an entry or record a payment to start this customer ledger.
              </Text>

              <View className="mt-5 flex-row gap-3">
                <Pressable
                  className="flex-1 rounded-xl border border-primary py-3"
                  onPress={() =>
                    router.push({
                      pathname: "/(main)/entries/create",
                      params: { customer: JSON.stringify(customer) },
                    })
                  }
                >
                  <Text className="text-center text-body font-inter-bold text-primary">Add Entry</Text>
                </Pressable>

                <Pressable
                  className={`flex-1 rounded-xl py-3 ${hasPendingPayment ? "bg-primary" : "bg-border dark:bg-border-dark"}`}
                  onPress={() => openPaymentFlow(customer.pendingOrderBalance ?? 0)}
                  disabled={!hasPendingPayment}
                >
                  <Text className={`text-center text-body font-inter-bold ${hasPendingPayment ? "text-surface" : "text-textSecondary dark:text-textSecondary-dark"}`}>
                    Record Payment
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View className="pb-2">
              {visibleListItems.map((item, index) => {
                if (item.kind === "header") {
                  return (
                    <Text
                      key={item.key}
                      className="px-4 pb-2 pt-4 text-caption font-inter-bold uppercase tracking-widest text-textSecondary dark:text-textSecondary-dark"
                    >
                      {item.label}
                    </Text>
                  );
                }

                const next = visibleListItems[index + 1];
                const withBorder = !!next && next.kind === "tx";
                return <TransactionRow key={item.key} tx={item.data} withBorder={withBorder} />;
              })}

              {!historyExpanded && listItems.length > INITIAL_TX_COUNT ? (
                <Pressable className="items-center px-4 py-4" onPress={() => setHistoryExpanded(true)}>
                  <Text className="text-body font-inter-semibold text-primary">View Older History</Text>
                </Pressable>
              ) : null}
            </View>
          )}
        </View>
      </ScrollView>

      <View className="flex-row gap-3 border-t border-border bg-surface px-4 py-4 dark:border-border-dark dark:bg-surface-dark">
        <Pressable
          className={`flex-1 flex-row items-center justify-center rounded-full py-4 ${
            customer.transactions.length === 0
              ? "bg-border dark:bg-border-dark"
              : customer.outstandingBalance > 0
                ? "bg-net-position dark:bg-net-position-dark"
                : "bg-search dark:bg-search-dark"
          }`}
          onPress={downloadStatement}
          disabled={exporting || customer.transactions.length === 0}
        >
          <Download
            size={17}
            color={
              customer.transactions.length === 0
                ? colors.textSecondary
                : customer.outstandingBalance > 0
                  ? colors.surface
                  : colors.textPrimary
            }
            strokeWidth={2}
          />
          <Text
            className="ml-2 text-body font-inter-bold"
            style={{
              color:
                customer.transactions.length === 0
                  ? colors.textSecondary
                  : customer.outstandingBalance > 0
                    ? colors.surface
                    : colors.textPrimary,
            }}
          >
            {exporting ? "Generating..." : "Download PDF"}
          </Text>
        </Pressable>

        <Pressable
          className={`flex-1 flex-row items-center justify-center rounded-full py-4 ${customer.phone ? "bg-success" : "bg-border dark:bg-border-dark"}`}
          onPress={sendWhatsAppReminder}
          disabled={!customer.phone}
        >
          <MessageCircle
            size={17}
            color={customer.phone ? colors.surface : colors.textSecondary}
            strokeWidth={2}
          />
          <Text className={`ml-2 text-body font-inter-bold ${customer.phone ? "text-surface" : "text-textSecondary dark:text-textSecondary-dark"}`}>
            WhatsApp
          </Text>
        </Pressable>
      </View>

      {hasPendingPayment ? (
        <RecordCustomerPaymentModal
          ref={paymentModalRef}
          onSuccess={() => {
            paymentModalRef.current?.dismiss();
            refetch();
            showToast({
              message: `Payment recorded for ${customer.name}`,
              type: "success",
            });
          }}
          orderId={customer.pendingOrderId!}
          balanceDue={customer.pendingOrderBalance ?? 0}
          customerId={customer.id}
          customerName={customer.name}
          initialAmount={quickPaymentAmount ? Number(quickPaymentAmount) : undefined}
        />
      ) : null}
    </SafeAreaView>
  );
}
