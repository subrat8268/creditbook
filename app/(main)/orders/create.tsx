import { getCustomerPreviousBalance } from "@/src/api/orders";
import Loader from "@/src/components/feedback/Loader";
import OrderSummary from "@/src/components/orders/OrderBillSummary";
import OrderItemCard from "@/src/components/orders/OrderItemCard";
import CustomerPicker from "@/src/components/picker/CustomerPicker";
import ProductPicker from "@/src/components/picker/ProductPicker";
import VariantPicker from "@/src/components/picker/VariantPicker";
import { useCreateOrder } from "@/src/hooks/useOrders";
import { useAuthStore } from "@/src/store/authStore";
import { BillItem, generateBillPdf } from "@/src/utils/generateBillPdf";
import { colors, spacing } from "@/src/utils/theme";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
    ArrowLeft,
    Barcode,
    CircleCheck,
    CirclePlus,
    Pencil,
    Search,
    Share2,
} from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
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

interface CartItem {
  id: string;
  variantId?: string;
  name: string;
  variantName?: string;
  price: number;
  quantity: number;
  key: string;
}

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

  const [selectedCustomer, setSelectedCustomer] = useState<any>(
    customerParams ? JSON.parse(customerParams) : null,
  );

  const [isCustomerPickerVisible, setCustomerPickerVisible] = useState(false);
  const [isProductPickerVisible, setProductPickerVisible] = useState(false);
  const [isVariantPickerVisible, setVariantPickerVisible] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loadingCharge, setLoadingCharge] = useState<number>(0);
  const [taxPercent, setTaxPercent] = useState<number>(0);
  const [previousBalance, setPreviousBalance] = useState<number>(0);
  const [isFetchingBalance, setIsFetchingBalance] = useState(false);

  // Fetch previous balance whenever a customer is selected
  const handleSelectCustomer = useCallback(
    async (customer: any) => {
      setSelectedCustomer(customer);
      setCustomerPickerVisible(false);
      if (!customer || !vendorId) return;
      try {
        setIsFetchingBalance(true);
        const balance = await getCustomerPreviousBalance(customer.id, vendorId);
        setPreviousBalance(balance);
      } catch {
        setPreviousBalance(0);
      } finally {
        setIsFetchingBalance(false);
      }
    },
    [vendorId],
  );

  const itemsTotal = useMemo(
    () => cart.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [cart],
  );

  // Tax applied to items only (not loading charge)
  const taxAmount = useMemo(
    () => Math.round(((itemsTotal * taxPercent) / 100) * 100) / 100,
    [itemsTotal, taxPercent],
  );

  // Today's order amount (items + tax + loading)
  const todayTotal = useMemo(
    () => itemsTotal + taxAmount + loadingCharge,
    [itemsTotal, taxAmount, loadingCharge],
  );

  // Grand total shown to seller = previous balance + today's order
  const grandTotal = useMemo(
    () => todayTotal + previousBalance,
    [todayTotal, previousBalance],
  );

  const addToCart = (
    productId: string,
    name: string,
    price: number,
    variantId?: string,
    variantName?: string,
  ) => {
    const key = `${productId}-${variantId ?? "base"}-${Date.now()}`;

    setCart([
      ...cart,
      {
        id: productId,
        variantId,
        name,
        variantName,
        price,
        quantity: 1,
        key,
      },
    ]);
  };

  const handleRemoveProduct = (key: string) =>
    setCart(cart.filter((c) => c.key !== key));

  const handleUpdateQuantity = (key: string, quantity: number) => {
    if (quantity <= 0) return handleRemoveProduct(key);

    setCart(cart.map((c) => (c.key === key ? { ...c, quantity } : c)));
  };

  const createOrderMutation = useCreateOrder(vendorId!);

  const handleSaveOrder = async () => {
    if (!selectedCustomer || cart.length === 0) {
      return Alert.alert("Error", "Select a customer and add products");
    }
    try {
      await createOrderMutation.mutateAsync({
        customerId: selectedCustomer.id,
        vendorId: vendorId!,
        items: cart.map((c) => ({
          product_id: c.id,
          product_name: c.name,
          variant_id: c.variantId ?? null,
          variant_name: c.variantName ?? null,
          price: c.price,
          quantity: c.quantity,
        })),
        amountPaid: 0,
        loadingCharge: loadingCharge,
        taxPercent: taxPercent,
        billNumberPrefix: profile?.bill_number_prefix || "INV",
      });
      Alert.alert("Success", "Order saved!");
      router.back();
    } catch (err: any) {
      console.error("Failed to save order:", err.message);
      Alert.alert("Error", err.message || "Failed to save order");
    }
  };

  const handleSendBill = async () => {
    try {
      if (!selectedCustomer || cart.length === 0) {
        return Alert.alert("Error", "Select a customer and add products");
      }

      // Validate mandatory bank details
      if (
        !profile?.bank_name ||
        !profile?.account_number ||
        !profile?.ifsc_code
      ) {
        return Alert.alert(
          "Bank Details Missing",
          "Please fill in your Bank Name, Account Number, and IFSC Code in Profile → Bank Account Details before generating bills.",
        );
      }

      const items: BillItem[] = cart.map((c) => ({
        name: c.name,
        variantName: c.variantName,
        quantity: c.quantity,
        price: c.price,
      }));

      // Use already-fetched previousBalance state (no duplicate API call)
      const localPdfPath = await generateBillPdf(
        items,
        {
          name: profile?.business_name || "Your Store",
          address: profile?.business_address || "",
          phone: profile?.phone || "",
          gstin: profile?.gstin || "",
          logoUrl: profile?.business_logo_url || null,
          bankName: profile?.bank_name || "",
          accountNumber: profile?.account_number || "",
          ifscCode: profile?.ifsc_code || "",
        },
        todayTotal,
        selectedCustomer.name,
        {
          invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
          upiId: profile?.upi_id || "",
          discountAmount: 0,
          taxPercent: taxPercent,
          notes: "Thank you for your business!",
          previousBalance: previousBalance,
          loadingCharge: loadingCharge,
        },
      );

      const publicUrl = await uploadPdfToSupabase(localPdfPath);

      const phone = selectedCustomer.phone.replace(/[^0-9]/g, "");
      const message = `Hello ${selectedCustomer.name}, here is your bill: ${publicUrl}`;
      const waUrl = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(message)}`;

      try {
        await Linking.openURL(waUrl);
      } catch {
        Alert.alert(
          "Error",
          "Unable to open WhatsApp. Please ensure WhatsApp is installed.",
        );
      }
    } catch (err: any) {
      console.error("send bill error", err);
      Alert.alert("Error", err?.message || "Failed to send bill");
    }
  };

  // Display invoice prefix in the header pill — sequential number is assigned on save.
  const invoiceRef = `${profile?.bill_number_prefix || "INV"}-NEW`;

  if (isFetchingProfile || !profile) return <Loader />;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: colors.background }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          {/* ── Custom Header ── */}
          <View
            className="flex-row items-center px-4 py-3"
            style={{
              backgroundColor: colors.surface,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              className="mr-3"
            >
              <ArrowLeft
                size={22}
                color={colors.textPrimary}
                strokeWidth={2.2}
              />
            </TouchableOpacity>
            <Text
              className="flex-1 text-[18px] font-bold"
              style={{ color: colors.textPrimary }}
            >
              New Bill
            </Text>
            {/* INV pill */}
            <View
              className="px-3 py-1 rounded-full border"
              style={{
                borderColor: colors.primary,
                backgroundColor: colors.paid.bg,
              }}
            >
              <Text
                className="text-[13px] font-bold"
                style={{ color: colors.primary }}
              >
                {invoiceRef}
              </Text>
            </View>
          </View>

          {/* ── Scrollable content ── */}
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              padding: spacing.lg,
              paddingBottom: 120,
              gap: spacing.sm,
            }}
            showsVerticalScrollIndicator={false}
          >
            {/* ── Customer card ── */}
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => setCustomerPickerVisible(true)}
              className="rounded-2xl overflow-hidden"
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View className="flex-row items-center px-4 py-3">
                {/* Avatar */}
                <View
                  className="rounded-full items-center justify-center mr-3"
                  style={{
                    width: 52,
                    height: 52,
                    backgroundColor: selectedCustomer
                      ? getAvatarColor(selectedCustomer.name)
                      : colors.border,
                  }}
                >
                  <Text
                    className="font-bold text-white"
                    style={{ fontSize: 17 }}
                  >
                    {selectedCustomer
                      ? getInitials(selectedCustomer.name)
                      : "?"}
                  </Text>
                </View>

                {/* Name + subtitle */}
                <View className="flex-1">
                  <Text
                    className="text-[16px] font-bold"
                    style={{ color: colors.textPrimary }}
                    numberOfLines={1}
                  >
                    {selectedCustomer
                      ? selectedCustomer.name
                      : "Select Customer"}
                  </Text>
                  {!selectedCustomer && (
                    <Text
                      className="text-sm"
                      style={{ color: colors.textSecondary }}
                    >
                      Tap to select
                    </Text>
                  )}
                </View>

                {/* Edit icon */}
                <Pencil size={18} color={colors.primary} strokeWidth={2} />
              </View>

              {/* Previous balance warning row */}
              {selectedCustomer &&
                previousBalance > 0 &&
                !isFetchingBalance && (
                  <View
                    className="flex-row items-center gap-2 px-4 py-2"
                    style={{ backgroundColor: colors.overdue.bg }}
                  >
                    <Text style={{ color: colors.overdue.text, fontSize: 13 }}>
                      ⚠️
                    </Text>
                    <Text
                      className="text-[13px] font-semibold"
                      style={{ color: colors.overdue.text }}
                    >
                      Previous Balance: ₹
                      {previousBalance.toLocaleString("en-IN")}
                    </Text>
                  </View>
                )}
            </TouchableOpacity>

            {/* ── Items card ── */}
            <View
              className="rounded-2xl overflow-hidden"
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View className="px-4 pt-4 pb-2">
                <Text
                  className="text-[15px] font-bold mb-3"
                  style={{ color: colors.textPrimary }}
                >
                  Items
                </Text>

                {/* Search bar (opens product picker) */}
                <TouchableOpacity
                  onPress={() => setProductPickerVisible(true)}
                  activeOpacity={0.7}
                  className="flex-row items-center rounded-xl px-3 py-2.5 mb-3"
                  style={{ backgroundColor: colors.background }}
                >
                  <Search
                    size={16}
                    color={colors.textSecondary}
                    strokeWidth={2}
                  />
                  <Text
                    className="flex-1 ml-2 text-[14px]"
                    style={{ color: colors.textSecondary }}
                  >
                    Search products...
                  </Text>
                  <Barcode
                    size={18}
                    color={colors.textSecondary}
                    strokeWidth={1.5}
                  />
                </TouchableOpacity>
              </View>

              {/* Item rows */}
              {cart.length > 0 ? (
                <View className="px-4">
                  {cart.map((item, idx) => (
                    <View key={item.key}>
                      {idx > 0 && (
                        <View
                          className="h-px mb-4"
                          style={{ backgroundColor: colors.border }}
                        />
                      )}
                      <OrderItemCard
                        id={item.id}
                        name={item.name}
                        variantName={item.variantName}
                        price={item.price}
                        quantity={item.quantity}
                        onRemove={() => handleRemoveProduct(item.key)}
                        onUpdateQuantity={(qty) =>
                          handleUpdateQuantity(item.key, qty)
                        }
                      />
                    </View>
                  ))}
                </View>
              ) : null}

              {/* Add Product dashed button */}
              <TouchableOpacity
                onPress={() => setProductPickerVisible(true)}
                activeOpacity={0.7}
                className="flex-row items-center justify-center py-3.5 mx-4 mb-4 rounded-xl"
                style={{
                  borderWidth: 1.5,
                  borderStyle: "dashed",
                  borderColor: colors.primary,
                }}
              >
                <CirclePlus size={16} color={colors.primary} strokeWidth={2} />
                <Text
                  className="ml-1.5 text-[14px] font-semibold"
                  style={{ color: colors.primary }}
                >
                  Add Product
                </Text>
              </TouchableOpacity>
            </View>

            {/* ── Other Charges + Summary (from OrderBillSummary) ── */}
            <OrderSummary
              itemsTotal={itemsTotal}
              loadingCharge={loadingCharge}
              taxPercent={taxPercent}
              taxAmount={taxAmount}
              previousBalance={previousBalance}
              grandTotal={grandTotal}
              onLoadingChargeChange={setLoadingCharge}
              onTaxChange={setTaxPercent}
              isFetchingBalance={isFetchingBalance}
            />
          </ScrollView>

          {/* ── Sticky footer ── */}
          <View
            className="flex-row gap-3 px-4 py-3"
            style={{
              backgroundColor: colors.surface,
              borderTopWidth: 1,
              borderTopColor: colors.border,
            }}
          >
            {/* Save Bill (outline) — saves to DB only, no PDF */}
            <TouchableOpacity
              onPress={handleSaveOrder}
              disabled={createOrderMutation.isPending}
              activeOpacity={0.8}
              className="flex-1 flex-row items-center justify-center py-3.5 rounded-full border"
              style={{
                borderColor: colors.primary,
                opacity: createOrderMutation.isPending ? 0.5 : 1,
              }}
            >
              <CircleCheck size={18} color={colors.primary} strokeWidth={2} />
              <Text
                className="ml-2 text-[15px] font-bold"
                style={{ color: colors.primary }}
              >
                Save Bill
              </Text>
            </TouchableOpacity>

            {/* Save & Share (solid) — saves to DB then generates PDF via expo-sharing */}
            <TouchableOpacity
              onPress={handleSaveAndShare}
              disabled={createOrderMutation.isPending}
              activeOpacity={0.8}
              className="flex-1 flex-row items-center justify-center py-3.5 rounded-full"
              style={{
                backgroundColor: colors.primary,
                opacity: createOrderMutation.isPending ? 0.5 : 1,
              }}
            >
              <Share2 size={18} color={colors.surface} strokeWidth={2} />
              <Text className="ml-2 text-[15px] font-bold text-white">
                {createOrderMutation.isPending ? "Saving..." : "Save & Share"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── Pickers ── */}
          <CustomerPicker
            visible={isCustomerPickerVisible}
            onClose={() => setCustomerPickerVisible(false)}
            selectedCustomer={selectedCustomer}
            setSelectedCustomer={handleSelectCustomer}
            vendorId={vendorId!}
          />

          <ProductPicker
            visible={isProductPickerVisible}
            onClose={() => setProductPickerVisible(false)}
            vendorId={vendorId!}
            addToCart={addToCart}
            setVariantSelection={(product: any) => {
              setSelectedProduct(product);
              setProductPickerVisible(false);
              setTimeout(() => setVariantPickerVisible(true), 300);
            }}
          />

          {selectedProduct && (
            <VariantPicker
              visible={isVariantPickerVisible}
              product={selectedProduct}
              onSelect={(variantId, variantName, price) => {
                addToCart(
                  selectedProduct.id,
                  selectedProduct.name,
                  price,
                  variantId ?? undefined,
                  variantName,
                );
                setTimeout(() => {
                  setVariantPickerVisible(false);
                  setSelectedProduct(null);
                }, 50);
              }}
              onClose={() => {
                setVariantPickerVisible(false);
                setSelectedProduct(null);
              }}
            />
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}
