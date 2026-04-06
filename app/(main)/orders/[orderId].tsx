import RecordCustomerPaymentModal from "@/src/components/customers/RecordCustomerPaymentModal";
import EmptyState from "@/src/components/feedback/EmptyState";
import Loader from "@/src/components/feedback/Loader";
import { useToast } from "@/src/components/feedback/Toast";
import { orderKeys, useOrderDetail } from "@/src/hooks/useOrders";

import { usePayments } from "@/src/hooks/usePayments";
import { useAuthStore } from "@/src/store/authStore";
import { generateBillPdf } from "@/src/utils/generateBillPdf";
import { daysSince, formatDate } from "@/src/utils/helper";
import { colors, spacing, typography } from "@/src/utils/theme";
import { useQueryClient } from "@tanstack/react-query";
import { Stack, useLocalSearchParams } from "expo-router";
import * as Sharing from "expo-sharing";
import { MessageCircle, Wallet } from "lucide-react-native";
import { useCallback, useMemo, useRef, useState } from "react";
import {
    Alert,
    Linking,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ── Design tokens — map status keys to the central theme chip tokens ──────
const STATUS_STYLES: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  Paid:           { bg: colors.paid.bg,    text: colors.paid.text,    label: "PAID" },
  "Partially Paid": { bg: colors.partial.bg, text: colors.partial.text, label: "PARTIAL" },
  Pending:        { bg: colors.pending.bg,  text: colors.pending.text,  label: "PENDING" },
  Overdue:        { bg: colors.overdue.bg,  text: colors.overdue.text,  label: "OVERDUE" },
};

const PAYMENT_MODE_COLORS: Record<string, { bg: string; text: string }> = {
  Cash:   { bg: colors.paid.bg,    text: colors.paid.text },
  UPI:    { bg: colors.partial.bg, text: colors.partial.text },
  NEFT:   { bg: colors.overdue.bg, text: colors.warning },
  Draft:  { bg: colors.pending.bg, text: colors.pending.text },
  Cheque: { bg: colors.successBg,  text: colors.primaryDark },
};

