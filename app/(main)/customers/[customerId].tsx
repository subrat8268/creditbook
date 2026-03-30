import RecordCustomerPaymentModal from "@/src/components/customers/RecordCustomerPaymentModal";
import EmptyState from "@/src/components/feedback/EmptyState";
import Loader from "@/src/components/feedback/Loader";
import { useToast } from "@/src/components/feedback/Toast";
import { useCustomerDetail } from "@/src/hooks/useCustomer";
import { useAuthStore } from "@/src/store/authStore";
import { Transaction } from "@/src/types/customer";
import { colors } from "@/src/utils/theme";
import { LinearGradient } from "expo-linear-gradient";
import * as Print from "expo-print";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import {
    AlertTriangle,
    ArrowDown,
    ArrowLeft,
    ArrowUp,
    Banknote,
    Download,
    FileText,
    MessageCircle,
    Phone,
    Plus,
    Receipt,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import {
    Linking,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Helpers ──────────────────────────────────────────────────────────────────
type TxFilter = "All" | "Bills Given" | "Payments";

/** Format rupee amount — shows decimals only when non-zero paise */
function formatINR(n: number) {
  return (
    "\u20B9" +
    n.toLocaleString("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })
  );
}

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
  const diffDays = Math.round(
    (today.getTime() - target.getTime()) / 86_400_000,
  );
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatLastBillDate(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getLastActiveLabel(lastActiveAt: string | null | undefined): string {
  if (!lastActiveAt) return "Last active: Never";
  const diffDays = Math.round(
    (Date.now() - new Date(lastActiveAt).getTime()) / 86_400_000,
  );
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
): string {
  const rows = transactions
    .map((tx) => {
      const sign = tx.type === "payment" ? "+" : "";
      const color = tx.type === "payment" ? colors.primary : colors.danger;
      const label =
        tx.type === "bill"
          ? `Invoice ${tx.billNumber ?? ""}`
          : `Payment (${tx.paymentMode ?? ""})`;
      return `<tr>
        <td>${new Date(tx.created_at).toLocaleDateString("en-IN")}</td>
        <td>${label}</td>
        <td style="color:${color};font-weight:700;">${sign}${formatINR(tx.amount)}</td>
        <td>${formatINR(tx.runningBalance)}</td>
      </tr>`;
    })
    .join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<style>
  body{font-family:Arial,sans-serif;padding:24px;color:#1C1C1E;}
  h1{font-size:22px;}
  table{width:100%;border-collapse:collapse;margin-top:20px;}
  th{background:#5B3FFF;color:white;padding:10px 8px;text-align:left;}
  td{padding:10px 8px;border-bottom:1px solid #E5E5EA;}
  .balance{font-size:18px;font-weight:700;color:${colors.danger};}
</style></head><body>
<h1>${businessName} — Customer Statement</h1>
<p><b>Customer:</b> ${name}<br/><b>Phone:</b> ${phone}</p>
<p class="balance">Outstanding Balance: ${formatINR(balance)}</p>
<table><thead><tr><th>Date</th><th>Description</th><th>Amount</th><th>Balance</th></tr></thead>
<tbody>${rows}</tbody></table>
</body></html>`;
}

// ─── Transaction Row ──────────────────────────────────────────────────────────
const MODE_LABEL: Record<string, string> = {
  cash: "Cash",
  upi: "UPI",
  neft: "NEFT",
  draft: "Draft",
  cheque: "Cheque",
  online: "UPI",
};

function TransactionRow({ tx }: { tx: Transaction }) {
  const isPayment = tx.type === "payment";
  const borderColor = isPayment ? colors.primary : colors.danger;
  const iconBg = isPayment ? colors.successBg : colors.dangerBg;
  const iconColor = isPayment ? colors.primary : colors.danger;
  const amountColor = isPayment ? colors.primary : colors.danger;
  const title = isPayment
    ? "Payment Received"
    : `Bill${tx.billNumber ? ` #${tx.billNumber}` : ""}`;
  const modeLabel = tx.paymentMode
    ? (MODE_LABEL[tx.paymentMode.toLowerCase()] ?? tx.paymentMode)
    : "";
  // Payment subtitle: "Cash \u00b7 INV-042"  | Bill subtitle: "7 items"
  const subtitle = isPayment
    ? [modeLabel, tx.orderBillNumber].filter(Boolean).join(" \u00b7 ")
    : tx.itemCount
      ? `${tx.itemCount} item${tx.itemCount !== 1 ? "s" : ""}`
      : (tx.status ?? "");

  return (
    <View
      className={`bg-white rounded-[14px] px-3.5 py-3.5 mb-[10px] border-l-4`}
      style={{
        borderLeftColor: borderColor,
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
      }}
    >
      <View className="flex-row items-center">
        <View
          className="w-[38px] h-[38px] rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: iconBg }}
        >
          {isPayment ? (
            <ArrowDown size={18} color={iconColor} strokeWidth={2} />
          ) : (
            <ArrowUp size={18} color={iconColor} strokeWidth={2} />
          )}
        </View>
        <View className="flex-1">
          <Text className="text-sm font-bold text-textDark">{title}</Text>
          {subtitle ? (
            <Text className="text-xs text-textMuted mt-px">{subtitle}</Text>
          ) : null}
        </View>
        <Text
          className="text-[16px] font-extrabold"
          style={{ color: amountColor }}
        >
          {isPayment ? "+" : ""}
          {formatINR(tx.amount)}
        </Text>
      </View>
      <View className="flex-row justify-between mt-[10px] pl-[50px]">
        <Text className="text-xs text-textMuted">
          {formatTime(tx.created_at)}
        </Text>
        <Text className="text-xs text-textPrimary font-semibold">
          Bal: {formatINR(tx.runningBalance)}
        </Text>
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
type ListItem =
  | { kind: "header"; label: string; key: string }
  | { kind: "tx"; data: Transaction; key: string };

export default function CustomerDetailScreen() {
  const router = useRouter();
  const { customerId } = useLocalSearchParams<{ customerId: string }>();
  const {
    data: customer,
    isLoading,
    isError,
    refetch,
  } = useCustomerDetail(customerId);
  const profile = useAuthStore((s) => s.profile);

  const { show: showToast } = useToast();

  const [txFilter, setTxFilter] = useState<TxFilter>("All");
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [exporting, setExporting] = useState(false);

  const sendWhatsAppReminder = () => {
    if (!customer) return;
    const biz = profile?.business_name || "our store";
    const bal = customer.outstandingBalance.toLocaleString("en-IN");
    const msg = `Dear ${customer.name}, your outstanding balance with ${biz} is ₹${bal}. Please arrange payment. Thank you.`;
    Linking.openURL(
      `https://wa.me/91${customer.phone}?text=${encodeURIComponent(msg)}`,
    );
  };

  const callCustomer = () => {
    if (customer?.phone) Linking.openURL(`tel:${customer.phone}`);
  };

  const downloadStatement = async () => {
    if (!customer) return;
    if (customer.transactions.length === 0) {
      showToast({
        message: "No transactions yet — add a bill or payment first.",
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

  const listItems = useMemo<ListItem[]>(() => {
    if (!customer) return [];
    const filtered = customer.transactions.filter((tx) => {
      if (txFilter === "Bills Given") return tx.type === "bill";
      if (txFilter === "Payments") return tx.type === "payment";
      return true;
    });
    const groups: Record<string, Transaction[]> = {};
    for (const tx of filtered) {
      const label = getDateLabel(tx.created_at);
      if (!groups[label]) groups[label] = [];
      groups[label].push(tx);
    }
    const items: ListItem[] = [];
    for (const [label, txs] of Object.entries(groups)) {
      items.push({ kind: "header", label, key: `h-${label}` });
      for (const tx of txs)
        items.push({ kind: "tx", data: tx, key: `tx-${tx.id}` });
    }
    return items;
  }, [customer, txFilter]);

  if (isLoading) return <Loader />;
  if (isError || !customer) return <EmptyState message="Customer not found" />;

  const hasPendingPayment =
    !!customer.pendingOrderId && (customer.pendingOrderBalance ?? 0) > 0;

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      edges={["top", "left", "right"]}
    >
      <Stack.Screen options={{ headerShown: false }} />

      {/* ── Header ── */}
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-border">
        <TouchableOpacity onPress={() => router.back()} className="p-1 mr-2">
          <ArrowLeft size={24} color={colors.textPrimary} strokeWidth={2} />
        </TouchableOpacity>
        <View className="flex-1">
          <Text
            className="text-[17px] font-bold text-textDark"
            numberOfLines={1}
          >
            {customer.name}
          </Text>
          {getLastActiveLabel(customer.lastActiveAt) ? (
            <Text className="text-xs text-textMuted mt-px">
              {getLastActiveLabel(customer.lastActiveAt)}
            </Text>
          ) : null}
        </View>
        <View className="flex-row gap-2">
          {customer.transactions.length > 0 && (
            <TouchableOpacity
              className="w-[38px] h-[38px] rounded-full bg-search items-center justify-center"
              onPress={downloadStatement}
            >
              <FileText size={20} color={colors.primary} strokeWidth={2} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            className="w-[38px] h-[38px] rounded-full bg-search items-center justify-center"
            onPress={callCustomer}
          >
            <Phone size={20} color={colors.primary} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero Card ── */}
        <LinearGradient
          colors={
            customer.outstandingBalance === 0
              ? [colors.primary, colors.primaryDark]
              : [colors.danger, "#B33226"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            marginHorizontal: 16,
            marginTop: 16,
            borderRadius: 20,
            padding: 22,
            overflow: "hidden",
            minHeight: 140,
          }}
        >
          <View
            style={{
              position: "absolute",
              right: -30,
              top: -30,
              width: 130,
              height: 130,
              borderRadius: 65,
              backgroundColor: "rgba(255,255,255,0.07)",
            }}
          />
          <View
            style={{
              position: "absolute",
              right: 50,
              bottom: -40,
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: "rgba(255,255,255,0.05)",
            }}
          />

          <View className="flex-row justify-between items-center mb-[10px]">
            <Text className="text-[11px] font-bold text-white/75 tracking-widest">
              TOTAL BALANCE DUE
            </Text>
          </View>

          <Text className="text-[38px] font-extrabold text-white leading-tight mb-3">
            {formatINR(customer.outstandingBalance)}
          </Text>

          {/* Bottom row: settled subtitle | overdue pill | last bill date */}
          {customer.outstandingBalance === 0 ? (
            <Text className="text-[13px] text-white/70">
              No outstanding balance
            </Text>
          ) : customer.isOverdue ? (
            <View className="flex-row items-center gap-3">
              <View
                className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{ backgroundColor: "rgba(255,255,255,0.18)" }}
              >
                <AlertTriangle size={12} color="#FFF" strokeWidth={2.5} />
                <Text className="text-[12px] font-bold text-white">
                  OVERDUE \u00b7 {customer.daysSinceLastOrder} days
                </Text>
              </View>
              {customer.lastActiveAt ? (
                <Text className="text-[12px] text-white/65">
                  Last bill: {formatLastBillDate(customer.lastActiveAt)}
                </Text>
              ) : null}
            </View>
          ) : customer.lastActiveAt ? (
            <Text className="text-[12px] text-white/65">
              Last bill: {formatLastBillDate(customer.lastActiveAt)}
            </Text>
          ) : null}
        </LinearGradient>

        {/* ── Action Buttons ── */}
        <View className="flex-row mx-4 mt-4 gap-3">
          <TouchableOpacity
            className="flex-1 bg-white rounded-2xl py-[18px] items-center gap-2"
            style={{
              shadowColor: "#000000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 6,
              elevation: 2,
            }}
            activeOpacity={0.8}
            onPress={() =>
              router.push({
                pathname: "/orders/create",
                params: { customer: JSON.stringify(customer) },
              })
            }
          >
            <View
              className="w-11 h-11 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.dangerBg }}
            >
              <Plus size={22} color={colors.danger} strokeWidth={2.5} />
            </View>
            <Text className="text-[13px] font-semibold text-textDark">
              New Bill
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 bg-white rounded-2xl py-[18px] items-center gap-2"
            style={{
              shadowColor: "#000000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 6,
              elevation: 2,
            }}
            activeOpacity={0.8}
            onPress={() => {
              if (!hasPendingPayment) {
                showToast({
                  message: "No outstanding balance for this customer.",
                  type: "error",
                });
                return;
              }
              setPaymentModalVisible(true);
            }}
          >
            <View
              className="w-11 h-11 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.successBg }}
            >
              <Banknote size={22} color={colors.primary} strokeWidth={2} />
            </View>
            <Text className="text-[13px] font-semibold text-textDark">
              Received
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 bg-white rounded-2xl py-[18px] items-center gap-2"
            style={{
              shadowColor: "#000000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 6,
              elevation: 2,
            }}
            activeOpacity={0.8}
            onPress={sendWhatsAppReminder}
          >
            <View
              className="w-11 h-11 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.pending.bg }}
            >
              <MessageCircle size={22} color={colors.warning} strokeWidth={2} />
            </View>
            <Text className="text-[13px] font-semibold text-textDark">
              Send Reminder
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Transactions ── */}
        <View className="mt-6">
          {/* Underline tab bar */}
          <View
            className="flex-row border-b"
            style={{ borderBottomColor: colors.border }}
          >
            {(["All", "Bills Given", "Payments"] as TxFilter[]).map((f) => {
              const active = txFilter === f;
              return (
                <TouchableOpacity
                  key={f}
                  onPress={() => setTxFilter(f)}
                  activeOpacity={0.75}
                  className="flex-1 items-center pb-3 pt-1"
                  style={{
                    borderBottomWidth: active ? 2 : 0,
                    borderBottomColor: active ? colors.primary : "transparent",
                    marginBottom: active ? -1 : 0,
                  }}
                >
                  <Text
                    className="text-[13px] font-semibold"
                    style={{
                      color: active ? colors.primary : colors.textSecondary,
                    }}
                  >
                    {f}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Rows or rich empty state */}
          {listItems.length === 0 ? (
            <View className="items-center px-8 pt-10 pb-6 gap-4">
              {/* Dashed icon box */}
              <View
                className="w-[112px] h-[112px] rounded-[24px] items-center justify-center"
                style={{
                  borderWidth: 2,
                  borderStyle: "dashed",
                  borderColor: colors.paid.bg,
                  backgroundColor: colors.successBg,
                }}
              >
                <Receipt size={48} color={colors.paid.bg} strokeWidth={1.5} />
              </View>
              <Text className="text-[17px] font-bold text-textDark">
                No transactions yet
              </Text>
              <Text className="text-[13px] text-textSecondary text-center leading-5">
                Create a bill or record a payment to get started
              </Text>
              {/* Two CTAs */}
              <View className="flex-row gap-3 mt-2 w-full">
                <TouchableOpacity
                  className="flex-1 items-center justify-center py-3 rounded-full border"
                  style={{ borderColor: colors.primary }}
                  activeOpacity={0.8}
                  onPress={() =>
                    router.push({
                      pathname: "/orders/create",
                      params: { customer: JSON.stringify(customer) },
                    })
                  }
                >
                  <Text
                    className="text-[14px] font-bold"
                    style={{ color: colors.primary }}
                  >
                    New Bill
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 items-center justify-center py-3 rounded-full"
                  style={{ backgroundColor: colors.primary }}
                  activeOpacity={0.8}
                  onPress={() => setPaymentModalVisible(true)}
                >
                  <Text className="text-[14px] font-bold text-white">
                    Record Payment
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View className="px-4 pt-4">
              {listItems.map((item) =>
                item.kind === "header" ? (
                  <View
                    key={item.key}
                    className="flex-row items-center my-3 gap-2"
                  >
                    <View className="flex-1 h-px bg-border" />
                    <View className="bg-border rounded-xl px-3 py-1">
                      <Text className="text-xs font-semibold text-textPrimary">
                        {item.label}
                      </Text>
                    </View>
                    <View className="flex-1 h-px bg-border" />
                  </View>
                ) : (
                  <TransactionRow key={item.key} tx={item.data} />
                ),
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* ── Download Statement Footer ── */}
      <View className="px-6 py-4 bg-white border-t border-border">
        <TouchableOpacity
          className={`flex-row items-center justify-center gap-2 rounded-[30px] py-4 ${
            exporting ? "opacity-60" : ""
          }`}
          style={{
            backgroundColor:
              customer.transactions.length === 0
                ? colors.border
                : colors.textPrimary,
          }}
          onPress={downloadStatement}
          disabled={exporting || customer.transactions.length === 0}
          activeOpacity={0.85}
        >
          <Download
            size={18}
            color={
              customer.transactions.length === 0
                ? colors.textSecondary
                : "#FFFFFF"
            }
            strokeWidth={2}
          />
          <Text
            className="text-[15px] font-bold"
            style={{
              color:
                customer.transactions.length === 0
                  ? colors.textSecondary
                  : "#FFFFFF",
            }}
          >
            {exporting ? "Generating…" : "Download Statement"}
          </Text>
        </TouchableOpacity>
      </View>

      {hasPendingPayment && (
        <RecordCustomerPaymentModal
          visible={paymentModalVisible}
          onClose={() => setPaymentModalVisible(false)}
          onSuccess={() => {
            setPaymentModalVisible(false);
            refetch();
          }}
          orderId={customer.pendingOrderId!}
          balanceDue={customer.pendingOrderBalance ?? 0}
          customerId={customer.id}
          customerName={customer.name}
        />
      )}
    </SafeAreaView>
  );
}
