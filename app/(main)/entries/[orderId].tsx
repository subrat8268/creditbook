import EmptyState from "@/src/components/feedback/EmptyState";
import Loader from "@/src/components/feedback/Loader";
import { useToast } from "@/src/components/feedback/Toast";
import RecordCustomerPaymentModal from "@/src/components/people/RecordCustomerPaymentModal";
import StatusBadge from "@/src/components/dashboard/StatusBadge";
import Avatar from "@/src/components/ui/Avatar";
import Button from "@/src/components/ui/Button";
import Card from "@/src/components/ui/Card";
import MoneyAmount from "@/src/components/ui/MoneyAmount";
import { orderKeys, useOrderDetail } from "@/src/hooks/useEntries";

import { usePayments } from "@/src/hooks/usePayments";
import { useAuthStore } from "@/src/store/authStore";
import { supabase } from "@/src/services/supabase";
import { useTheme } from "@/src/utils/ThemeProvider";
import { generateBillPdf } from "@/src/utils/generateBillPdf";
import { formatDate } from "@/src/utils/helper";
import { formatINR } from "@/src/utils/format";
import { useQueryClient } from "@tanstack/react-query";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { MessageCircle, Pencil, Phone, Receipt, Share2, Wallet } from "lucide-react-native";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  Alert,
  ActivityIndicator,
  Linking,
  Share,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OrderDetailScreen() {
  const { colors, radius, spacing, typography } = useTheme();
  const PAYMENT_MODE_COLORS: Record<string, { bg: string; text: string }> = {
    Cash: { bg: colors.paid.bg, text: colors.paid.text },
    UPI: { bg: colors.partial.bg, text: colors.partial.text },
    NEFT: { bg: colors.overdue.bg, text: colors.warning },
    Draft: { bg: colors.pending.bg, text: colors.pending.text },
    Cheque: { bg: colors.successBg, text: colors.primaryDark },
  };

  const SHADOW = {
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  };

  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();
  const { profile } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: order, isLoading, isError } = useOrderDetail(orderId);
  const { payments, isLoading: paymentsLoading } = usePayments(
    orderId ?? "",
    profile?.id,
  );

  const paymentModalRef = useRef<any>(null);
  const [sendingEntry, setSendingEntry] = useState(false);
  const [sharingLedgerLink, setSharingLedgerLink] = useState(false);
  const [quickPaymentAmount, setQuickPaymentAmount] = useState<string>("");
  const { show: showToast } = useToast();

  // ── Derived values ───────────────────────────────────────────────
  const customerName = order?.customer?.name ?? "Unknown Person";
  const customerPhone = order?.customer?.phone ?? "";

  const dueDateValue =
    order && "due_date" in order && typeof order.due_date === "string"
      ? order.due_date
      : null;
  const isOverdue =
    !!order &&
    order.status !== "Paid" &&
    !!dueDateValue &&
    new Date(dueDateValue) < new Date(new Date().setHours(0, 0, 0, 0));
  const statusKey = isOverdue ? "Overdue" : (order?.status ?? "Pending");

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
  const paidAmount = Math.max(0, grandTotal - (order?.balance_due ?? 0));

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

  // Quick reminder handlers
  const handleCall = () => {
    if (customerPhone) Linking.openURL(`tel:${customerPhone}`);
  };
  
  const handleWhatsApp = () => {
    if (customerPhone) {
      const message = encodeURIComponent(
        `Hi ${customerName.split(" ")[0]}, this is a reminder about your outstanding entry #${order?.bill_number} of ${formatINR(order?.balance_due ?? 0)}. Please clear when convenient. - KredBook`
      );
      Linking.openURL(`whatsapp://send?phone=${customerPhone.replace(/\D/g, '')}&text=${message}`);
    }
  };

  const handleShareLedgerLink = useCallback(async () => {
    if (!order?.customer_id) return;

    setSharingLedgerLink(true);
    try {
      const { data, error } = await supabase.rpc("upsert_access_token", {
        p_party_id: order.customer_id,
      });
      if (error) throw error;

      const token = typeof data === "string" ? data : (data as { token?: string } | null)?.token;
      if (!token) throw new Error("Token generation failed");

      const url = `https://kredbook.app/l/${token}`;
      await Share.share({ message: `View your ledger: ${url}` });
    } catch {
      showToast({ message: "Could not create share link.", type: "error" });
    } finally {
      setSharingLedgerLink(false);
    }
  }, [order?.customer_id, showToast]);

  // ── Send Entry ──────────────────────────────────────────────────
  const handleSendEntry = useCallback(async () => {
    if (!order) return;
    setSendingEntry(true);
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
          dialogTitle: `Entry ${order.bill_number}`,
          UTI: "com.adobe.pdf",
        });
        showToast({
          message: `Entry ${order.bill_number} shared`,
          type: "success",
        });
      } else {
        throw new Error("sharing-unavailable");
      }
    } catch (error: any) {
      // Fallback: pre-filled WhatsApp message
      const cleanPhone = customerPhone.replace(/\D/g, "");
      const msg = encodeURIComponent(
        `Hi ${customerName}, your entry *${order.bill_number}* of *${formatINR(order.total_amount)}* is ready.` +
          (order.balance_due > 0
            ? ` Remaining balance: *${formatINR(order.balance_due)}*. Please arrange payment at your earliest convenience.`
            : " The entry has been fully paid. Thank you!"),
      );
      const wa = `https://wa.me/91${cleanPhone}?text=${msg}`;
      showToast({
        message:
          error?.message === "sharing-unavailable"
            ? "Sharing unavailable, opened WhatsApp"
            : "Entry sent via WhatsApp",
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
      setSendingEntry(false);
    }
  }, [
    order,
    customerName,
    customerPhone,
    profile,
    showToast,
    itemsSubtotal,
    taxAmount,
  ]);

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
  }, [
    orderId,
    order?.customer_id,
    profile?.id,
    queryClient,
    customerName,
    showToast,
  ]);

  const openPaymentFlow = (amountSeed?: number) => {
    if (!order || order.balance_due <= 0) {
      showToast({
        message: "No outstanding balance for this person.",
        type: "error",
      });
      return;
    }
    if (amountSeed && amountSeed > 0) {
      router.push({
        pathname: "/(main)/entries/create",
        params: {
          customer: JSON.stringify(order.customer),
          amount: String(amountSeed),
        },
      });
      return;
    }
    setQuickPaymentAmount("");
    paymentModalRef.current?.present();
  };

  // ── Loading / Error gates ─────────────────────────────────────────
  if (isLoading) return <Loader />;
  if (isError || !order)
    return (
      <EmptyState
        title="Entry not found"
        description="This entry could not be loaded."
      />
    );

  const isPaid = order.status === "Paid";

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-background dark:bg-background-dark">
      <Stack.Screen options={{ headerShown: false }} />

      {/* ── Custom header ─────────────────────────── */}
      <View
        style={{
          paddingHorizontal: spacing.screenPadding,
          paddingTop: spacing.sm,
          paddingBottom: spacing.xs,
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={{ fontSize: 18, color: colors.textPrimary }}>←</Text>
        </TouchableOpacity>
        <Text style={{ ...typography.cardTitle }} numberOfLines={1}>
          Entry #{order.bill_number}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          {!isPaid && (
            <>
              <TouchableOpacity
                onPress={() => {
                  router.push(`/(main)/entries/${order.id}/edit` as never);
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Pencil size={20} color={colors.textSecondary} strokeWidth={2} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleShareLedgerLink}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                disabled={sharingLedgerLink}
              >
                {sharingLedgerLink ? (
                  <ActivityIndicator size="small" color={colors.textSecondary} />
                ) : (
                  <Share2 size={20} color={colors.textSecondary} strokeWidth={2} />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSendEntry}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MessageCircle
                  size={20}
                  color={colors.textSecondary}
                  strokeWidth={2}
                />
              </TouchableOpacity>
            </>
          )}

          {/* Quick Remind buttons (show only when not paid and has phone) */}
          {!isPaid && customerPhone && (
            <>
              <TouchableOpacity
                onPress={handleCall}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Phone size={20} color={colors.primary} strokeWidth={2} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleWhatsApp}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MessageCircle size={20} color={colors.success} strokeWidth={2} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: spacing.md, paddingBottom: 140 }}
      >
        <View
          style={[
            {
              backgroundColor: colors.surface,
              borderRadius: spacing.cardRadius,
              marginHorizontal: spacing.screenPadding,
              marginBottom: spacing.sm,
              padding: spacing.lg,
              borderWidth: 1,
              borderColor: colors.border,
            },
            SHADOW,
          ]}
        >
          <Text style={typography.caption}>Balance due</Text>
          <MoneyAmount
            value={order.balance_due}
            variant="hero"
            color={order.balance_due > 0 ? colors.danger : colors.textPrimary}
            style={{ marginTop: spacing.xs }}
          />
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: spacing.sm, gap: spacing.sm }}>
            <StatusBadge status={statusKey as "Paid" | "Pending" | "Overdue" | "Partially Paid"} />
            <Text style={typography.caption}>
              {formatDate(order.created_at)} · Entry #{order.bill_number}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: spacing.sm, marginHorizontal: spacing.screenPadding, marginBottom: spacing.sm }}>
          <View style={{ flex: 1 }}>
            <Card
              title="Total"
              value={formatINR(grandTotal)}
              icon={<Receipt size={18} color={colors.textPrimary} strokeWidth={2} />}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Card
              title="Paid"
              value={formatINR(paidAmount)}
              icon={<Wallet size={18} color={colors.success} strokeWidth={2} />}
            />
          </View>
        </View>

        {/* ───────────────────────────────────────── */}
        {/* 2. Person Card */}
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
            <View style={{ marginRight: spacing.md, flexShrink: 0 }}>
              <Avatar name={customerName} size="md" />
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  ...typography.cardTitle,
                  marginBottom: spacing.xs,
                }}
                numberOfLines={1}
              >
                {customerName}
              </Text>
              <Text style={typography.small}>
                +91 {customerPhone}
              </Text>
            </View>

            <View style={{ alignItems: "flex-end", marginLeft: 8 }}>
              <Text
                style={{
                  ...typography.caption,
                  marginBottom: spacing.xs,
                }}
              >
                Previous Balance
              </Text>
              <MoneyAmount
                value={order.previous_balance}
                color={
                  order.previous_balance > 0 ? colors.danger : colors.textPrimary
                }
                style={{ ...typography.cardTitle, fontWeight: "700" }}
              />
            </View>
          </View>
        </View>

        {/* ───────────────────────────────────────── */}
        {/* 2. Entry Items                                  */}
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
                {/* Item name */}
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
        {/* 3. Entry Summary (flush below items card)        */}
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
              paddingVertical: spacing.xs,
            }}
          >
            <Text style={typography.subtitle}>
              Subtotal
            </Text>
            <MoneyAmount
              value={itemsSubtotal}
              style={[typography.subtitle, { color: colors.textPrimary }]}
            />
          </View>

          {/* GST row — only if tax_percent > 0 */}
          {order.tax_percent > 0 && (
             <View
               style={{
                 flexDirection: "row",
                 justifyContent: "space-between",
                 paddingVertical: spacing.xs,
               }}
             >
               <Text style={typography.subtitle}>
                 GST ({order.tax_percent}%)
               </Text>
               <MoneyAmount
                 value={taxAmount}
                 style={[typography.subtitle, { color: colors.textPrimary }]}
               />
             </View>
           )}

          {/* Loading Charge row — only if > 0 */}
          {order.loading_charge > 0 && (
             <View
               style={{
                 flexDirection: "row",
                 justifyContent: "space-between",
                 paddingVertical: spacing.xs,
               }}
             >
               <Text style={typography.subtitle}>
                 Loading Charge
               </Text>
               <MoneyAmount
                 value={order.loading_charge}
                 style={typography.subtitle}
               />
             </View>
           )}

          {/* Previous balance row — only if > 0 */}
          {order.previous_balance > 0 && (
             <View
               style={{
                 flexDirection: "row",
                 justifyContent: "space-between",
                 paddingVertical: spacing.xs,
               }}
             >
               <Text style={[typography.subtitle, { color: colors.danger }]}>
                 Previous Balance
               </Text>
               <MoneyAmount
                 value={order.previous_balance}
                 color={colors.danger}
                 style={typography.subtitle}
               />
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
              <MoneyAmount value={grandTotal} variant="title" />
              <View style={{ marginTop: spacing.xs }}>
                <StatusBadge status={statusKey as "Paid" | "Pending" | "Overdue" | "Partially Paid"} />
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
          <View style={{ marginBottom: spacing.md }}>
            <Text style={typography.sectionTitle}>Payments</Text>
            <Text style={[typography.caption, { marginTop: spacing.xs }]}>Paid {fmt(paidAmount)} of {fmt(grandTotal)}</Text>
          </View>

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
                <View
                  key={payment.id}
                  style={{
                    backgroundColor: colors.surfaceAlt,
                    borderRadius: radius.lg,
                    padding: spacing.md,
                    borderWidth: 1,
                    borderColor: colors.border,
                    marginBottom: idx === paymentRows.length - 1 ? 0 : spacing.sm,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                    }}
                    >
                      <View>
                        <Text style={typography.cardTitle}>
                          {formatDate(payment.payment_date)}
                        </Text>
                        <View
                          style={{
                            backgroundColor: modeStyle.bg,
                            borderRadius: radius.full,
                            paddingHorizontal: spacing.chipPadding,
                            paddingVertical: spacing.xs,
                            alignSelf: "flex-start",
                            marginTop: spacing.xs,
                          }}
                        >
                          <Text
                            style={{
                              ...typography.caption,
                              color: modeStyle.text,
                              fontSize: 11,
                              fontWeight: "600",
                            }}
                          >
                          {payment.payment_mode}
                        </Text>
                      </View>
                    </View>

                    <View style={{ alignItems: "flex-end" }}>
                      <MoneyAmount
                        value={payment.amount}
                        showPlusForPositive
                        variant="title"
                        color={colors.success}
                        style={{ fontWeight: "800" }}
                      />
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginTop: spacing.xs,
                        }}
                      >
                        <Text style={typography.caption}>Due: </Text>
                        <MoneyAmount value={remaining} variant="caption" color={remaining > 0 ? colors.danger : colors.success} />
                      </View>
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
        <View style={{ flex: 1 }}>
          <Button
            title={sendingEntry ? "Generating…" : "Send Entry"}
            variant="outline"
            onPress={handleSendEntry}
            loading={sendingEntry}
            icon={<MessageCircle size={18} color={colors.primary} strokeWidth={2} />}
          />
        </View>

        {!isPaid && (
          <View style={{ flex: 1 }}>
            <Button
              title="Record Payment"
              onPress={() => openPaymentFlow()}
              icon={<Wallet size={18} color={colors.surface} strokeWidth={2} />}
            />
          </View>
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
        initialAmount={
          quickPaymentAmount ? Number(quickPaymentAmount) : undefined
        }
      />
    </SafeAreaView>
  );
}
