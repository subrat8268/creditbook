import ScreenWrapper from "@/src/components/ScreenWrapper";
import Loader from "@/src/components/feedback/Loader";
import OrderSummary from "@/src/components/orders/OrderBillSummary";
import OrderItemCard from "@/src/components/orders/OrderItemCard";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pencil } from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import {
    Alert,
    FlatList,
    Linking,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { getCustomerPreviousBalance } from "../api/orders";
import CustomerPicker from "../components/picker/CustomerPicker";
import ProductPicker from "../components/picker/ProductPicker";
import VariantPicker from "../components/picker/VariantPicker";
import { useCreateOrder } from "../hooks/useOrders";
import { useAuthStore } from "../store/authStore";
import { BillItem, generateBillPdf } from "../utils/generateBillPdf";
import { uploadPdfToSupabase } from "../utils/uploadPdfToSupabase";

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
  "#EF4444",
  "#F97316",
  "#EAB308",
  "#22C55E",
  "#14B8A6",
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
];
function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
function getAvatarColor(name: string) {
  const sum = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % 8];
}

export default function CreateOrderScreen() {
  const { customer: customerParams } = useLocalSearchParams<{
    customer?: string;
  }>();
  const { profile, loading } = useAuthStore();
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
      } catch (e) {
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

  // ── Payment reminder via WhatsApp ──────────────────────────
  const handleSendReminder = async () => {
    if (!selectedCustomer) return;
    const phone = selectedCustomer.phone.replace(/[^0-9]/g, "");
    const amount = previousBalance.toLocaleString("en-IN");
    const message =
      `Dear ${selectedCustomer.name}, you have an outstanding balance of ₹${amount}. ` +
      `Kindly settle at the earliest. — ${profile?.business_name || "Your Store"}`;
    const waUrl = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(message)}`;
    try {
      await Linking.openURL(waUrl);
    } catch {
      Alert.alert(
        "Error",
        "Unable to open WhatsApp. Please ensure it is installed.",
      );
    }
  };

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
  //   try {
  //     if (!selectedCustomer || cart.length === 0) {
  //       return Alert.alert("Error", "Select a customer and add products");
  //     }

  //     const pdf = await generateBillPdf(
  //       cart,
  //       totalAmount,
  //       selectedCustomer.name
  //     );

  //     // Upload to Supabase
  //     const url = await uploadPdfToSupabase(pdf);

  //     // Send via WhatsApp
  //     const phone = selectedCustomer.phone.replace(/[^0-9]/g, "");

  //     const waUrl = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(
  //       `Hello ${selectedCustomer.name}, here is your bill:\n${url}`
  //     )}`;

  //     const supported = await Linking.canOpenURL(waUrl);

  //     if (!supported) {
  //       return Alert.alert("WhatsApp Not Installed");
  //     }

  //     Linking.openURL(waUrl);
  //   } catch (err: any) {
  //     Alert.alert("Error", err.message || "Failed to send bill");
  //   }
  // };

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

  if (loading || !profile) return <Loader />;

  return (
    <ScreenWrapper>
      {/* Customer */}
      <TouchableOpacity
        style={styles.customerRow}
        onPress={() => setCustomerPickerVisible(true)}
        activeOpacity={0.75}
      >
        {/* Avatar */}
        {selectedCustomer ? (
          <View
            style={[
              styles.avatar,
              { backgroundColor: getAvatarColor(selectedCustomer.name) },
            ]}
          >
            <Text style={styles.avatarText}>
              {getInitials(selectedCustomer.name)}
            </Text>
          </View>
        ) : (
          <View style={[styles.avatar, { backgroundColor: "#E5E7EB" }]}>
            <Text style={[styles.avatarText, { color: "#9CA3AF" }]}>?</Text>
          </View>
        )}

        {/* Name */}
        <Text style={styles.customerName} numberOfLines={1}>
          {selectedCustomer ? selectedCustomer.name : "Select Customer"}
        </Text>

        {/* Edit icon */}
        <Pencil size={16} color="#9CA3AF" strokeWidth={2} />
      </TouchableOpacity>

      {/* Payment reminder button — shown only when previous balance > 0 */}
      {selectedCustomer && previousBalance > 0 && !isFetchingBalance && (
        <TouchableOpacity
          className="flex-row items-center gap-2 px-4 py-2.5 mb-3 bg-amber-50 border border-amber-300 rounded-xl"
          onPress={handleSendReminder}
        >
          <Text className="text-amber-700 font-inter-medium text-sm flex-1">
            🔔 Send payment reminder to {selectedCustomer.name}
          </Text>
          <Text className="text-amber-700 text-xs font-inter-semibold">
            ₹{previousBalance.toLocaleString("en-IN")} due
          </Text>
        </TouchableOpacity>
      )}

      {/* Product */}
      <TouchableOpacity
        className="p-4 border rounded-xl mb-4 bg-white"
        onPress={() => setProductPickerVisible(true)}
      >
        <Text className="font-inter-medium text-gray-700">Add Products</Text>
      </TouchableOpacity>

      {/* Cart */}
      <FlatList
        data={cart}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <OrderItemCard
            id={item.id}
            name={item.name}
            variantName={item.variantName}
            price={item.price}
            quantity={item.quantity}
            onRemove={() => handleRemoveProduct(item.key)}
            onUpdateQuantity={(qty) => handleUpdateQuantity(item.key, qty)}
          />
        )}
        ListEmptyComponent={
          <Text className="text-center text-gray-400 mt-4">
            No products added yet
          </Text>
        }
        contentContainerStyle={{ paddingBottom: 280 }}
      />

      {/* Summary */}
      <OrderSummary
        itemsTotal={itemsTotal}
        loadingCharge={loadingCharge}
        taxPercent={taxPercent}
        taxAmount={taxAmount}
        previousBalance={previousBalance}
        grandTotal={grandTotal}
        onSave={handleSaveOrder}
        onSendBill={handleSendBill}
        onLoadingChargeChange={setLoadingCharge}
        onTaxChange={setTaxPercent}
        isFetchingBalance={isFetchingBalance}
      />

      {/* Customer Picker */}
      <CustomerPicker
        visible={isCustomerPickerVisible}
        onClose={() => setCustomerPickerVisible(false)}
        selectedCustomer={selectedCustomer}
        setSelectedCustomer={handleSelectCustomer}
        vendorId={vendorId!}
      />

      {/* Product Picker */}
      <ProductPicker
        visible={isProductPickerVisible}
        onClose={() => setProductPickerVisible(false)}
        vendorId={vendorId!}
        addToCart={addToCart}
        setVariantSelection={(product: any) => {
          setSelectedProduct(product);
          setProductPickerVisible(false); // close product picker
          // open variant picker after small delay
          setTimeout(() => setVariantPickerVisible(true), 300);
        }}
      />

      {/* Variant Picker */}
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
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  customerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
  customerName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#1C1C1E",
  },
});
