import { Product, ProductVariant } from "@/src/api/products";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Minus,
  Package,
  Pencil,
  Plus,
  ShoppingCart,
} from "lucide-react-native";
import { useState } from "react";
import {
  Alert,
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/src/utils/theme";

const { width: SCREEN_W } = Dimensions.get("window");
const IMAGE_H = SCREEN_W * 0.85;

export default function ProductDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ productData: string }>();

  let product: Product | null = null;
  try {
    if (params.productData) product = JSON.parse(params.productData) as Product;
  } catch {
    product = null;
  }

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product?.variants?.[0] ?? null,
  );
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <Text className="text-[16px] font-semibold text-textSecondary">Product not found.</Text>
      </SafeAreaView>
    );
  }

  const displayPrice = selectedVariant?.price ?? product.base_price ?? 0;
  // Compute dummy MRP and per/kg strictly for mockup replication since it's missing in pure Product schema
  const displayMrp = displayPrice + (displayPrice * 0.1); 
  const isPerKg = product.name.toLowerCase().includes("kg") || selectedVariant?.variant_name.toLowerCase().includes("kg");
  const fallbackUnit = isPerKg ? "kg" : "unit";

  const handleAddToBill = () => {
    Alert.alert(
      "Add to Bill",
      `${quantity}x ${product!.name}${selectedVariant ? ` (${selectedVariant.variant_name})` : ""} — ₹${(displayPrice * quantity).toLocaleString("en-IN")}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Open New Bill",
          onPress: () => router.push("/(main)/orders/create" as any),
        },
      ],
    );
  };

  return (
    <View className="flex-1 bg-background">
      {/* ── Floating Header ── */}
      <View 
        className="flex-row items-center justify-between px-4 pb-3 bg-surface z-10" 
        style={{ paddingTop: insets.top + 10 }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={10}
          className="w-10 h-10 items-start justify-center"
        >
          <ArrowLeft size={24} color={colors.textPrimary} strokeWidth={2} />
        </TouchableOpacity>
        <Text className="text-[18px] font-extrabold text-textPrimary">
          Product Details
        </Text>
        <TouchableOpacity
          hitSlop={10}
          onPress={() => Alert.alert("Edit", "Product editing coming soon.")}
          className="w-10 h-10 items-end justify-center"
        >
          <Pencil size={20} color={colors.textSecondary} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 160 }}
        className="flex-1 bg-surface"
      >
        {/* ── Hero Image ── */}
        <View className="px-4 mb-4">
          {product.image_url ? (
            <Image
              source={{ uri: product.image_url }}
              style={{ width: "100%", height: IMAGE_H, borderRadius: 20 }}
              contentFit="cover"
            />
          ) : (
            <View 
              style={{ width: "100%", height: IMAGE_H }}
              className="bg-background rounded-[20px] items-center justify-center border border-border"
            >
              <Package size={80} color={colors.textSecondary} strokeWidth={1} style={{ opacity: 0.4 }} />
            </View>
          )}
        </View>

        {/* ── Details ── */}
        <View className="px-5 pt-2">
          <Text className="text-[26px] font-black text-textPrimary mb-1 tracking-tight">
            {product.name}
          </Text>

          <View className="flex-row items-baseline mb-1 mt-2">
            <Text className="text-[34px] font-black text-textPrimary tracking-tighter mr-1">
              ₹{displayPrice.toLocaleString("en-IN")}
            </Text>
            <Text className="text-[16px] font-semibold text-textSecondary">
              / unit
            </Text>
          </View>

          <Text className="text-[14px] font-semibold text-textSecondary mb-4">
            MRP: ₹{displayMrp.toLocaleString("en-IN")} • ₹{displayPrice} / {fallbackUnit}
          </Text>

          <View className="self-start px-3 py-1.5 bg-background border border-border rounded-full mb-6">
            <Text className="text-[13px] font-extrabold text-textPrimary opacity-80">
              42 units available
            </Text>
          </View>

          {/* Variants — SELECT SIZE */}
          {product.variants.length > 0 && (
            <View className="mb-8">
              <Text className="text-[12px] font-extrabold text-textSecondary uppercase tracking-widest mb-3">
                SELECT SIZE
              </Text>
              <View className="flex-row flex-wrap gap-3">
                {product.variants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  return (
                    <TouchableOpacity
                      key={v.id}
                      onPress={() => setSelectedVariant(v)}
                      activeOpacity={0.8}
                      className={`rounded-[16px] p-4 min-w-[46%] flex-1 border-2 ${
                        isSelected 
                          ? "border-primary bg-successLight" 
                          : "border-border bg-surface"
                      }`}
                    >
                      <Text
                        className={`text-[15px] font-bold mb-1 ${
                          isSelected ? "text-textPrimary" : "text-textPrimary"
                        }`}
                      >
                        {v.variant_name}
                      </Text>
                      <Text
                        className={`text-[14px] font-extrabold ${
                          isSelected ? "text-primary" : "text-textSecondary"
                        }`}
                      >
                        ₹{v.price.toLocaleString("en-IN")}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Quantity stepper */}
          <View className="mb-4 items-center mt-2">
            <View className="flex-row items-center bg-background rounded-[24px] p-2 border border-border gap-6">
              <TouchableOpacity
                onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                activeOpacity={0.7}
                className="w-12 h-12 rounded-full bg-surface items-center justify-center shadow-sm"
              >
                <Minus size={20} color={colors.textPrimary} strokeWidth={2.5} />
              </TouchableOpacity>
              
              <View className="items-center justify-center min-w-[50px]">
                <Text className="text-[10px] font-extrabold text-textSecondary uppercase tracking-widest mb-0.5">
                  Quantity
                </Text>
                <Text className="text-[22px] font-black text-textPrimary">
                  {quantity}
                </Text>
              </View>
              
              <TouchableOpacity
                onPress={() => setQuantity((q) => q + 1)}
                activeOpacity={0.7}
                className="w-12 h-12 rounded-full bg-surface items-center justify-center shadow-sm"
              >
                <Plus size={20} color={colors.textPrimary} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ── Fixed Add to Bill CTA ── */}
      <View 
        className="absolute bottom-0 left-0 right-0 bg-surface px-5 pt-3 border-t border-border"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <Text className="text-[11px] font-extrabold text-textSecondary tracking-widest text-center mb-3">
          ADD TO BILL FOR SELECTED CUSTOMER
        </Text>
        <TouchableOpacity
          onPress={handleAddToBill}
          activeOpacity={0.85}
          className="flex-row items-center justify-center bg-success rounded-[20px] py-4 gap-2 mb-2"
        >
          <ShoppingCart size={22} color={colors.surface} strokeWidth={2} />
          <Text className="text-[18px] font-black text-surface tracking-tight">
            Add to Bill
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
