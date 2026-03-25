import { ProductVariant } from "@/src/api/products";
import { colors } from "@/src/utils/theme";
import { ChevronRight, Package } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";

interface ProductCardProps {
  name: string;
  basePrice: number | null;
  variants?: ProductVariant[];
  onOptionsPress: () => void;
}

export default function ProductCard({
  name,
  basePrice,
  variants,
  onOptionsPress,
}: ProductCardProps) {
  const variantCount = variants?.length ?? 0;
  // Display price: lowest variant price when variants exist, base_price as fallback,
  // null when neither is set (variant-only product with no variants added yet).
  const displayPrice: number | null =
    variantCount > 0 ? Math.min(...variants!.map((v) => v.price)) : basePrice;

  return (
    <TouchableOpacity
      onPress={onOptionsPress}
      activeOpacity={0.7}
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: colors.background,
      }}
    >
      {/* Icon box */}
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 10,
          backgroundColor: colors.background,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 14,
          flexShrink: 0,
        }}
      >
        <Package size={22} color={colors.textSecondary} strokeWidth={1.5} />
      </View>

      {/* Name + variant count */}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 15,
            fontWeight: "700",
            color: colors.textPrimary,
            marginBottom: 2,
          }}
          numberOfLines={1}
        >
          {name}
        </Text>
        <Text style={{ fontSize: 13, color: "#AEAEB2" }}>
          {variantCount === 1
            ? "1 variant"
            : variantCount > 1
              ? `${variantCount} variants`
              : "No variants"}
        </Text>
      </View>

      {/* Price + chevron */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
        <Text
          style={{
            fontSize: 15,
            fontWeight: "700",
            color: colors.textPrimary,
          }}
        >
          {displayPrice !== null
            ? `₹${displayPrice.toLocaleString("en-IN")}`
            : "—"}
        </Text>
        <ChevronRight size={16} color={"#AEAEB2"} strokeWidth={2} />
      </View>
    </TouchableOpacity>
  );
}
