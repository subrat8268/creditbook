import { ProductVariant } from "@/src/api/products";
import { colors } from "@/src/utils/theme";
import { Package } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";

interface ProductCardProps {
  name: string;
  basePrice: number | null;
  variants?: ProductVariant[];
  onOptionsPress: () => void;
}

// Deterministic color from product name for icon background
const ICON_COLORS = [
  { bg: "#DCFCE7", icon: "#16A34A" },
  { bg: "#DBEAFE", icon: "#2563EB" },
  { bg: "#FEF3C7", icon: "#D97706" },
  { bg: "#FCE7F3", icon: "#DB2777" },
  { bg: "#EDE9FE", icon: "#7C3AED" },
  { bg: "#FFEDD5", icon: "#EA580C" },
];

function getIconColor(name: string) {
  const idx =
    name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) %
    ICON_COLORS.length;
  return ICON_COLORS[idx];
}

export default function ProductCard({
  name,
  basePrice,
  variants,
  onOptionsPress,
}: ProductCardProps) {
  const variantCount = variants?.length ?? 0;
  const displayPrice: number | null =
    variantCount > 0 ? Math.min(...variants!.map((v) => v.price)) : basePrice;

  // Determine unit label from first variant or fallback
  const unitLabel =
    variants && variants.length > 0 ? (variants[0].unit ?? "unit") : "unit";

  const { bg, icon: iconColor } = getIconColor(name);

  return (
    <TouchableOpacity
      onPress={onOptionsPress}
      activeOpacity={0.7}
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 16,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
      }}
    >
      {/* Colored icon box */}
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          backgroundColor: bg,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 14,
          flexShrink: 0,
        }}
      >
        <Package size={22} color={iconColor} strokeWidth={1.75} />
      </View>

      {/* Name + subtitle */}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 15,
            fontWeight: "700",
            color: colors.textPrimary,
            marginBottom: 3,
          }}
          numberOfLines={1}
        >
          {name}
        </Text>
        <Text style={{ fontSize: 13, color: colors.textSecondary }}>
          {displayPrice !== null
            ? `₹${displayPrice.toLocaleString("en-IN")} / ${unitLabel}`
            : "—"}
          {variantCount > 0 && (
            <Text style={{ color: colors.textSecondary }}>
              {"  •  "}
              {variantCount === 1 ? "1 variant" : `${variantCount} variants`}
            </Text>
          )}
        </Text>
      </View>

      {/* Price — large bold right side */}
      <Text
        style={{
          fontSize: 18,
          fontWeight: "800",
          color: colors.textPrimary,
        }}
      >
        {displayPrice !== null
          ? `₹${displayPrice.toLocaleString("en-IN")}`
          : "—"}
      </Text>
    </TouchableOpacity>
  );
}
