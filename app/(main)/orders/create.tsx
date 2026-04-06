import { getCustomerPreviousBalance } from "@/src/api/orders";
import Loader from "@/src/components/feedback/Loader";
import OrderSummary from "@/src/components/orders/OrderBillSummary";
import OrderItemCard from "@/src/components/orders/OrderItemCard";
import CustomerPicker from "@/src/components/picker/CustomerPicker";
import ProductPicker from "@/src/components/picker/ProductPicker";
import { useCreateOrder } from "@/src/hooks/useOrders";
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
} from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
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

export default function CreateOrderScreen() {
  const { customer: customerParams } = useLocalSearchParams<{
    customer?: string;
  }>();
  
  const { profile, isFetchingProfile } = useAuthStore();
  const vendorId = profile?.id;
  const router = useRouter();

  // Zustand Draft Bills Store
  const setCustomer = useOrderStore((state) => state.setCustomer);
  const selectedCustomerId = useOrderStore((state) => state.selectedCustomerId);
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
  
  const getSubtotal = useOrderStore((state) => state.getSubtotal);
  const getTaxAmount = useOrderStore((state) => state.getTaxAmount);
  const getGrandTotal = useOrderStore((state) => state.getGrandTotal);

  // Local ephemeral layout/picker states
  const [selectedCustomerMeta, setSelectedCustomerMeta] = useState<any>(
    customerParams ? JSON.parse(customerParams) : null,
  );
  const [isCustomerPickerVisible, setCustomerPickerVisible] = useState(false);
  const [isProductPickerVisible, setProductPickerVisible] = useState(false);
  const [previousBalance, setPreviousBalance] = useState<number>(0);
  const [isFetchingBalance, setIsFetchingBalance] = useState(false);

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
  }, [customerParams, setCustomer, fetchPreviousBalance]);

  const handleSelectCustomer = useCallback(
    async (customer: any) => {
      setCustomer(customer?.id || null);
      setSelectedCustomerMeta(customer);
      setCustomerPickerVisible(false);
      if (customer) {
        fetchPreviousBalance(customer.id);
      }
    },
    [setCustomer, fetchPreviousBalance],
  );

  const { show: showToast } = useToast();
  const createOrderMutation = useCreateOrder(vendorId!);

  const handleSaveAndShare = async () => {
    if (!selectedCustomerId || items.length === 0) {
      return Alert.alert("Error", "Select a customer and add products");
    }
    if (
      !profile?.bank_name ||
      !profile?.account_number ||
      !profile?.ifsc_code
    ) {
      return Alert.alert(
        "Bank Details Missing",
        "Please fill in your Bank Name, Account Number, and IFSC Code to generate valid standard invoices.",
      );
    }

    try {
      const savedOrder = await createOrderMutation.mutateAsync({
        customerId: selectedCustomerId,
        vendorId: vendorId!,
        items: items.map((c) => ({
          product_id: c.product_id,
          product_name: c.product_name,
          price: c.price,
          quantity: c.quantity,
        })),
        amountPaid: 0,
        loadingCharge,
        taxPercent,
        billNumberPrefix: profile?.bill_number_prefix || "INV",
      });

      // Generate Native Shareable PDF
      const pdfItems: BillItem[] = items.map((c) => ({
        name: c.product_name,
        quantity: c.quantity,
        rate: c.price,
        amount: c.price * c.quantity,
      }));

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
        subtotal: getSubtotal(),
        taxAmount: getTaxAmount(),
        loadingCharge,
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
        getGrandTotal(),
        selectedCustomerMeta?.name || "Customer",
        billMeta,
      );

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(localPdfPath, { mimeType: "application/pdf" });
      }

      // Cleanup Draft on success and pop
      clearOrder();
      showToast({
        message: `Bill shared with ${selectedCustomerMeta?.name ?? "customer"}`,
        type: "success",
      });
      router.back();
    } catch (err: any) {
      console.error("Save & Share failed:", err.message);
      const errorMessage = err.message || "Failed to save and share bill";
      showToast({ message: errorMessage, type: "error" });
      Alert.alert("Error", errorMessage);
    }
  };

  const invoiceRef = `${profile?.bill_number_prefix || "INV"}-NEW`;

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
              <ArrowLeft size={22} color={colors.textPrimary} strokeWidth={2.2} />
            </TouchableOpacity>
            <Text className="flex-1 text-[18px] font-bold text-textPrimary">
              New Bill
            </Text>
            <View className="px-3 py-1 rounded-full border border-primary bg-primaryLight">
              <Text className="text-[13px] font-bold text-primary">
                {invoiceRef}
              </Text>
            </View>
          </View>

          {/* Scrollable List */}
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ padding: 16, paddingBottom: 60, gap: 12 }}
            showsVerticalScrollIndicator={false}
          >
            <Text className="text-[11px] font-bold text-textSecondary tracking-widest -mb-1 mt-1">
              BILL FOR
            </Text>

            {/* Customer block */}
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => setCustomerPickerVisible(true)}
              className="rounded-2xl overflow-hidden bg-surface border border-border"
            >
              <View className="flex-row items-center px-4 py-4">
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
                  <Text className="text-[17px] font-bold text-textPrimary" numberOfLines={1}>
                    {selectedCustomerMeta ? selectedCustomerMeta.name : "Select Customer"}
                  </Text>
                  {!selectedCustomerMeta && (
                    <Text className="text-[14px] text-textSecondary mt-0.5">
                      Tap to select
                    </Text>
                  )}
                </View>

                <Pencil size={18} color={colors.primary} strokeWidth={2} />
              </View>

              {selectedCustomerMeta && previousBalance > 0 && !isFetchingBalance && (
                <View className="flex-row items-center gap-2 px-4 py-3 bg-dangerLight border-t border-border">
                  <Text className="text-[13px] font-bold text-danger">
                    ⚠️ Previous Balance: ₹{previousBalance.toLocaleString("en-IN")}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Items List */}
            {items.length > 0 && (
              <View className="rounded-2xl bg-surface border border-border overflow-hidden mt-2">
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
                        onUpdateQuantity={(qty) => updateItemQuantity(item.id, qty)}
                        onUpdateRate={(r) => updateItemRate(item.id, r)}
                      />
                    </View>
                  ))}
                </View>
              </View>
            )}

            <TouchableOpacity
              onPress={() => setProductPickerVisible(true)}
              activeOpacity={0.7}
              className="flex-row items-center justify-center py-4 mt-2 rounded-2xl border-[1.5px] border-dashed border-primary bg-primaryLight"
            >
              <CirclePlus size={18} color={colors.primary} strokeWidth={2.5} />
              <Text className="ml-2 text-[15px] font-extrabold text-primary">
                Add Product
              </Text>
            </TouchableOpacity>

            <View className="mt-2" />
            
            <OrderSummary
              itemsTotal={getSubtotal()}
              loadingCharge={loadingCharge}
              taxPercent={taxPercent}
              taxAmount={getTaxAmount()}
              previousBalance={previousBalance}
              grandTotal={getGrandTotal() + previousBalance}
              onLoadingChargeChange={setLoadingCharge}
              onTaxChange={setGst}
              isFetchingBalance={isFetchingBalance}
            />
          </ScrollView>

          {/* Absolute Footer using Zustand math exclusively */}
          <View className="bottom-0 w-full">
            <BillFooter
              isLoading={createOrderMutation.isPending}
              onSaveAndShare={handleSaveAndShare}
            />
          </View>

          {/* Pickers */}
          <CustomerPicker
            visible={isCustomerPickerVisible}
            onClose={() => setCustomerPickerVisible(false)}
            selectedCustomer={selectedCustomerMeta}
            setSelectedCustomer={handleSelectCustomer}
            vendorId={vendorId!}
          />

          <ProductPicker
            visible={isProductPickerVisible}
            onClose={() => setProductPickerVisible(false)}
            vendorId={vendorId!}
            addToCart={(productId, name, rate) => addItem({ product_id: productId, product_name: name, price: rate, quantity: 1})}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}
