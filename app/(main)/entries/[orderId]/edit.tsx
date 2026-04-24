import Loader from "@/src/components/feedback/Loader";
import { useToast } from "@/src/components/feedback/Toast";
import BillFooter from "@/src/components/orders/BillFooter";
import OrderSummary from "@/src/components/orders/OrderSummary";
import OrderItemCard from "@/src/components/orders/OrderItemCard";
import Input from "@/src/components/ui/Input";
import { useOrderDetail, useUpdateOrder } from "@/src/hooks/useEntries";
import { useAuthStore } from "@/src/store/authStore";
import { useOrderStore, DraftOrderItem } from "@/src/store/orderStore";
import { generateBillPdf } from "@/src/utils/generateBillPdf";
import { colors } from "@/src/utils/theme";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import {
  AlertCircle,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Pencil,
} from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const AVATAR_COLORS = [
  colors.danger,
  colors.warning,
  colors.primary,
  ...colors.avatarPalette,
];

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function EditOrderScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();
  const { profile, isFetchingProfile } = useAuthStore();
  const { show: showToast } = useToast();
  const vendorId = profile?.id;

  // Fetch existing order
  const { data: order, isLoading: orderLoading } = useOrderDetail(orderId);

  // Zustand Draft Entry Store
  const setCustomer = useOrderStore((state) => state.setCustomer);
  const setItems = useOrderStore((state) => state.setItems);
  const items = useOrderStore((state) => state.items);
  const loadingCharge = useOrderStore((state) => state.loadingCharge);
  const taxPercent = useOrderStore((state) => state.gstPercent);

  const addItem = useOrderStore((state) => state.addItem);
  const removeItem = useOrderStore((state) => state.removeItem);
  const updateItemQuantity = useOrderStore((state) => state.updateItemQuantity);
  const updateItemRate = useOrderStore((state) => state.updateItemRate);
  const setLoadingCharge = useOrderStore((state) => state.setLoadingCharge);
  const setGst = useOrderStore((state) => state.setGst);
  const clearOrder = useOrderStore((state) => state.clearOrder);

  // Quick entry mode (amount-first)
  const [quickAmount, setQuickAmount] = useState("");
  const [itemsExpanded, setItemsExpanded] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const updateMutation = useUpdateOrder(vendorId || "");

  // Pre-populate form when order loads
  useEffect(() => {
    if (!order) return;

    if (order.customer) {
      setCustomer(order.customer.id);
    }

    if (order.items && order.items.length > 0) {
      const mapped = order.items.map((item: DraftOrderItem) => ({
        id: `order-${item.id}`,
        product_id: item.product_id ?? null,
        product_name: item.product_name,
        variant_id: item.variant_id ?? null,
        variant_name: item.variant_name ?? null,
        price: Number(item.price),
        quantity: Number(item.quantity),
      }));
      setItems(mapped);
      setItemsExpanded(true);
      setQuickAmount("");
    } else {
      clearOrder();
      setQuickAmount(order.total_amount.toString());
    }

    setLoadingCharge(Number(order.loading_charge || 0));
    setGst(Number(order.tax_percent || 0));
  }, [order, setCustomer, setItems, clearOrder, setLoadingCharge, setGst]);

  // Calculate totals
  const itemsTotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );
  const taxAmount = useMemo(
    () => (itemsTotal * taxPercent) / 100,
    [itemsTotal, taxPercent],
  );
  const finalTotal = useMemo(
    () =>
      items.length > 0
        ? itemsTotal + taxAmount + loadingCharge
        : Number(quickAmount || 0),
    [items, itemsTotal, taxAmount, loadingCharge, quickAmount],
  );

  const handleSubmit = async () => {
    if (!vendorId || !order) return;

    // Validation
    if (items.length === 0 && !quickAmount) {
      Alert.alert("Error", "Please enter an amount or add items");
      return;
    }

    if (finalTotal <= 0) {
      Alert.alert("Error", "Total amount must be greater than zero");
      return;
    }

    if (order.amount_paid > finalTotal) {
      Alert.alert(
        "Amount too low",
        "Total cannot be less than the amount already paid for this entry.",
      );
      return;
    }

    const buildItemsPayload = () =>
      items.map((item) => ({
        product_id: item.product_id,
        product_name: item.product_name,
        variant_id: item.variant_id ?? null,
        variant_name: item.variant_name ?? null,
        price: item.price,
        quantity: item.quantity,
      }));

    const shareUpdatedBill = async (updatedOrder: any) => {
      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) throw new Error("sharing-unavailable");

      const pdfItems = (updatedOrder.items ?? []).map((item: any) => ({
        name: item.product_name,
        quantity: item.quantity,
        rate: item.price,
        amount: item.subtotal,
      }));

      const subtotal = (updatedOrder.items ?? []).reduce(
        (sum: number, item: any) => sum + item.subtotal,
        0,
      );
      const taxAmount = updatedOrder.tax_percent
        ? Math.round(((subtotal * updatedOrder.tax_percent) / 100) * 100) / 100
        : 0;

      const pdfUri = await generateBillPdf(
        pdfItems,
        {
          name: profile?.business_name ?? profile?.name ?? "",
          address: profile?.business_address || undefined,
          phone: profile?.phone ?? "",
          gstin: profile?.gstin ?? "",
        },
        updatedOrder.total_amount,
        updatedOrder.customer?.name ?? "Person",
        {
          invoiceNumber: updatedOrder.bill_number,
          date: new Date(updatedOrder.created_at).toLocaleDateString("en-IN"),
          subtotal,
          taxAmount,
          loadingCharge: updatedOrder.loading_charge ?? 0,
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

      await Sharing.shareAsync(pdfUri, {
        mimeType: "application/pdf",
        dialogTitle: `Entry ${updatedOrder.bill_number}`,
        UTI: "com.adobe.pdf",
      });
    };

    const performSave = async (shouldShare: boolean) => {
      setSubmitting(true);
      try {
        const updatedOrder = await updateMutation.mutateAsync({
          orderId: order.id,
          items: buildItemsPayload(),
          loadingCharge,
          taxPercent,
          quickAmount: Number(quickAmount || 0),
          customerId: order.customer?.id ?? null,
        });

        if (shouldShare) {
          try {
            await shareUpdatedBill(updatedOrder);
          } catch (shareError) {
            console.error("Share failed:", shareError);
            showToast({
              message: "Updated entry saved. Sharing failed.",
              type: "error",
            });
          }
        }

        showToast({ message: "Entry updated", type: "success" });
        router.back();
      } catch (error: any) {
        console.error("Error updating order:", error);
        Alert.alert("Error", error.message || "Failed to update entry");
      } finally {
        setSubmitting(false);
      }
    };

    // Warn about editing
    Alert.alert(
      "Edit Entry",
      "Are you sure you want to edit this entry? Changes will be reflected in the person's ledger.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Save Only",
          style: "default",
          onPress: () => performSave(false),
        },
        {
          text: "Save & Share PDF",
          style: "default",
          onPress: () => performSave(true),
        },
      ],
    );
  };

  if (isFetchingProfile || orderLoading || !order) {
    return <Loader />;
  }

  const customerName = order.customer?.name || "Unknown Person";
  const customerInitials = getInitials(customerName);
  const avatarColor = getAvatarColor(customerName);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 16 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: colors.textPrimary,
            }}
          >
            Edit Entry {order.bill_number}
          </Text>
          {(order.edit_count ?? 0) > 0 && (
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>
              Edited {order.edit_count}{" "}
              {order.edit_count === 1 ? "time" : "times"}
            </Text>
          )}
        </View>
      </View>

      {/* Warning Banner */}
      <View
        style={{
          backgroundColor: colors.warningBg,
          borderLeftWidth: 4,
          borderLeftColor: colors.warning,
          padding: 12,
          marginBottom: 8,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <AlertCircle size={20} color={colors.warning} />
        <Text
          style={{
            flex: 1,
            marginLeft: 8,
            fontSize: 13,
            color: colors.textPrimary,
          }}
        >
          Editing will update the person’s ledger and payment history
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Person Info (Read-only) */}
          <View
            style={{
              backgroundColor: colors.surface,
              padding: 16,
              marginBottom: 8,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: colors.textSecondary,
                marginBottom: 8,
              }}
            >
              Person (cannot be changed)
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: avatarColor,
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 12,
                }}
              >
                <Text
                  style={{ color: "#FFF", fontWeight: "700", fontSize: 14 }}
                >
                  {customerInitials}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: colors.textPrimary,
                  }}
                >
                  {customerName}
                </Text>
                <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                  {order.customer?.phone || "No phone"}
                </Text>
              </View>
            </View>
          </View>

          {/* Quick Amount Entry */}
          {items.length === 0 && (
            <View
              style={{
                backgroundColor: colors.surface,
                padding: 16,
                marginBottom: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: colors.textSecondary,
                  marginBottom: 8,
                }}
              >
                Total Amount
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text
                  style={{
                    fontSize: 32,
                    fontWeight: "700",
                    color: colors.textPrimary,
                  }}
                >
                  ₹
                </Text>
                <Input
                  placeholder="0"
                  value={quickAmount}
                  onChangeText={setQuickAmount}
                  keyboardType="numeric"
                  autoFocus
                  variant="white"
                  containerStyle={styles.quickAmountInputContainer}
                  inputStyle={styles.quickAmountInput}
                />
              </View>
            </View>
          )}

          {/* Items Section */}
          <View style={{ backgroundColor: colors.surface, marginBottom: 8 }}>
            <TouchableOpacity
              onPress={() => setItemsExpanded(!itemsExpanded)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 16,
                borderBottomWidth: itemsExpanded ? 1 : 0,
                borderBottomColor: colors.border,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Pencil size={18} color={colors.primary} />
                <Text
                  style={{
                    marginLeft: 8,
                    fontSize: 15,
                    fontWeight: "600",
                    color: colors.textPrimary,
                  }}
                >
                  Itemized Details {items.length > 0 && `(${items.length})`}
                </Text>
              </View>
              {itemsExpanded ? (
                <ChevronUp size={20} color={colors.textSecondary} />
              ) : (
                <ChevronDown size={20} color={colors.textSecondary} />
              )}
            </TouchableOpacity>

            {itemsExpanded && (
              <View style={{ padding: 16 }}>
                {items.map((item, idx) => (
                  <View key={item.id}>
                    {idx > 0 && (
                      <View
                        style={{
                          height: 1,
                          backgroundColor: colors.border,
                          marginVertical: 8,
                        }}
                      />
                    )}
                    <OrderItemCard
                      id={item.id}
                      name={item.product_name}
                      variantName={item.variant_name ?? undefined}
                      rate={item.price}
                      quantity={item.quantity}
                      onUpdateQuantity={(qty) =>
                        updateItemQuantity(item.id, qty)
                      }
                      onUpdateRate={(rate) => updateItemRate(item.id, rate)}
                      onRemove={() => removeItem(item.id)}
                    />
                  </View>
                ))}

                {/* Loading Charge & GST */}
                <View style={{ marginTop: 16 }}>
                  <OrderSummary
                    itemsTotal={itemsTotal}
                    loadingCharge={loadingCharge}
                    taxPercent={taxPercent}
                    taxAmount={taxAmount}
                    previousBalance={order.previous_balance || 0}
                    grandTotal={finalTotal + (order.previous_balance || 0)}
                    onLoadingChargeChange={setLoadingCharge}
                    onTaxChange={setGst}
                  />
                </View>
              </View>
            )}
          </View>

          {/* Entry Summary */}
          <View
            style={{
              backgroundColor: colors.surface,
              padding: 16,
              marginBottom: 8,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                Previous Balance
              </Text>
              <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                ₹{Number(order.previous_balance || 0).toLocaleString("en-IN")}
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "600",
                  color: colors.textPrimary,
                }}
              >
                New Total
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "600",
                  color: colors.textPrimary,
                }}
              >
                ₹{finalTotal.toLocaleString("en-IN")}
              </Text>
            </View>

            <View
              style={{
                borderTopWidth: 1,
                borderTopColor: colors.border,
                paddingTop: 8,
                marginTop: 8,
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: colors.textPrimary,
                }}
              >
                Total Outstanding
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: colors.danger,
                }}
              >
                ₹
                {(
                  Number(order.previous_balance || 0) + finalTotal
                ).toLocaleString("en-IN")}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <BillFooter
          isLoading={submitting}
          onSaveAndShare={handleSubmit}
          shareLabel="Save"
          disabled={submitting || finalTotal <= 0}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  quickAmountInputContainer: {
    borderWidth: 0,
    backgroundColor: "transparent",
    paddingHorizontal: 0,
    marginLeft: 8,
  },
  quickAmountInput: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.textPrimary,
  },
});
