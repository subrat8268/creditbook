import Input from "@/src/components/ui/Input";
import { colors, spacing, typography } from "@/src/utils/theme";
import { Minus, Plus, Trash2 } from "lucide-react-native";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

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
  const [rateInput, setRateInput] = useState(rate > 0 ? rate.toString() : "");

  const subtotal = rate * quantity;

  const handleRateChange = (text: string) => {
    setRateInput(text);
    const value = parseFloat(text) || 0;
    onUpdateRate(value);
  };

  return (
    <View>
      <View style={styles.titleWrap}>
        <Text style={styles.title}>{name}</Text>
        {variantName ? <Text style={styles.subtitle}>{variantName}</Text> : null}
      </View>

      <View style={styles.row}>
        <View style={styles.rateWrap}>
          <Text style={styles.metaLabel}>Rate (₹)</Text>
          <Input
            placeholder="0"
            value={rateInput}
            onChangeText={handleRateChange}
            keyboardType="numeric"
            variant="neutral"
            containerStyle={styles.rateInputContainer}
            inputStyle={styles.rateInput}
          />
        </View>

        <View style={styles.qtyWrap}>
          <Pressable
            onPress={() => quantity > 1 && onUpdateQuantity(quantity - 1)}
            disabled={quantity <= 1}
            style={({ pressed }) => [
              styles.qtyButton,
              quantity <= 1 ? styles.disabled : null,
              pressed ? styles.pressed : null,
            ]}
          >
            <Minus size={16} color={colors.textPrimary} />
          </Pressable>

          <Text style={styles.qtyText}>{quantity}</Text>

          <Pressable
            onPress={() => onUpdateQuantity(quantity + 1)}
            style={({ pressed }) => [styles.qtyButton, pressed ? styles.pressed : null]}
          >
            <Plus size={16} color={colors.primary} />
          </Pressable>
        </View>

        <View style={styles.subtotalWrap}>
          <Text style={styles.metaLabel}>Subtotal</Text>
          <Text style={styles.subtotalText}>₹{subtotal.toLocaleString("en-IN")}</Text>
        </View>

        <Pressable onPress={onRemove} style={({ pressed }) => [styles.removeButton, pressed ? styles.pressed : null]}>
          <Trash2 size={18} color={colors.danger} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  titleWrap: {
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.body,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rateWrap: {
    flex: 1,
  },
  metaLabel: {
    ...typography.small,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  rateInputContainer: {
    minWidth: 84,
  },
  rateInput: {
    fontSize: 14,
  },
  qtyWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: 6,
    marginHorizontal: spacing.md,
  },
  qtyButton: {
    padding: spacing.sm,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.75,
  },
  qtyText: {
    ...typography.body,
    fontWeight: "600",
    color: colors.textPrimary,
    minWidth: 30,
    textAlign: "center",
  },
  subtotalWrap: {
    alignItems: "flex-end",
    minWidth: 80,
  },
  subtotalText: {
    ...typography.body,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  removeButton: {
    padding: spacing.sm,
    marginLeft: spacing.sm,
  },
});
