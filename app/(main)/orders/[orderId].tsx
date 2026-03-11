import RecordCustomerPaymentModal from "@/src/components/customers/RecordCustomerPaymentModal";
import EmptyState from "@/src/components/feedback/EmptyState";
import Loader from "@/src/components/feedback/Loader";
import { orderKeys, useOrderDetail } from "@/src/hooks/useOrders";

import { usePayments } from "@/src/hooks/usePayments";
import { useAuthStore } from "@/src/store/authStore";
import { generateBillPdf } from "@/src/utils/generateBillPdf";
import { daysSince, formatDate } from "@/src/utils/helper";
import { colors } from "@/src/utils/theme";
import { useQueryClient } from "@tanstack/react-query";
import { Stack, useLocalSearchParams } from "expo-router";
import * as Sharing from "expo-sharing";
import { MessageCircle, Wallet } from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ── Design tokens (literal values for portability) ───────────────────────
const STATUS_STYLES: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  Paid: { bg: "#DCFCE7", text: "#16A34A", label: "PAID" },
  "Partially Paid": { bg: "#DBEAFE", text: "#1D4ED8", label: "PARTIAL" },
  Pending: { bg: "#FEF3C7", text: "#D97706", label: "PENDING" },
  Overdue: { bg: "#FEE2E2", text: "#DC2626", label: "OVERDUE" },
};

const PAYMENT_MODE_COLORS: Record<string, { bg: string; text: string }> = {
  Cash: { bg: "#DCFCE7", text: "#16A34A" },
  UPI: { bg: "#DBEAFE", text: "#1D4ED8" },
  NEFT: { bg: "#F3E8FF", text: "#7C3AED" },
  Draft: { bg: "#FEF3C7", text: "#D97706" },
  Cheque: { bg: "#E0F2FE", text: "#0369A1" },
};

// ── Avatar helpers ──────────────────────────────────────────────────────
const AVATAR_COLORS = [
  colors.danger.DEFAULT,
  colors.warning.DEFAULT,
  colors.primary.DEFAULT,
  colors.info.DEFAULT,
  "#9B59B6",
  "#E91E8C",
  "#00BCD4",
  "#FF5722",
] as const;

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length >= 2)
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

function fmt(n: number) {
  return n.toLocaleString("en-IN");
}

// ── Card shadow style ─────────────────────────────────────────────────
const SHADOW = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.06,
  shadowRadius: 4,
  elevation: 2,
};

