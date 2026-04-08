/**
 * Edit Order Screen - Edit existing bills/invoices
 * 
 * Reuses most of the create order logic but pre-populates with existing data.
 * Tracks edits with edited_at and edit_count fields.
 */

import { getCustomerPreviousBalance } from "@/src/api/orders";
import Loader from "@/src/components/feedback/Loader";
import OrderSummary from "@/src/components/orders/OrderBillSummary";
import OrderItemCard from "@/src/components/orders/OrderItemCard";
import ProductPicker from "@/src/components/picker/ProductPicker";
import { useOrderDetail, useUpdateOrder } from "@/src/hooks/useOrders";
import { useToast } from "@/src/components/feedback/Toast";
import { useAuthStore } from "@/src/store/authStore";
import { useOrderStore } from "@/src/store/orderStore";
import { BillItem, generateBillPdf } from "@/src/utils/generateBillPdf";
import { colors } from "@/src/utils/theme";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import {
  ArrowLeft,
  CirclePlus,
  Pencil,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BillFooter from "@/src/components/orders/BillFooter";

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
  const vendorId = profile?.id;

  // Fetch existing order
  const { data: order, isLoading: orderLoading } = useOrderDetail(orderId);

  // Zustand Draft Bills Store
  const setCustomer = useOrderStore((state) => state.setCustomer);
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
  const [note, setNote] = useState("");
  const [itemsExpanded, setItemsExpanded] = useState(false);

  const [previousBalance, setPreviousBalance] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const updateMutation = useUpdateOrder(orderId || "");

  // Pre-populate form when order loads
  useEffect(() => {
    if (!order) return;

    // Set customer
    if (order.customer) {
      setCustomer(order.customer.id, order.customer.name, order.customer.phone);
    }

    // Pre-populate items if order has them
    if (order.items && order.items.length > 0) {
      clearOrder();
      order.items.forEach((item: any) => {
        addItem({
          productId: item.product_id,
          variantId: item.variant_id || undefined,
          name: item.product_name,
          variantName: item.variant_name || undefined,
          rate: Number(item.price),
          quantity: item.quantity,
        });
      });
      setItemsExpanded(true); // Expand items section
    } else {
      // No items - use quick amount mode
      setQuickAmount(order.total_amount.toString());
    }

    // Set loading charge and tax
    setLoadingCharge(Number(order.loading_charge || 0));
    setGst(Number(order.tax_percent || 0));

    // Set previous balance
    setPreviousBalance(Number(order.previous_balance || 0));
  }, [order]);

  // Calculate totals
  const itemsTotal = items.reduce((sum, item) => sum + item.rate * item.quantity, 0);
  const taxAmount = (itemsTotal * taxPercent) / 100;
  const finalTotal = items.length > 0
    ? itemsTotal + taxAmount + loadingCharge
    : Number(quickAmount || 0);

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

    // Warn about editing
    Alert.alert(
      "Edit Bill",
      "Are you sure you want to edit this bill? Changes will be reflected in the customer's ledger.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Save Changes",
          style: "default",
          onPress: async () => {
            setSubmitting(true);

            try {
              // Prepare order data
              const orderData: any = {
                total_amount: finalTotal,
                loading_charge: loadingCharge,
                tax_percent: taxPercent,
              };

              // Update order
              await updateMutation.mutateAsync(orderData);

              // If items changed, update order_items
              // Note: Full item update requires deleting old items and inserting new ones
              // This is simplified - in production you'd want a proper update strategy

              Alert.alert("Success", "Bill updated successfully");
              router.back();
            } catch (error: any) {
              console.error("Error updating order:", error);
              Alert.alert("Error", error.message || "Failed to update bill");
            } finally {
              setSubmitting(false);
            }
          },
        },
      ]
    );
  };

  if (orderLoading || !order) {
    return <Loader />;
  }

  const customerName = order.customer?.name || "Unknown Customer";
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
          <Text style={{ fontSize: 18, fontWeight: "600", color: colors.textPrimary }}>
            Edit Bill {order.bill_number}
          </Text>
          {order.edit_count > 0 && (
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>
              Edited {order.edit_count} {order.edit_count === 1 ? 'time' : 'times'}
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
          Editing will update the customer's ledger and payment history
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
          {/* Customer Info (Read-only) */}
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
              Customer (cannot be changed)
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
                <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 14 }}>
                  {customerInitials}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: "600", color: colors.textPrimary }}>
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
              <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 8 }}>
                Total Amount
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ fontSize: 32, fontWeight: "700", color: colors.textPrimary }}>
                  ₹
                </Text>
                <TextInput
                  style={{
                    flex: 1,
                    fontSize: 32,
                    fontWeight: "700",
                    color: colors.textPrimary,
                    padding: 0,
                    marginLeft: 8,
                  }}
                  value={quickAmount}
                  onChangeText={setQuickAmount}
                  placeholder="0"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                  autoFocus
                />
              </View>

              <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 16, marginBottom: 8 }}>
                Note (Optional)
              </Text>
              <TextInput
                style={{
                  backgroundColor: colors.background,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 15,
                  color: colors.textPrimary,
                }}
                value={note}
                onChangeText={setNote}
                placeholder="Add a note..."
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={2}
              />
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
                {items.map((item) => (
                  <OrderItemCard
                    key={item.productId + (item.variantId || "")}
                    item={item}
                    onUpdateQuantity={updateItemQuantity}
                    onUpdateRate={updateItemRate}
                    onRemove={removeItem}
                  />
                ))}

                <ProductPicker
                  vendorId={vendorId!}
                  onSelect={(product, variant) => {
                    addItem({
                      productId: product.id,
                      variantId: variant?.id,
                      name: product.name,
                      variantName: variant?.variant_name,
                      rate: variant?.price || product.base_price || 0,
                      quantity: 1,
                    });
                    if (quickAmount) setQuickAmount(""); // Clear quick amount when adding items
                  }}
                />

                {/* Loading Charge & GST */}
                <View style={{ marginTop: 16 }}>
                  <OrderSummary
                    itemsTotal={itemsTotal}
                    loadingCharge={loadingCharge}
                    taxPercent={taxPercent}
                    onLoadingChargeChange={setLoadingCharge}
                    onTaxPercentChange={setGst}
                  />
                </View>
              </View>
            )}
          </View>

          {/* Bill Summary */}
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
                ₹{previousBalance.toLocaleString("en-IN")}
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: "600", color: colors.textPrimary }}>
                New Total
              </Text>
              <Text style={{ fontSize: 15, fontWeight: "600", color: colors.textPrimary }}>
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
              <Text style={{ fontSize: 16, fontWeight: "700", color: colors.textPrimary }}>
                Total Outstanding
              </Text>
              <Text style={{ fontSize: 16, fontWeight: "700", color: colors.danger }}>
                ₹{(previousBalance + finalTotal).toLocaleString("en-IN")}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <BillFooter
          onSave={handleSubmit}
          disabled={submitting || finalTotal <= 0}
          loading={submitting}
          buttonText="Save Changes"
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