// ── Avatar helpers ──────────────────────────────────────────────────────
const AVATAR_COLORS = [
  colors.danger,
  colors.warning,
  colors.primary,
  ...colors.avatarPalette,
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
  shadowColor: colors.textPrimary,
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

  const paymentModalRef = useRef<any>(null);
  const [sendingBill, setSendingBill] = useState(false);
  const { show: showToast } = useToast();

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
          rate: i.price,
          price: i.price,
          amount: i.subtotal,
          variantName: i.variant_name,
        })),
        {
          name: profile?.business_name ?? profile?.name ?? "",
          address: profile?.business_address || undefined,
          phone: profile?.phone ?? "",
          gstin: profile?.gstin ?? "",
        },
        order.total_amount,
        customerName,
        {
          invoiceNumber: order.bill_number,
          date: formatDate(order.created_at),
          subtotal: itemsSubtotal,
          taxAmount,
          loadingCharge: order.loading_charge ?? 0,
          bankDetails:
            profile?.bank_name && profile?.account_number && profile?.ifsc_code
              ? {
                  bankName: profile.bank_name,
                  accountNo: profile.account_number,
                  ifsc: profile.ifsc_code,
                }
              : undefined,
        },
      );

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(pdfUri, {
          mimeType: "application/pdf",
          dialogTitle: `Bill ${order.bill_number}`,
          UTI: "com.adobe.pdf",
        });
        showToast({
          message: `Bill ${order.bill_number} shared`,
          type: "success",
        });
      } else {
        throw new Error("sharing-unavailable");
      }
    } catch (error: any) {
      // Fallback: pre-filled WhatsApp message
      const cleanPhone = customerPhone.replace(/\D/g, "");
      const msg = encodeURIComponent(
        `Hi ${customerName}, your bill *${order.bill_number}* of *₹${fmt(order.total_amount)}* is ready.` +
          (order.balance_due > 0
            ? ` Remaining balance: *₹${fmt(order.balance_due)}*. Please arrange payment at your earliest convenience.`
            : " The bill has been fully paid. Thank you!"),
      );
      const wa = `https://wa.me/91${cleanPhone}?text=${msg}`;
      showToast({
        message:
          error?.message === "sharing-unavailable"
            ? "Sharing unavailable, opened WhatsApp"
            : "Bill sent via WhatsApp",
        type: "success",
      });
      Linking.openURL(wa).catch(() => {
        showToast({
          message: "Cannot open WhatsApp",
          type: "error",
        });
        Alert.alert(
          "Cannot open WhatsApp",
          "Please install WhatsApp and try again.",
        );
      });
    } finally {
      setSendingBill(false);
    }
  }, [order, customerName, customerPhone, profile, showToast, itemsSubtotal, taxAmount]);

  // ── Payment success ─────────────────────────────────────────────
  const handlePaymentSuccess = useCallback(() => {
    paymentModalRef.current?.dismiss();
    if (profile?.id) {
      queryClient.invalidateQueries({ queryKey: orderKeys.all(profile.id) });
      queryClient.invalidateQueries({
        queryKey: orderKeys.detail(orderId ?? ""),
      });
      queryClient.invalidateQueries({ queryKey: ["payments", orderId] });
      if (order?.customer_id) {
        queryClient.invalidateQueries({
          queryKey: ["customerDetail", order.customer_id],
        });
      }
      queryClient.invalidateQueries({ queryKey: ["dashboard", profile.id] });
    }
    showToast({
      message: `Payment recorded for ${customerName}`,
      type: "success",
    });
  }, [orderId, order?.customer_id, profile?.id, queryClient, customerName, showToast]);

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
      className="flex-1 bg-background"
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
              backgroundColor: colors.surface,
              borderRadius: spacing.cardRadius,
              marginHorizontal: spacing.screenPadding,
              marginBottom: spacing.sm,
              padding: spacing.lg,
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
                style={{
                  color: colors.surface,
                  fontSize: 17,
                  fontWeight: "700",
                }}
              >
                {getInitials(customerName)}
              </Text>
            </View>

            {/* Name + phone */}
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  ...typography.cardTitle,
                  marginBottom: 2,
                }}
                numberOfLines={1}
              >
                {customerName}
              </Text>
              <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                +91 {customerPhone}
              </Text>
            </View>

            {/* Previous balance */}
            <View style={{ alignItems: "flex-end", marginLeft: 8 }}>
              <Text
                style={{
                  fontSize: 11,
                  color: colors.textSecondary,
                  marginBottom: 3,
                }}
              >
                Previous Balance
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "700",
                  color:
                    order.previous_balance > 0 ? colors.danger : colors.primary,
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
              backgroundColor: colors.surface,
              borderTopLeftRadius: spacing.cardRadius,
              borderTopRightRadius: spacing.cardRadius,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
              marginHorizontal: spacing.screenPadding,
            },
            SHADOW,
          ]}
        >
          <Text
            style={{
              ...typography.label,
              color: colors.textSecondary,
              padding: spacing.lg,
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
                    backgroundColor: colors.border,
                    marginHorizontal: spacing.lg,
                  }}
                />
              )}
              <View
                style={{
                  flexDirection: "row",
                  paddingHorizontal: spacing.lg,
                  paddingVertical: spacing.sm,
                  alignItems: "center",
                }}
              >
                {/* Product name */}
                <Text
                  style={{ flex: 1, fontSize: 15, color: colors.textPrimary }}
                  numberOfLines={1}
                >
                  {item.product_name}
                  {item.variant_name ? ` (${item.variant_name})` : ""}
                </Text>
                {/* qty × price */}
                <Text
                  style={{
                    fontSize: 13,
                    color: colors.textSecondary,
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
                    color: colors.textPrimary,
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
              backgroundColor: colors.surface,
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
              borderBottomLeftRadius: spacing.cardRadius,
              borderBottomRightRadius: spacing.cardRadius,
              marginHorizontal: spacing.screenPadding,
              marginBottom: spacing.sm,
              paddingHorizontal: spacing.lg,
              paddingTop: 4,
              paddingBottom: spacing.lg,
            },
            SHADOW,
          ]}
        >
          {/* Top divider separating items from summary */}
          <View
            style={{
              height: 1,
              backgroundColor: colors.border,
              marginBottom: spacing.sm,
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
            <Text style={{ fontSize: 14, color: colors.textSecondary }}>
              Subtotal
            </Text>
            <Text style={{ fontSize: 14, color: colors.textPrimary }}>
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
              <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                GST ({order.tax_percent}%)
              </Text>
              <Text style={{ fontSize: 14, color: colors.textPrimary }}>
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
              <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                Loading Charge
              </Text>
              <Text style={{ fontSize: 14, color: colors.textSecondary }}>
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
              <Text style={{ fontSize: 14, color: colors.danger }}>
                Previous Balance
              </Text>
              <Text style={{ fontSize: 14, color: colors.danger }}>
                ₹{fmt(order.previous_balance)}
              </Text>
            </View>
          )}

          {/* Divider before Grand Total */}
          <View
            style={{
              height: 1,
              backgroundColor: colors.border,
              marginVertical: spacing.sm,
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
            <Text style={{ ...typography.screenTitle }}>Grand Total</Text>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ ...typography.screenTitle }}>
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
              backgroundColor: colors.surface,
              borderRadius: spacing.cardRadius,
              marginHorizontal: spacing.screenPadding,
              marginBottom: spacing.sm,
              padding: spacing.lg,
            },
            SHADOW,
          ]}
        >
          <Text
            style={{
              ...typography.label,
              color: colors.textSecondary,
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
                color: colors.textSecondary,
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
                        backgroundColor: colors.border,
                        marginVertical: spacing.sm,
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
                          color: colors.textPrimary,
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
                          color: colors.primary,
                        }}
                      >
                        +₹{fmt(payment.amount)}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: colors.textSecondary,
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
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.sm,
          paddingBottom: spacing.lg,
          flexDirection: "row",
          gap: spacing.sm,
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
              height: spacing.buttonHeight,
              borderRadius: 12,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1.5,
              borderColor: colors.primary,
              backgroundColor: colors.surface,
              gap: spacing.sm,
            },
            sendingBill && { opacity: 0.5 },
          ]}
        >
          <MessageCircle size={18} color={colors.primary} strokeWidth={2} />
          <Text
            style={{ fontSize: 15, fontWeight: "600", color: colors.primary }}
          >
            {sendingBill ? "Generating…" : "Send Bill"}
          </Text>
        </TouchableOpacity>

        {/* Record Payment button — hidden when order is Paid */}
        {!isPaid && (
          <TouchableOpacity
          onPress={() => paymentModalRef.current?.present()}
            activeOpacity={0.85}
            style={{
              flex: 1,
              height: spacing.buttonHeight,
              borderRadius: 12,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.primary,
              gap: spacing.sm,
            }}
          >
            <Wallet size={18} color={colors.surface} strokeWidth={2} />
            <Text
              style={{ fontSize: 15, fontWeight: "600", color: colors.surface }}
            >
              Record Payment
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Record Payment Modal ──────────────────────────────── */}
      <RecordCustomerPaymentModal
        ref={paymentModalRef}
        onSuccess={handlePaymentSuccess}
        orderId={orderId ?? ""}
        balanceDue={order.balance_due}
        customerId={order.customer_id}
        customerName={customerName}
      />
    </SafeAreaView>
  );
}
