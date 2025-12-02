import ScreenWrapper from "@/src/components/ScreenWrapper";
import Loader from "@/src/components/feedback/Loader";
import OrderSummary from "@/src/components/orders/OrderBillSummary";
import OrderItemCard from "@/src/components/orders/OrderItemCard";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, FlatList, Linking, Text, TouchableOpacity } from "react-native";
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

export default function CreateOrderScreen() {
  const { customer: customerParams } = useLocalSearchParams<{
    customer?: string;
  }>();
  const { profile, loading } = useAuthStore();
  const vendorId = profile?.id;
  const router = useRouter();

  const [selectedCustomer, setSelectedCustomer] = useState<any>(
    customerParams ? JSON.parse(customerParams) : null
  );

  const [isCustomerPickerVisible, setCustomerPickerVisible] = useState(false);
  const [isProductPickerVisible, setProductPickerVisible] = useState(false);
  const [isVariantPickerVisible, setVariantPickerVisible] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);

  const totalAmount = useMemo(
    () => cart.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [cart]
  );

  const addToCart = (
    productId: string,
    name: string,
    price: number,
    variantId?: string,
    variantName?: string
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
      });
      Alert.alert("Success", "Order saved!");
      router.back();
    } catch (err: any) {
      console.error("Failed to save order:", err.message);
      Alert.alert("Error", err.message || "Failed to save order");
    }
  };

  // const handleSendBill = async () => {
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

      const items: BillItem[] = cart.map((c) => ({
        name: c.name,
        variantName: c.variantName,
        quantity: c.quantity,
        price: c.price,
      }));

      // 1. generate PDF locally
      const localPdfPath = await generateBillPdf(
        items,
        {
          name: "Your Store",
          address: "Your Address",
          phone: "0000000000",
          gstin: "YOURGSTIN",
          logoUrl: "r://yourcdn.com/logo.png",
        },
        totalAmount,
        selectedCustomer.name,
        {
          invoiceNumber: `INV-${Date.now()}`,
          upiId: "yourupi@bank", // optional
          discountAmount: 0,
          taxPercent: 18,
          notes: "Thanks for shopping!",
        }
      );

      // 2. upload to Supabase bills bucket
      const publicUrl = await uploadPdfToSupabase(localPdfPath);

      // 3. create WhatsApp url with link and open
      const phone = selectedCustomer.phone.replace(/[^0-9]/g, "");
      const message = `Hello ${selectedCustomer.name}, here is your bill: ${publicUrl}`;
      const waUrl = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(message)}`;

      try {
        await Linking.openURL(waUrl);
      } catch {
        Alert.alert(
          "Error",
          "Unable to open WhatsApp. Please ensure WhatsApp is installed."
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
        className="p-4 border rounded-xl mb-4 bg-white"
        onPress={() => setCustomerPickerVisible(true)}
      >
        <Text className="font-inter-medium text-gray-700">
          {selectedCustomer ? selectedCustomer.name : "Select Customer"}
        </Text>
      </TouchableOpacity>

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
        contentContainerStyle={{ paddingBottom: 120 }}
      />

      {/* Summary */}
      <OrderSummary
        total={totalAmount}
        onSave={handleSaveOrder}
        onSendBill={handleSendBill}
      />

      {/* Customer Picker */}
      <CustomerPicker
        visible={isCustomerPickerVisible}
        onClose={() => setCustomerPickerVisible(false)}
        selectedCustomer={selectedCustomer}
        setSelectedCustomer={(c: any) => {
          setSelectedCustomer(c);
          setCustomerPickerVisible(false); // close after selection
        }}
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
              variantName
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
