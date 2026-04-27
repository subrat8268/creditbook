import { getCustomerPreviousBalance, recordPayment } from "@/src/api/entries";
import { fetchPersonDetail } from "@/src/api/people";
import Loader from "@/src/components/feedback/Loader";
import SyncStatus from "@/src/components/feedback/SyncStatus";
import { useToast } from "@/src/components/feedback/Toast";
import BillFooter from "@/src/components/orders/BillFooter";
import CustomerPicker from "@/src/components/picker/CustomerPicker";
import Input from "@/src/components/ui/Input";
import { useCreateOrder } from "@/src/hooks/useEntries";
import { useNetworkSync } from "@/src/hooks/useNetworkSync";
import { useAuthStore } from "@/src/store/authStore";
import { useOrderStore } from "@/src/store/orderStore";
import { useTheme } from "@/src/utils/ThemeProvider";
import { BillItem, generateBillPdf } from "@/src/utils/generateBillPdf";
import { useQueryClient } from "@tanstack/react-query";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { ArrowLeft, Pencil } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
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

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function getAvatarColor(name: string, palette: readonly string[]): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return palette[Math.abs(hash) % palette.length] as string;
}

export default function CreateOrderScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const avatarColors = useMemo(
    () => [colors.danger, colors.warning, colors.primary, ...colors.avatarPalette],
    [colors],
  );

  const {
    customer: customerParams,
    amount: amountParam,
  } = useLocalSearchParams<{
    customer?: string;
    amount?: string;
  }>();

  const { profile, isFetchingProfile } = useAuthStore();
  const vendorId = profile?.id;
  const router = useRouter();
  const queryClient = useQueryClient();

  // Zustand Draft Entry Store
  const setCustomer = useOrderStore((state) => state.setCustomer);
  const selectedCustomerId = useOrderStore((state) => state.selectedCustomerId);
  const draftItems = useOrderStore((state) => state.items);
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
  const hasItems = draftItems.length > 0;

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

    // Quick amount must be provided
    if (!quickAmount.trim()) {
      return Alert.alert("Error", "Please enter an amount");
    }

    await performSave();
  };

  const performSave = async () => {
    try {
      // Create a generic entry item from quick amount
      const orderItems = [
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
        loadingCharge: 0,
        taxPercent: 0,
        billNumberPrefix: profile?.bill_number_prefix || "INV",
      });

      // Generate Native Shareable PDF
      const pdfItems: BillItem[] = [
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
        subtotal: parseFloat(quickAmount) || 0,
        taxAmount: 0,
        loadingCharge: 0,
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

      // Cleanup Draft on success and go to the created detail screen.
      clearOrder();
      setQuickAmount("");
      setNote("");
      showToast({
        message: `Entry created for ${selectedCustomerMeta?.name ?? "customer"}`,
        type: "success",
      });
      router.replace({
        pathname: "/(main)/entries/[orderId]",
        params: { orderId: savedOrder.id },
      } as never);
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
      <SafeAreaView className="flex-1 bg-background dark:bg-background-dark">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          {/* Header */}
          <View className="flex-row items-center border-b border-border bg-surface px-4 py-3 dark:border-border-dark dark:bg-surface-dark">
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
            <Text className="flex-1 text-[18px] font-bold text-textPrimary dark:text-textPrimary-dark">
              Add Entry
            </Text>
            <View className="mr-2">
              <SyncStatus />
            </View>
            <View className="rounded-full border border-primary bg-primary-light px-3 py-1 dark:bg-primary-soft-dark">
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

            {/* Person picker (inline, amount-first flow) */}
            <View className="overflow-hidden rounded-2xl border border-border bg-surface dark:border-border-dark dark:bg-surface-dark">
              <View className="flex-row items-center border-b border-border px-4 py-4 dark:border-border-dark">
                <View
                  className="rounded-full items-center justify-center mr-3 w-[52px] h-[52px]"
                    style={{
                      backgroundColor: selectedCustomerMeta
                        ? getAvatarColor(selectedCustomerMeta.name, avatarColors)
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
                    className="text-[17px] font-bold text-textPrimary dark:text-textPrimary-dark"
                    numberOfLines={1}
                  >
                    {selectedCustomerMeta
                      ? selectedCustomerMeta.name
                      : "Select Person"}
                  </Text>
                  {!selectedCustomerMeta && (
                    <Text className="mt-0.5 text-[14px] text-textSecondary dark:text-textSecondary-dark">
                      Choose from your people list below
                    </Text>
                  )}
                </View>

                <Pencil size={18} color={colors.primary} strokeWidth={2} />
              </View>

              {selectedCustomerMeta &&
                previousBalance > 0 &&
                !isFetchingBalance && (
                  <View
                    className="flex-row items-center gap-2 border-t border-border px-4 py-3 dark:border-border-dark"
                    style={{ backgroundColor: colors.dangerBg }}
                  >
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
              <Text className="mb-2 text-[11px] font-bold tracking-widest text-textSecondary dark:text-textSecondary-dark">
                AMOUNT
              </Text>
              <View className="rounded-2xl border-2 border-primary bg-surface px-5 py-6 dark:bg-surface-dark">
                <View className="flex-row items-center">
                  <Text
                    className="text-[40px] font-extrabold mr-1"
                    style={{ color: colors.primary }}
                  >
                    ₹
                  </Text>
                  <Input
                    placeholder="0"
                    value={quickAmount}
                    onChangeText={setQuickAmount}
                    placeholderTextColor={colors.border}
                    keyboardType="numeric"
                    autoFocus={!selectedCustomerMeta}
                    returnKeyType="done"
                    onSubmitEditing={handleSaveAndShare}
                    variant="white"
                    containerStyle={styles.quickAmountInputContainer}
                    inputStyle={styles.quickAmountInput}
                  />
                </View>
                {hasItems && entryType === "bill" && (
                  <Text className="mt-2 text-[11px] text-textSecondary dark:text-textSecondary-dark">
                    Amount calculated from items below
                  </Text>
                )}
              </View>
            </View>

            {/* OPTIONAL NOTE */}
            <View>
              <Text className="mb-2 text-[11px] font-bold tracking-widest text-textSecondary dark:text-textSecondary-dark">
                NOTE (OPTIONAL)
              </Text>
              <View className="rounded-2xl border border-border bg-surface px-4 py-3 dark:border-border-dark dark:bg-surface-dark">
                <Input
                  placeholder={
                    entryType === "payment"
                      ? "e.g., UPI payment"
                      : "e.g., Rice purchase, Monthly bill..."
                  }
                  value={note}
                  onChangeText={setNote}
                  variant="white"
                  multiline
                  numberOfLines={3}
                  containerStyle={styles.noteInputContainer}
                  inputStyle={styles.noteInput}
                />
              </View>
            </View>

            {/* SUMMARY (Always visible) */}
            {entryType === "bill" && (quickAmount || hasItems) && (
              <View className="mt-2 rounded-2xl border border-border bg-surface p-4 dark:border-border-dark dark:bg-surface-dark">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-[14px] text-textSecondary dark:text-textSecondary-dark">
                    Entry Amount
                  </Text>
                  <Text className="text-[16px] font-bold text-textPrimary dark:text-textPrimary-dark">
                    ₹{entryAmount.toFixed(2)}
                  </Text>
                </View>

                {previousBalance > 0 && (
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-[14px] text-textSecondary dark:text-textSecondary-dark">
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
                  <Text className="text-[16px] font-bold text-textPrimary dark:text-textPrimary-dark">
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

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
    quickAmountInputContainer: {
      borderWidth: 0,
      backgroundColor: "transparent",
      paddingHorizontal: 0,
      minHeight: 44,
    },
    quickAmountInput: {
      fontSize: 36,
      fontWeight: "800",
      color: colors.textPrimary,
    },
    noteInputContainer: {
      borderWidth: 0,
      backgroundColor: "transparent",
      paddingHorizontal: 0,
    },
    noteInput: {
      fontSize: 15,
      color: colors.textPrimary,
    },
  });
