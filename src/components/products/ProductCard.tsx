import { ProductVariant } from "@/src/api/products";
import { colors } from "@/src/utils/theme";
import { ChevronRight, Package } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";

interface ProductCardProps {
  name: string;
  basePrice: number;
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
  // Display price: if variants exist, show lowest variant price; otherwise base price
  const displayPrice =
    variantCount > 0 ? Math.min(...variants!.map((v) => v.price)) : basePrice;

  return (
    <TouchableOpacity
      onPress={onOptionsPress}
      activeOpacity={0.7}
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.white,
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: colors.neutral[100],
      }}
    >
      {/* Icon box */}
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 10,
          backgroundColor: colors.neutral[100],
          alignItems: "center",
          justifyContent: "center",
          marginRight: 14,
          flexShrink: 0,
        }}
      >
        <Package size={22} color={colors.neutral[500]} strokeWidth={1.5} />
      </View>

      {/* Name + variant count */}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 15,
            fontWeight: "700",
            color: colors.neutral[900],
            marginBottom: 2,
          }}
          numberOfLines={1}
        >
          {name}
        </Text>
        <Text style={{ fontSize: 13, color: colors.neutral[400] }}>
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
            color: colors.neutral[900],
          }}
        >
          ₹{displayPrice.toLocaleString("en-IN")}
        </Text>
        <ChevronRight size={16} color={colors.neutral[400]} strokeWidth={2} />
      </View>
    </TouchableOpacity>
  );
}
