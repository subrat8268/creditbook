import { X } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { colors } from "../../utils/theme";

interface OrderItemCardProps {
  id: string;
  name: string;
  variantName?: string;
  rate: number;
  quantity: number;
  onUpdateQuantity: (quantity: number) => void;
  /** When provided, the rate row becomes an inline editable TextInput. */
  onUpdateRate?: (rate: number) => void;
  onRemove: () => void;
}

export default function OrderItemCard({
  name,
  variantName,
  rate,
  quantity,
  onUpdateQuantity,
  onUpdateRate,
  onRemove,
}: OrderItemCardProps) {
  const subtotal = rate * quantity;
  const label =
    variantName && variantName !== "Base" ? `${name} (${variantName})` : name;

  // Local string state for the rate TextInput.
  const [rateStr, setRateStr] = useState(String(rate));
  // Sync if parent pushes a new rate value (e.g. after external updateRate call).
  useEffect(() => {
    setRateStr(String(rate));
  }, [rate]);

  const handleRateBlur = () => {
    const parsed = parseFloat(rateStr);
    if (!isNaN(parsed) && parsed > 0) {
      onUpdateRate?.(parsed);
      setRateStr(String(parsed));
    } else {
      // Revert to last valid rate.
      setRateStr(String(rate));
    }
  };

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

      {/* Rate row — editable TextInput when onUpdateRate is provided */}
      {onUpdateRate ? (
        <View className="flex-row items-center mb-2.5">
          <Text className="text-sm" style={{ color: colors.textSecondary }}>
            Rate: ₹
          </Text>
          <TextInput
            value={rateStr}
            onChangeText={setRateStr}
            onBlur={handleRateBlur}
            keyboardType="decimal-pad"
            style={{
              color: colors.textSecondary,
              fontSize: 14,
              padding: 0,
              minWidth: 50,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          />
        </View>
      ) : (
        <Text
          className="text-sm mb-2.5"
          style={{ color: colors.textSecondary }}
        >
          Rate: ₹{rate.toLocaleString("en-IN")}
        </Text>
      )}

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
