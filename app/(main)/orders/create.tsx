import { getCustomerPreviousBalance, recordPayment } from "@/src/api/orders";
import { fetchPersonDetail } from "@/src/api/people";
import Loader from "@/src/components/feedback/Loader";
import { useToast } from "@/src/components/feedback/Toast";
import BillFooter from "@/src/components/orders/BillFooter";
import CustomerPicker from "@/src/components/picker/CustomerPicker";
import { useNetworkSync } from "@/src/hooks/useNetworkSync";
import { useCreateOrder } from "@/src/hooks/useOrders";
import { useAuthStore } from "@/src/store/authStore";
import { useOrderStore } from "@/src/store/orderStore";
import { BillItem, generateBillPdf } from "@/src/utils/generateBillPdf";
import { colors } from "@/src/utils/theme";
import { useQueryClient } from "@tanstack/react-query";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { ArrowLeft, Pencil } from "lucide-react-native";
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

export default function CreateOrderScreen() {
  const {
    customer: customerParams,
    amount: amountParam,
    next: nextParam,
  } = useLocalSearchParams<{
    customer?: string;
    amount?: string;
    next?: string;
  }>();

  const { profile, isFetchingProfile } = useAuthStore();
  const vendorId = profile?.id;
  const router = useRouter();
  const queryClient = useQueryClient();

  // Zustand Draft Entry Store
  const setCustomer = useOrderStore((state) => state.setCustomer);
  const selectedCustomerId = useOrderStore((state) => state.selectedCustomerId);
  const clearOrder = useOrderStore((state) => state.clearOrder);

  // Local ephemeral layout/picker states
  const [selectedCustomerMeta, setSelectedCustomerMeta] = useState<any>(
    customerParams ? JSON.parse(customerParams) : null,
  );
  const [previousBalance, setPreviousBalance] = useState<number>(0);
  const [isFetchingBalance, setIsFetchingBalance] = useState(false);

  // Phase 1: quick entry states (amount-first)
  const [quickAmount, setQuickAmount] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [entryType, setEntryType] = useState<"bill" | "payment">("bill");

  const fetchPreviousBalance = useCallback(
    async (customerId: string) => {
      if (!vendorId) return;
      try {
        setIsFetchingBalance(true);
        const balance = await getCustomerPreviousBalance(customerId, vendorId);
        setPreviousBalance(balance);
      } catch {
        setPreviousBalance(0);
      } finally {
        setIsFetchingBalance(false);
      }
    },
    [vendorId],
  );

  // Initialize store if we were routed here with a preselected customer
  useEffect(() => {
    if (customerParams) {
      const parsed = JSON.parse(customerParams);
      setCustomer(parsed.id);
      setSelectedCustomerMeta(parsed);
      fetchPreviousBalance(parsed.id);
    }
    if (amountParam && !Number.isNaN(Number(amountParam))) {
      setEntryType("payment");
      setQuickAmount(String(amountParam));
    }
  }, [customerParams, amountParam, setCustomer, fetchPreviousBalance]);

  const handleSelectPerson = useCallback(
    async (person: any) => {
      setCustomer(person?.id || null);
      setSelectedCustomerMeta(person);
      if (person) {
        fetchPreviousBalance(person.id);
      }
    },
    [setCustomer, fetchPreviousBalance],
  );

  const { show: showToast } = useToast();
  const createOrderMutation = useCreateOrder(vendorId!);
  const { queueLength } = useNetworkSync();

  // Calculate effective total (amount-first flow only)
  const entryAmount = parseFloat(quickAmount) || 0;
  const totalWithBalance = entryAmount + previousBalance;

  const handleSaveAndShare = async () => {
    // Validation
    if (!selectedCustomerId) {
      return Alert.alert("Error", "Please select a person");
    }

    if (entryType === "payment") {
      if (!quickAmount.trim() || parseFloat(quickAmount) <= 0) {
        return Alert.alert("Error", "Please enter a payment amount");
      }
      return handleRecordPayment();
    }

    // Either quick amount OR items must be provided
    if (!hasItems && !quickAmount.trim()) {
      return Alert.alert("Error", "Please enter an amount or add items");
    }

    await performSave();
  };

  const performSave = async () => {
    try {
      // If using quick amount (no items), create a generic entry item
      const orderItems = hasItems
        ? items.map((c) => ({
            product_id: c.product_id,
            product_name: c.product_name,
            price: c.price,
            quantity: c.quantity,
          }))
        : [
            {
              product_id: null,
              product_name: note.trim() || "Entry Amount",
              price: parseFloat(quickAmount) || 0,
              quantity: 1,
            },
          ];

      const savedOrder = await createOrderMutation.mutateAsync({
        customerId: selectedCustomerId!,
        vendorId: vendorId!,
        items: orderItems,
        amountPaid: 0,
        loadingCharge: hasItems ? loadingCharge : 0,
        taxPercent: hasItems ? taxPercent : 0,
        billNumberPrefix: profile?.bill_number_prefix || "INV",
      });

      // Generate Native Shareable PDF
      const pdfItems: BillItem[] = hasItems
        ? items.map((c) => ({
            name: c.product_name,
            quantity: c.quantity,
            rate: c.price,
            amount: c.price * c.quantity,
          }))
        : [
            {
              name: note.trim() || "Entry Amount",
              quantity: 1,
              rate: parseFloat(quickAmount) || 0,
              amount: parseFloat(quickAmount) || 0,
            },
          ];

      const businessDetails = {
        name: profile?.business_name || "Your Store",
        address: profile?.business_address || "",
        phone: profile?.phone || "",
        gstin: profile?.gstin || "",
      };

      const billMeta = {
        invoiceNumber: savedOrder.bill_number,
        date: new Date(savedOrder.created_at ?? Date.now()).toLocaleDateString(
          "en-IN",
        ),
        subtotal: hasItems ? getSubtotal() : parseFloat(quickAmount) || 0,
        taxAmount: hasItems ? getTaxAmount() : 0,
        loadingCharge: hasItems ? loadingCharge : 0,
        bankDetails:
          profile?.bank_name && profile?.account_number && profile?.ifsc_code
            ? {
                bankName: profile.bank_name,
                accountNo: profile.account_number,
                ifsc: profile.ifsc_code,
              }
            : undefined,
      };

      const localPdfPath = await generateBillPdf(
        pdfItems,
        businessDetails,
        entryAmount,
        selectedCustomerMeta?.name || "Person",
        billMeta,
      );

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(localPdfPath, { mimeType: "application/pdf" });
      }

      // Cleanup Draft on success and pop
      clearOrder();
      setQuickAmount("");
      setNote("");
      showToast({
        message: `Entry shared with ${selectedCustomerMeta?.name ?? "person"}`,
        type: "success",
      });
      if (nextParam === "share" && selectedCustomerMeta) {
        router.replace({
          pathname: "/customers/[customerId]",
          params: { customerId: selectedCustomerMeta.id, focus: "share" },
        });
      } else {
        router.back();
      }
    } catch (err: any) {
      console.error("Save & Share failed:", err.message);
      const errorMessage = err.message || "Failed to save and share entry";
      showToast({ message: errorMessage, type: "error" });
      Alert.alert("Error", errorMessage);
    }
  };

  const invoiceRef = `${profile?.bill_number_prefix || "INV"}-NEW`;

  const handleRecordPayment = async () => {
    if (!selectedCustomerId || !profile?.id) return;

    const paymentAmount = parseFloat(quickAmount) || 0;
    try {
      setIsFetchingBalance(true);
      const detail = await fetchPersonDetail(selectedCustomerId);
      if (!detail?.pendingOrderId || (detail.pendingOrderBalance ?? 0) <= 0) {
        Alert.alert(
          "Up to date",
          `${detail?.name ?? selectedCustomerMeta?.name ?? "This person"} has no pending entries to pay.`,
        );
        return;
      }
      if (paymentAmount > (detail.pendingOrderBalance ?? 0)) {
        Alert.alert(
          "Amount too high",
          `Payment exceeds the pending balance of ₹${(detail.pendingOrderBalance ?? 0).toLocaleString("en-IN")}.`,
        );
        return;
      }
      await recordPayment(
        detail.pendingOrderId,
        profile.id,
        paymentAmount,
        "Cash",
        false,
        note.trim() || undefined,
      );
      // Ensure lists refresh after recording a payment.
      queryClient.invalidateQueries({ queryKey: ["orders", profile.id] });
      queryClient.invalidateQueries({ queryKey: ["customers", profile.id] });
      queryClient.invalidateQueries({
        queryKey: ["customerDetail", selectedCustomerId],
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard", profile.id] });
      clearOrder();
      setQuickAmount("");
      setNote("");
      showToast({
        message: `Payment recorded for ${detail.name}`,
        type: "success",
      });
      router.back();
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to record payment");
    } finally {
      setIsFetchingBalance(false);
    }
  };

  if (isFetchingProfile || !profile) return <Loader />;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView className="flex-1 bg-background">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          {/* Header */}
          <View className="flex-row items-center px-4 py-3 bg-surface border-b border-border">
            <TouchableOpacity
              onPress={() => router.back()}
              className="mr-3 p-1"
            >
              <ArrowLeft
                size={22}
                color={colors.textPrimary}
                strokeWidth={2.2}
              />
            </TouchableOpacity>
            <Text className="flex-1 text-[18px] font-bold text-textPrimary">
              Add Entry
            </Text>
            <View className="px-3 py-1 rounded-full border border-primary bg-primaryLight">
              <Text className="text-[13px] font-bold text-primary">
                {entryType === "payment" ? "PAYMENT" : invoiceRef}
              </Text>
            </View>
          </View>

          {/* Scrollable Content */}
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ padding: 16, paddingBottom: 120, gap: 12 }}
            showsVerticalScrollIndicator={false}
          >
            <View className="flex-row items-center justify-between mt-1">
              <Text className="text-[11px] font-bold text-textSecondary tracking-widest">
                ENTRY TYPE
              </Text>
              <View className="flex-row items-center rounded-full border border-border overflow-hidden">
                <TouchableOpacity
                  onPress={() => {
                    setEntryType("bill");
                    // Keep the amount-first input responsive when switching modes.
                    setIsItemsExpanded(false);
                  }}
                  activeOpacity={0.8}
                  className={`px-4 py-1.5 ${entryType === "bill" ? "bg-primary" : "bg-surface"}`}
                >
                  <Text
                    className={`text-[12px] font-bold ${entryType === "bill" ? "text-surface" : "text-textSecondary"}`}
                  >
                    Entry
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setEntryType("payment");
                    // Collapse items for payment entries.
                    setIsItemsExpanded(false);
                  }}
                  activeOpacity={0.8}
                  className={`px-4 py-1.5 ${entryType === "payment" ? "bg-primary" : "bg-surface"}`}
                >
                  <Text
                    className={`text-[12px] font-bold ${entryType === "payment" ? "text-surface" : "text-textSecondary"}`}
                  >
                    Payment
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Person picker (inline, amount-first flow) */}
            <View className="rounded-2xl overflow-hidden bg-surface border border-border">
              <View className="flex-row items-center px-4 py-4 border-b border-border">
                <View
                  className="rounded-full items-center justify-center mr-3 w-[52px] h-[52px]"
                  style={{
                    backgroundColor: selectedCustomerMeta
                      ? getAvatarColor(selectedCustomerMeta.name)
                      : colors.border,
                  }}
                >
                  <Text className="font-bold text-surface text-[17px]">
                    {selectedCustomerMeta
                      ? getInitials(selectedCustomerMeta.name)
                      : "?"}
                  </Text>
                </View>

                <View className="flex-1">
                  <Text
                    className="text-[17px] font-bold text-textPrimary"
                    numberOfLines={1}
                  >
                    {selectedCustomerMeta
                      ? selectedCustomerMeta.name
                      : "Select Person"}
                  </Text>
                  {!selectedCustomerMeta && (
                    <Text className="text-[14px] text-textSecondary mt-0.5">
                      Choose from your people list below
                    </Text>
                  )}
                </View>

                <Pencil size={18} color={colors.primary} strokeWidth={2} />
              </View>

              {selectedCustomerMeta &&
                previousBalance > 0 &&
                !isFetchingBalance && (
                  <View className="flex-row items-center gap-2 px-4 py-3 bg-dangerBg border-t border-border">
                    <Text className="text-[13px] font-bold text-danger">
                      ⚠️ Previous Balance: ₹
                      {previousBalance.toLocaleString("en-IN")}
                    </Text>
                  </View>
                )}
            </View>

            {/* Inline picker list (always visible) */}
            <CustomerPicker
              visible
              variant="inline"
              selectedPerson={selectedCustomerMeta}
              setSelectedPerson={handleSelectPerson}
              vendorId={vendorId!}
            />

            {/* QUICK AMOUNT INPUT (amount-first) */}
            <View className="mt-2">
              <Text className="text-[11px] font-bold text-textSecondary tracking-widest mb-2">
                AMOUNT
              </Text>
              <View className="rounded-2xl bg-surface border-2 border-primary px-5 py-4">
                <View className="flex-row items-center">
                  <Text
                    className="text-[32px] font-extrabold mr-2"
                    style={{ color: colors.primary }}
                  >
                    ₹
                  </Text>
                  <TextInput
                    value={quickAmount}
                    onChangeText={setQuickAmount}
                    placeholder="500"
                    placeholderTextColor={colors.border}
                    keyboardType="numeric"
                    className="flex-1 text-[32px] font-extrabold"
                    style={{ color: colors.textPrimary }}
                    editable={!hasItems || entryType === "payment"} // Disable if using items
                    autoFocus={!selectedCustomerMeta} // Focus if no customer preselected
                  />
                </View>
                {hasItems && entryType === "bill" && (
                  <Text className="text-[11px] text-textSecondary mt-2">
                    Amount calculated from items below
                  </Text>
                )}
              </View>
            </View>

            {/* OPTIONAL NOTE */}
            <View>
              <Text className="text-[11px] font-bold text-textSecondary tracking-widest mb-2">
                NOTE (OPTIONAL)
              </Text>
              <View className="rounded-2xl bg-surface border border-border px-4 py-3">
                <TextInput
                  value={note}
                  onChangeText={setNote}
                  placeholder={
                    entryType === "payment"
                      ? "e.g., UPI payment"
                      : "e.g., Rice purchase, Monthly bill..."
                  }
                  placeholderTextColor={colors.textSecondary}
                  className="text-[15px]"
                  style={{ color: colors.textPrimary }}
                  multiline
                />
              </View>
            </View>

            {/* COLLAPSIBLE ITEMS SECTION */}
            {entryType === "bill" && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setIsItemsExpanded(!isItemsExpanded)}
                className="rounded-2xl bg-surface border border-border px-4 py-3.5 flex-row items-center justify-between mt-2"
              >
                <View className="flex-row items-center gap-2">
                  {isItemsExpanded ? (
                    <ChevronUp size={20} color={colors.textSecondary} />
                  ) : (
                    <ChevronDown size={20} color={colors.textSecondary} />
                  )}
                  <Text className="text-[15px] font-bold text-textPrimary">
                    Add Items (optional)
                  </Text>
                </View>
                {hasItems && (
                  <Text className="text-[13px] font-bold text-primary">
                    {items.length} item{items.length > 1 ? "s" : ""} · ₹
                    {itemsTotal.toFixed(0)}
                  </Text>
                )}
              </TouchableOpacity>
            )}

            {/* EXPANDED ITEMS SECTION */}
            {entryType === "bill" && isItemsExpanded && (
              <View className="rounded-2xl bg-surface border border-border overflow-hidden">
                {items.length > 0 && (
                  <>
                    <Text className="text-[15px] font-bold text-textPrimary px-4 pt-4 pb-2">
                      Items
                    </Text>
                    <View className="px-4 pb-2">
                      {items.map((item, idx) => (
                        <View key={item.id}>
                          {idx > 0 && <View className="h-px bg-border my-2" />}
                          <OrderItemCard
                            id={item.product_id || item.id}
                            name={item.product_name}
                            rate={item.price}
                            quantity={item.quantity}
                            onRemove={() => removeItem(item.id)}
                            onUpdateQuantity={(qty) =>
                              updateItemQuantity(item.id, qty)
                            }
                            onUpdateRate={(r) => updateItemRate(item.id, r)}
                          />
                        </View>
                      ))}
                    </View>
                  </>
                )}

                <View className="px-4 pb-4">
                  {hasItems && (
                    <View className="mt-4">
                      <OrderSummary
                        itemsTotal={getSubtotal()}
                        loadingCharge={loadingCharge}
                        taxPercent={taxPercent}
                        taxAmount={getTaxAmount()}
                        previousBalance={0} // Don't show in collapsed section
                        grandTotal={getGrandTotal()}
                        onLoadingChargeChange={setLoadingCharge}
                        onTaxChange={setGst}
                        isFetchingBalance={false}
                      />
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* SUMMARY (Always visible) */}
            {entryType === "bill" && (quickAmount || hasItems) && (
              <View className="rounded-2xl bg-surface border border-border p-4 mt-2">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-[14px] text-textSecondary">
                    Entry Amount
                  </Text>
                  <Text className="text-[16px] font-bold text-textPrimary">
                    ₹{entryAmount.toFixed(2)}
                  </Text>
                </View>

                {previousBalance > 0 && (
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-[14px] text-textSecondary">
                      Previous Balance
                    </Text>
                    <Text className="text-[16px] font-bold text-danger">
                      ₹{previousBalance.toFixed(2)}
                    </Text>
                  </View>
                )}

                <View
                  className="h-px my-2"
                  style={{ backgroundColor: colors.border }}
                />

                <View className="flex-row justify-between items-center">
                  <Text className="text-[16px] font-bold text-textPrimary">
                    Grand Total
                  </Text>
                  <Text
                    className="text-[24px] font-extrabold"
                    style={{ color: colors.primary }}
                  >
                    ₹{totalWithBalance.toFixed(2)}
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Absolute Footer */}
          <View className="absolute bottom-0 w-full">
            <BillFooter
              isLoading={createOrderMutation.isPending}
              onSaveAndShare={handleSaveAndShare}
              shareLabel={
                entryType === "payment" ? "Record Payment" : "Save & Share"
              }
              totalAmount={
                entryType === "payment"
                  ? parseFloat(quickAmount) || 0
                  : totalWithBalance
              }
              totalLabel={
                entryType === "payment" ? "Payment Amount" : "Grand Total"
              }
              showIcon={entryType !== "payment"}
              offlineQueueCount={queueLength}
              disabled={
                entryType === "payment"
                  ? !selectedCustomerId ||
                    !quickAmount.trim() ||
                    createOrderMutation.isPending
                  : !selectedCustomerId ||
                    (!quickAmount.trim() && !hasItems) ||
                    createOrderMutation.isPending
              }
            />
          </View>

          {/* Pickers */}
          <CustomerPicker
            visible={false}
            selectedPerson={selectedCustomerMeta}
            setSelectedPerson={handleSelectPerson}
            vendorId={vendorId!}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}