export default function OrderDetailScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { profile } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: order, isLoading, isError } = useOrderDetail(orderId);
  const { payments, isLoading: paymentsLoading } = usePayments(
    orderId ?? "",
    profile?.id,
  );

  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [sendingBill, setSendingBill] = useState(false);

  // ── Derived values ───────────────────────────────────────────────
  const customerName = order?.customer?.name ?? "Unknown Customer";
  const customerPhone = order?.customer?.phone ?? "";

  const isOverdue =
    order?.status === "Pending" && daysSince(order?.created_at ?? "") > 30;
  const statusKey = isOverdue ? "Overdue" : (order?.status ?? "Pending");
  const chipStyle = STATUS_STYLES[statusKey] ?? STATUS_STYLES["Pending"];

  const itemsSubtotal = useMemo(
    () => order?.items?.reduce((s, i) => s + i.subtotal, 0) ?? 0,
    [order?.items],
  );
  const taxAmount = order?.tax_percent
    ? Math.round(((itemsSubtotal * order.tax_percent) / 100) * 100) / 100
    : 0;
  // Grand total = order total (subtotal+tax+loading) + previous balance
  const grandTotal =
    (order?.total_amount ?? 0) + (order?.previous_balance ?? 0);

  // Payments sorted oldest → newest for running-balance calculation
  const sortedPayments = useMemo(
    () =>
      [...(payments ?? [])].sort(
        (a, b) =>
          new Date(a.payment_date).getTime() -
          new Date(b.payment_date).getTime(),
      ),
    [payments],
  );

  const paymentRows = useMemo(() => {
    let running = grandTotal;
    return sortedPayments.map((p) => {
      running -= p.amount;
      return { payment: p, remaining: Math.max(0, running) };
    });
  }, [sortedPayments, grandTotal]);

  // ── Send Bill ───────────────────────────────────────────────────
  const handleSendBill = useCallback(async () => {
    if (!order) return;
    setSendingBill(true);
    try {
      const pdfUri = await generateBillPdf(
        order.items.map((i) => ({
          name: i.product_name,
          quantity: i.quantity,
          price: i.price,
          variantName: i.variant_name,
        })),
        {
          name: profile?.business_name ?? profile?.name ?? "",
          phone: profile?.phone ?? "",
          gstin: profile?.gstin ?? "",
          bankName: profile?.bank_name ?? "",
          accountNumber: profile?.account_number ?? "",
          ifscCode: profile?.ifsc_code ?? "",
        },
        order.total_amount,
        customerName,
        {
          invoiceNumber: order.bill_number,
          date: formatDate(order.created_at),
          upiId: profile?.upi_id ?? "",
          taxPercent: order.tax_percent,
          loadingCharge: order.loading_charge,
          previousBalance: order.previous_balance,
        },
      );

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(pdfUri, {
          mimeType: "application/pdf",
          dialogTitle: `Bill ${order.bill_number}`,
          UTI: "com.adobe.pdf",
        });
      } else {
        throw new Error("sharing-unavailable");
      }
    } catch {
      // Fallback: pre-filled WhatsApp message
      const cleanPhone = customerPhone.replace(/\D/g, "");
      const msg = encodeURIComponent(
        `Hi ${customerName}, your bill *${order.bill_number}* of *₹${fmt(order.total_amount)}* is ready.` +
          (order.balance_due > 0
            ? ` Remaining balance: *₹${fmt(order.balance_due)}*. Please arrange payment at your earliest convenience.`
            : " The bill has been fully paid. Thank you!"),
      );
      const wa = `https://wa.me/91${cleanPhone}?text=${msg}`;
      Linking.openURL(wa).catch(() =>
        Alert.alert(
          "Cannot open WhatsApp",
          "Please install WhatsApp and try again.",
        ),
      );
    } finally {
      setSendingBill(false);
    }
  }, [order, customerName, customerPhone, profile]);

  // ── Payment success ─────────────────────────────────────────────
  const handlePaymentSuccess = useCallback(() => {
    setPaymentModalVisible(false);
    if (profile?.id) {
      queryClient.invalidateQueries({
        queryKey: orderKeys.detail(orderId ?? ""),
      });
      queryClient.invalidateQueries({ queryKey: orderKeys.list(profile.id) });
      queryClient.invalidateQueries({ queryKey: ["payments", orderId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", profile.id] });
    }
    Alert.alert(
      "✅ Payment recorded",
      "The payment has been saved successfully.",
    );
  }, [orderId, profile?.id, queryClient]);

  // ── Loading / Error gates ─────────────────────────────────────────
  if (isLoading) return <Loader />;
  if (isError || !order)
    return (
      <EmptyState
        title="Order not found"
        description="This order could not be loaded."
      />
    );

  const isPaid = order.status === "Paid";

  return (
    <SafeAreaView
      edges={["bottom"]}
      style={{ flex: 1, backgroundColor: "#F6F7F9" }}
    >
      {/* Override stack header title with dynamic bill number */}
      <Stack.Screen options={{ title: `Order #${order.bill_number}` }} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 120 }}
      >
        {/* ───────────────────────────────────────── */}
        {/* 1. Customer Card                                */}
        {/* ───────────────────────────────────────── */}
        <View
          style={[
            {
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              marginHorizontal: 16,
              marginBottom: 12,
              padding: 16,
            },
            SHADOW,
          ]}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {/* Avatar */}
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: getAvatarColor(customerName),
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
                flexShrink: 0,
              }}
            >
              <Text
                style={{ color: "#FFFFFF", fontSize: 17, fontWeight: "700" }}
              >
                {getInitials(customerName)}
              </Text>
            </View>

            {/* Name + phone */}
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: "700",
                  color: "#1C1C1E",
                  marginBottom: 2,
                }}
                numberOfLines={1}
              >
                {customerName}
              </Text>
              <Text style={{ fontSize: 13, color: "#6B7280" }}>
                +91 {customerPhone}
              </Text>
            </View>

            {/* Previous balance */}
            <View style={{ alignItems: "flex-end", marginLeft: 8 }}>
              <Text style={{ fontSize: 11, color: "#6B7280", marginBottom: 3 }}>
                Previous Balance
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "700",
                  color: order.previous_balance > 0 ? "#E74C3C" : "#22C55E",
                }}
              >
                ₹{fmt(order.previous_balance)}
              </Text>
            </View>
          </View>
        </View>

        {/* ───────────────────────────────────────── */}
        {/* 2. Order Items                                  */}
        {/* ───────────────────────────────────────── */}
        <View
          style={[
            {
              backgroundColor: "#FFFFFF",
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
              marginHorizontal: 16,
            },
            SHADOW,
          ]}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: "700",
              color: "#6B7280",
              letterSpacing: 0.8,
              textTransform: "uppercase",
              padding: 16,
              paddingBottom: 10,
            }}
          >
            Items
          </Text>

          {order.items.map((item, idx) => (
            <View key={item.id ?? String(idx)}>
              {idx > 0 && (
                <View
                  style={{
                    height: 1,
                    backgroundColor: "#E5E7EB",
                    marginHorizontal: 16,
                  }}
                />
              )}
              <View
                style={{
                  flexDirection: "row",
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  alignItems: "center",
                }}
              >
                {/* Product name */}
                <Text
                  style={{ flex: 1, fontSize: 15, color: "#1C1C1E" }}
                  numberOfLines={1}
                >
                  {item.product_name}
                  {item.variant_name ? ` (${item.variant_name})` : ""}
                </Text>
                {/* qty × price */}
                <Text
                  style={{
                    fontSize: 13,
                    color: "#6B7280",
                    marginRight: 16,
                    flexShrink: 0,
                  }}
                >
                  {item.quantity} × ₹{fmt(item.price)}
                </Text>
                {/* line total */}
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "700",
                    color: "#1C1C1E",
                    minWidth: 64,
                    textAlign: "right",
                    flexShrink: 0,
                  }}
                >
                  ₹{fmt(item.subtotal)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* ───────────────────────────────────────── */}
        {/* 3. Bill Summary (flush below items card)        */}
        {/* ───────────────────────────────────────── */}
        <View
          style={[
            {
              backgroundColor: "#FFFFFF",
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
              borderBottomLeftRadius: 16,
              borderBottomRightRadius: 16,
              marginHorizontal: 16,
              marginBottom: 12,
              paddingHorizontal: 16,
              paddingTop: 4,
              paddingBottom: 16,
            },
            SHADOW,
          ]}
        >
          {/* Top divider separating items from summary */}
          <View
            style={{
              height: 1,
              backgroundColor: "#E5E7EB",
              marginBottom: 12,
            }}
          />

          {/* Subtotal row */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingVertical: 5,
            }}
          >
            <Text style={{ fontSize: 14, color: "#6B7280" }}>Subtotal</Text>
            <Text style={{ fontSize: 14, color: "#1C1C1E" }}>
              ₹{fmt(itemsSubtotal)}
            </Text>
          </View>

          {/* GST row — only if tax_percent > 0 */}
          {order.tax_percent > 0 && (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingVertical: 5,
              }}
            >
              <Text style={{ fontSize: 14, color: "#6B7280" }}>
                GST ({order.tax_percent}%)
              </Text>
              <Text style={{ fontSize: 14, color: "#1C1C1E" }}>
                ₹{fmt(taxAmount)}
              </Text>
            </View>
          )}

          {/* Loading Charge row — only if > 0 */}
          {order.loading_charge > 0 && (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingVertical: 5,
              }}
            >
              <Text style={{ fontSize: 14, color: "#6B7280" }}>
                Loading Charge
              </Text>
              <Text style={{ fontSize: 14, color: "#6B7280" }}>
                ₹{fmt(order.loading_charge)}
              </Text>
            </View>
          )}

          {/* Previous balance row — only if > 0 */}
          {order.previous_balance > 0 && (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingVertical: 5,
              }}
            >
              <Text style={{ fontSize: 14, color: "#E74C3C" }}>
                Previous Balance
              </Text>
              <Text style={{ fontSize: 14, color: "#E74C3C" }}>
                ₹{fmt(order.previous_balance)}
              </Text>
            </View>
          )}

          {/* Divider before Grand Total */}
          <View
            style={{
              height: 1,
              backgroundColor: "#E5E7EB",
              marginVertical: 12,
            }}
          />

          {/* Grand Total + Status chip */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Text style={{ fontSize: 22, fontWeight: "700", color: "#1C1C1E" }}>
              Grand Total
            </Text>
            <View style={{ alignItems: "flex-end" }}>
              <Text
                style={{ fontSize: 22, fontWeight: "700", color: "#1C1C1E" }}
              >
                ₹{fmt(grandTotal)}
              </Text>
              <View
                style={{
                  backgroundColor: chipStyle.bg,
                  borderRadius: 999,
                  paddingHorizontal: 10,
                  paddingVertical: 3,
                  marginTop: 6,
                }}
              >
                <Text
                  style={{
                    color: chipStyle.text,
                    fontSize: 11,
                    fontWeight: "700",
                    letterSpacing: 0.4,
                  }}
                >
                  {chipStyle.label}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ───────────────────────────────────────── */}
        {/* 4. Payment History                              */}
        {/* ───────────────────────────────────────── */}
        <View
          style={[
            {
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              marginHorizontal: 16,
              marginBottom: 12,
              padding: 16,
            },
            SHADOW,
          ]}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: "700",
              color: "#6B7280",
              letterSpacing: 0.8,
              textTransform: "uppercase",
              marginBottom: 14,
            }}
          >
            Payments Received
          </Text>

          {paymentsLoading ? (
            <Loader />
          ) : paymentRows.length === 0 ? (
            <Text
              style={{
                textAlign: "center",
                color: "#9CA3AF",
                fontSize: 14,
                paddingVertical: 16,
              }}
            >
              No payments recorded yet
            </Text>
          ) : (
            paymentRows.map(({ payment, remaining }, idx) => {
              const modeStyle =
                PAYMENT_MODE_COLORS[payment.payment_mode] ??
                PAYMENT_MODE_COLORS["Cash"];
              return (
                <View key={payment.id}>
                  {idx > 0 && (
                    <View
                      style={{
                        height: 1,
                        backgroundColor: "#E5E7EB",
                        marginVertical: 8,
                      }}
                    />
                  )}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                    }}
                  >
                    {/* Date + mode */}
                    <View>
                      <Text
                        style={{
                          fontSize: 14,
                          color: "#1C1C1E",
                          fontWeight: "600",
                        }}
                      >
                        {formatDate(payment.payment_date)}
                      </Text>
                      <View
                        style={{
                          backgroundColor: modeStyle.bg,
                          borderRadius: 999,
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                          alignSelf: "flex-start",
                          marginTop: 4,
                        }}
                      >
                        <Text
                          style={{
                            color: modeStyle.text,
                            fontSize: 11,
                            fontWeight: "600",
                          }}
                        >
                          {payment.payment_mode}
                        </Text>
                      </View>
                    </View>

                    {/* Amount + remaining */}
                    <View style={{ alignItems: "flex-end" }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "700",
                          color: "#22C55E",
                        }}
                      >
                        +₹{fmt(payment.amount)}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: "#6B7280",
                          marginTop: 3,
                        }}
                      >
                        Remaining: ₹{fmt(remaining)}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* ───────────────────────────────────────── */}
      {/* 5. Fixed Action Bar                              */}
      {/* ───────────────────────────────────────── */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 16,
          flexDirection: "row",
          gap: 12,
        }}
      >
        {/* Send Bill button — always visible */}
        <TouchableOpacity
          onPress={handleSendBill}
          disabled={sendingBill}
          activeOpacity={0.8}
          style={[
            {
              flex: 1,
              height: 50,
              borderRadius: 12,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1.5,
              borderColor: "#22C55E",
              backgroundColor: "#FFFFFF",
              gap: 8,
            },
            sendingBill && { opacity: 0.5 },
          ]}
        >
          <MessageCircle size={18} color="#22C55E" strokeWidth={2} />
          <Text style={{ fontSize: 15, fontWeight: "600", color: "#22C55E" }}>
            {sendingBill ? "Generating…" : "Send Bill"}
          </Text>
        </TouchableOpacity>

        {/* Record Payment button — hidden when order is Paid */}
        {!isPaid && (
          <TouchableOpacity
            onPress={() => setPaymentModalVisible(true)}
            activeOpacity={0.85}
            style={{
              flex: 1,
              height: 50,
              borderRadius: 12,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#22C55E",
              gap: 8,
            }}
          >
            <Wallet size={18} color="#FFFFFF" strokeWidth={2} />
            <Text style={{ fontSize: 15, fontWeight: "600", color: "#FFFFFF" }}>
              Record Payment
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Record Payment Modal ──────────────────────────────── */}
      <RecordCustomerPaymentModal
        visible={paymentModalVisible}
        onClose={() => setPaymentModalVisible(false)}
        onSuccess={handlePaymentSuccess}
        orderId={orderId ?? ""}
        balanceDue={order.balance_due}
        customerId={order.customer_id}
        customerName={customerName}
      />
    </SafeAreaView>
  );
}
