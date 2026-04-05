import { ProductVariant } from "@/src/api/products";
import { colors } from "@/src/utils/theme";
import { 
  Package, 
  Droplet, 
  LayoutGrid, 
  Layers, 
  Coffee,
  ShoppingBag
} from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";

interface ProductCardProps {
  name: string;
  basePrice: number | null;
  variants?: ProductVariant[];
  onPress?: () => void;
  onOptionsPress: () => void;
}

const ICON_THEMES = [
  { theme: "success", Icon: Package },
  { theme: "primary", Icon: Droplet },
  { theme: "warning", Icon: LayoutGrid },
  { theme: "danger", Icon: Layers },
  { theme: "blue", Icon: Coffee },
  { theme: "textPrimary", Icon: ShoppingBag }
];

function getThemeConfig(name: string) {
  const idx =
    name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) %
    ICON_THEMES.length;
  return ICON_THEMES[idx];
}

export default function ProductCard({
  name,
  basePrice,
  variants,
  onPress,
  onOptionsPress,
}: ProductCardProps) {
  const variantCount = variants?.length ?? 0;
  const displayPrice: number | null =
    variantCount > 0 ? Math.min(...variants!.map((v) => v.price)) : basePrice;

  const unitLabel =
    variants && variants.length > 0 ? (variants[0].unit ?? "unit") : "unit";

  const { theme, Icon } = getThemeConfig(name);
  
  // Maps strictly to theme tokens — no raw hex
  const getThemeClasses = (themeMode: string) => {
    switch (themeMode) {
      case 'success':
        return { bg: "bg-successLight", text: "text-success", iconColor: colors.primary };
      case 'warning':
        return { bg: "bg-warningBg", text: "text-warning", iconColor: colors.warning };
      case 'danger':
        return { bg: "bg-dangerBg", text: "text-danger", iconColor: colors.danger };
      case 'blue':
        return { bg: "bg-successBg", text: "text-primaryDark", iconColor: colors.primaryDark };
      case 'textPrimary':
        return { bg: "bg-surface", text: "text-textPrimary", iconColor: colors.textPrimary, border: "border border-border" };
      case 'primary':
      default:
        return { bg: "bg-primaryLight", text: "text-primary", iconColor: colors.primary };
    }
  };

  const themeClass = getThemeClasses(theme);

  return (
    <TouchableOpacity
      onPress={onPress ?? onOptionsPress}
      onLongPress={onPress ? onOptionsPress : undefined}
      activeOpacity={0.8}
      className={`flex-row items-center bg-surface rounded-[20px] p-4 mb-4 shadow-sm ${themeClass.border || ''}`}
      style={{
        shadowColor: colors.textPrimary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <View
        className={`w-14 h-14 rounded-2xl items-center justify-center mr-4 shrink-0 ${themeClass.bg}`}
      >
        <Icon size={26} color={themeClass.iconColor} strokeWidth={2.5} />
      </View>

      <View className="flex-1 mr-2">
        <Text
          className="text-[16px] font-bold text-textPrimary mb-1"
          numberOfLines={1}
        >
          {name}
        </Text>
        <Text className="text-[13px] font-semibold text-textSecondary opacity-80">
          {displayPrice !== null
            ? `₹${displayPrice.toLocaleString("en-IN")} / ${unitLabel}`
            : "—"}
          {variantCount > 0 && (
            <Text className="text-textSecondary opacity-80">
              {"  •  "}
              {variantCount === 1 ? "1 variant" : `${variantCount} variants`}
            </Text>
          )}
        </Text>
      </View>

      <Text className="text-[20px] font-black text-textPrimary tracking-tight">
        {displayPrice !== null
          ? `₹${displayPrice.toLocaleString("en-IN")}`
          : "—"}
      </Text>
    </TouchableOpacity>
  );
}
