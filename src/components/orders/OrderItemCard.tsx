import { X } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";
import { colors } from "../../utils/theme";

interface OrderItemCardProps {
  id: string;
  name: string;
  variantName?: string;
  price: number;
  quantity: number;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
}

export default function OrderItemCard({
  name,
  variantName,
  price,
  quantity,
  onUpdateQuantity,
  onRemove,
}: OrderItemCardProps) {
  const subtotal = price * quantity;
  const label =
    variantName && variantName !== "Base" ? `${name} (${variantName})` : name;

  return (
    <View className="mb-4">
      {/* Name + × remove */}
      <View className="flex-row items-start justify-between mb-0.5">
        <Text
          className="flex-1 text-[15px] font-bold mr-2"
          style={{ color: colors.textPrimary }}
          numberOfLines={2}
        >
          {label}
        </Text>
        <TouchableOpacity
          onPress={onRemove}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <X size={16} color={"#AEAEB2"} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* Rate subtitle */}
      <Text className="text-sm mb-2.5" style={{ color: colors.textSecondary }}>
        Rate: ₹{price.toLocaleString("en-IN")}
      </Text>

      {/* Stepper + subtotal */}
      <View className="flex-row items-center justify-between">
        {/* Bordered pill stepper */}
        <View
          className="flex-row items-center rounded-lg overflow-hidden border"
          style={{ borderColor: colors.border }}
        >
          <TouchableOpacity
            onPress={() =>
              quantity > 1 ? onUpdateQuantity(quantity - 1) : onRemove()
            }
            className="px-3.5 py-1.5"
            hitSlop={{ top: 4, bottom: 4 }}
          >
            <Text
              className="text-[18px] font-semibold"
              style={{ color: colors.textSecondary }}
            >
              −
            </Text>
          </TouchableOpacity>

          <Text
            className="px-3 text-[15px] font-bold border-l border-r"
            style={{
              borderColor: colors.border,
              color: colors.textPrimary,
            }}
          >
            {String(quantity).padStart(2, "0")}
          </Text>

          <TouchableOpacity
            onPress={() => onUpdateQuantity(quantity + 1)}
            className="px-3.5 py-1.5"
            hitSlop={{ top: 4, bottom: 4 }}
          >
            <Text
              className="text-[18px] font-semibold"
              style={{ color: colors.textSecondary }}
            >
              +
            </Text>
          </TouchableOpacity>
        </View>

        {/* Subtotal */}
        <Text
          className="text-[16px] font-bold"
          style={{ color: colors.textPrimary }}
        >
          ₹{subtotal.toLocaleString("en-IN")}
        </Text>
      </View>
    </View>
  );
}
