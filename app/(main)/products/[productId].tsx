import { Product, ProductVariant } from "@/src/api/products";
import { colors, spacing } from "@/src/utils/theme";
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
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_W } = Dimensions.get("window");
const IMAGE_H = SCREEN_W * 0.65;

// ── Helpers ──────────────────────────────────────────────
const ICON_COLORS = [
  { bg: "#DCFCE7", icon: "#16A34A" },
  { bg: "#DBEAFE", icon: "#2563EB" },
  { bg: "#FEF3C7", icon: "#D97706" },
  { bg: "#FCE7F3", icon: "#DB2777" },
  { bg: "#EDE9FE", icon: "#7C3AED" },
  { bg: "#FFEDD5", icon: "#EA580C" },
];
function iconColor(name: string) {
  const idx =
    name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) %
    ICON_COLORS.length;
  return ICON_COLORS[idx];
}

// ── Screen ────────────────────────────────────────────────
export default function ProductDetailsScreen() {
  const router = useRouter();
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
      <SafeAreaView
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
      >
        <Text style={{ color: colors.textSecondary }}>Product not found.</Text>
      </SafeAreaView>
    );
  }

  const displayPrice = selectedVariant?.price ?? product.base_price ?? 0;
  const { bg, icon } = iconColor(product.name);
  const hasImage = !!product.image_url;

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
    <SafeAreaView style={s.root} edges={["top", "left", "right"]}>
      {/* ── Floating Header ── */}
      <View style={s.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={s.headerBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ArrowLeft size={22} color={colors.textPrimary} strokeWidth={1.75} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Product Details</Text>
        <TouchableOpacity
          style={s.headerBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          onPress={() => router.back()}
        >
          <Pencil size={20} color={colors.textSecondary} strokeWidth={1.75} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* ── Hero Image / Placeholder ── */}
        {hasImage ? (
          <Image
            source={{ uri: product.image_url! }}
            style={{ width: SCREEN_W, height: IMAGE_H }}
            contentFit="cover"
          />
        ) : (
          <View
            style={[
              s.imagePlaceholder,
              { height: IMAGE_H, backgroundColor: bg },
            ]}
          >
            <Package size={80} color={icon} strokeWidth={1.25} />
          </View>
        )}

        {/* ── Details ── */}
        <View style={s.details}>
          {/* Name */}
          <Text style={s.productName}>{product.name}</Text>

          {/* Price */}
          <View style={s.priceRow}>
            <Text style={s.price}>₹{displayPrice.toLocaleString("en-IN")}</Text>
            <Text style={s.priceUnit}> / unit</Text>
          </View>

          {/* Category badge */}
          {!!product.category && product.category !== "General" && (
            <View style={s.categoryBadge}>
              <Text style={s.categoryText}>{product.category}</Text>
            </View>
          )}

          {/* Variants — SELECT SIZE */}
          {product.variants.length > 0 && (
            <View style={s.variantSection}>
              <Text style={s.sectionLabel}>SELECT SIZE</Text>
              <View style={s.variantGrid}>
                {product.variants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  return (
                    <TouchableOpacity
                      key={v.id}
                      onPress={() => setSelectedVariant(v)}
                      activeOpacity={0.75}
                      style={[
                        s.variantChip,
                        isSelected && s.variantChipSelected,
                      ]}
                    >
                      <Text
                        style={[
                          s.variantChipName,
                          isSelected && s.variantChipNameSelected,
                        ]}
                      >
                        {v.variant_name}
                      </Text>
                      <Text
                        style={[
                          s.variantChipPrice,
                          isSelected && s.variantChipPriceSelected,
                        ]}
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
          <View style={s.quantitySection}>
            <Text style={s.sectionLabel}>QUANTITY</Text>
            <View style={s.stepper}>
              <TouchableOpacity
                style={s.stepperBtn}
                onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                activeOpacity={0.7}
              >
                <Minus size={18} color={colors.textPrimary} strokeWidth={2} />
              </TouchableOpacity>
              <Text style={s.stepperValue}>{quantity}</Text>
              <TouchableOpacity
                style={s.stepperBtn}
                onPress={() => setQuantity((q) => q + 1)}
                activeOpacity={0.7}
              >
                <Plus size={18} color={colors.textPrimary} strokeWidth={2} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Sub-label */}
          <Text style={s.addToBillLabel}>
            ADD TO BILL FOR SELECTED CUSTOMER
          </Text>
        </View>
      </ScrollView>

      {/* ── Fixed Add to Bill CTA ── */}
      <View style={s.ctaContainer}>
        <TouchableOpacity
          style={s.ctaBtn}
          onPress={handleAddToBill}
          activeOpacity={0.85}
        >
          <ShoppingCart size={20} color={colors.surface} strokeWidth={2} />
          <Text style={s.ctaBtnText}>Add to Bill</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  imagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  details: {
    paddingHorizontal: spacing.screenPadding,
    paddingTop: 20,
  },
  productName: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 14,
  },
  price: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  priceUnit: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#F0FDF4",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 20,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
  },
  variantSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textSecondary,
    letterSpacing: 1,
    marginBottom: 12,
  },
  variantGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  variantChip: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: "45%",
    flex: 1,
  },
  variantChipSelected: {
    borderColor: colors.primary,
    backgroundColor: "#F0FDF4",
  },
  variantChipName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 2,
  },
  variantChipNameSelected: {
    color: colors.primaryDark,
  },
  variantChipPrice: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  variantChipPriceSelected: {
    color: colors.primary,
  },
  quantitySection: {
    marginBottom: 24,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 0,
    alignSelf: "flex-start",
  },
  stepperBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  stepperValue: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    minWidth: 60,
    textAlign: "center",
  },
  addToBillLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textSecondary,
    letterSpacing: 0.8,
    textAlign: "center",
    marginBottom: 12,
  },
  ctaContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.lg,
    paddingTop: 12,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 17,
  },
  ctaBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.surface,
  },
});
