import { colors } from "@/src/utils/theme";
import { Minus, Plus, Trash2 } from "lucide-react-native";
import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

interface OrderItemCardProps {
  id: string;
  name: string;
  variantName?: string;
  rate: number;
  quantity: number;
  onUpdateQuantity: (quantity: number) => void;
  onUpdateRate: (rate: number) => void;
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
  const [rateInput, setRateInput] = React.useState(rate > 0 ? rate.toString() : "");

  const handleQuantityDecrease = () => {
    if (quantity > 1) {
      onUpdateQuantity(quantity - 1);
    }
  };

  const handleQuantityIncrease = () => {
    onUpdateQuantity(quantity + 1);
  };

  const handleRateChange = (text: string) => {
    setRateInput(text);
    const value = parseFloat(text) || 0;
    onUpdateRate(value);
  };

  const subtotal = rate * quantity;

  return (
    <View>
      {/* Item Name */}
      <View style={{ marginBottom: 8 }}>
        <Text
          style={{
            fontSize: 15,
            fontWeight: "600",
            color: colors.textPrimary,
          }}
        >
          {name}
        </Text>
        {variantName && (
          <Text style={{ fontSize: 13, color: colors.textSecondary }}>
            {variantName}
          </Text>
        )}
      </View>

      {/* Rate and Quantity Row */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Rate Input */}
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 11, color: colors.textSecondary, marginBottom: 2 }}>
            Rate (₹)
          </Text>
          <TextInput
            style={{
              fontSize: 14,
              color: colors.textPrimary,
              padding: 8,
              backgroundColor: colors.background,
              borderRadius: 6,
              minWidth: 80,
            }}
            value={rateInput}
            onChangeText={handleRateChange}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        {/* Quantity Controls */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.background,
            borderRadius: 6,
            marginHorizontal: 12,
          }}
        >
          <TouchableOpacity
            onPress={handleQuantityDecrease}
            disabled={quantity <= 1}
            style={{
              padding: 8,
              opacity: quantity <= 1 ? 0.5 : 1,
            }}
          >
            <Minus size={16} color={colors.textPrimary} />
          </TouchableOpacity>

          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: colors.textPrimary,
              minWidth: 30,
              textAlign: "center",
            }}
          >
            {quantity}
          </Text>

          <TouchableOpacity onPress={handleQuantityIncrease} style={{ padding: 8 }}>
            <Plus size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Subtotal */}
        <View style={{ alignItems: "flex-end", minWidth: 80 }}>
          <Text style={{ fontSize: 11, color: colors.textSecondary, marginBottom: 2 }}>
            Subtotal
          </Text>
          <Text style={{ fontSize: 15, fontWeight: "600", color: colors.textPrimary }}>
            ₹{subtotal.toLocaleString("en-IN")}
          </Text>
        </View>

        {/* Remove Button */}
        <TouchableOpacity
          onPress={onRemove}
          style={{ padding: 8, marginLeft: 8 }}
        >
          <Trash2 size={18} color={colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
