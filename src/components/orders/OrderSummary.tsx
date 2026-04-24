import Input from "@/src/components/ui/Input";
import { colors, spacing, typography } from "@/src/utils/theme";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

interface OrderSummaryProps {
  itemsTotal: number;
  loadingCharge: number;
  taxPercent: number;
  taxAmount: number;
  previousBalance: number;
  grandTotal: number;
  onLoadingChargeChange?: (value: number) => void;
  onTaxChange?: (value: number) => void;
}

export default function OrderSummary({
  itemsTotal,
  loadingCharge,
  taxPercent,
  taxAmount,
  previousBalance,
  grandTotal,
  onLoadingChargeChange,
  onTaxChange,
}: OrderSummaryProps) {
  const [loadingInput, setLoadingInput] = useState(
    loadingCharge > 0 ? loadingCharge.toString() : "",
  );
  const [taxInput, setTaxInput] = useState(taxPercent > 0 ? taxPercent.toString() : "");

  const handleLoadingChange = (text: string) => {
    setLoadingInput(text);
    const value = parseFloat(text) || 0;
    onLoadingChargeChange?.(value);
  };

  const handleTaxChange = (text: string) => {
    setTaxInput(text);
    const value = parseFloat(text) || 0;
    onTaxChange?.(value);
  };

  return (
    <View>
      <View style={styles.row}>
        <Text style={styles.label}>Subtotal</Text>
        <Text style={styles.value}>₹{itemsTotal.toLocaleString("en-IN")}</Text>
      </View>

      <View style={styles.inputRow}>
        <Text style={styles.label}>Loading Charge</Text>
        <Input
          placeholder="0"
          value={loadingInput}
          onChangeText={handleLoadingChange}
          keyboardType="numeric"
          textAlign="right"
          containerStyle={styles.smallInputContainer}
          inputStyle={styles.smallInputText}
          variant="white"
        />
      </View>

      <View style={styles.inputRow}>
        <Text style={styles.label}>GST (%)</Text>
        <Input
          placeholder="0"
          value={taxInput}
          onChangeText={handleTaxChange}
          keyboardType="numeric"
          textAlign="right"
          containerStyle={styles.smallInputContainer}
          inputStyle={styles.smallInputText}
          variant="white"
        />
      </View>

      {taxAmount > 0 ? (
        <View style={styles.row}>
          <Text style={styles.label}>Tax</Text>
          <Text style={styles.value}>₹{taxAmount.toLocaleString("en-IN")}</Text>
        </View>
      ) : null}

      {previousBalance > 0 ? (
        <View style={styles.row}>
          <Text style={styles.label}>Previous Balance</Text>
          <Text style={styles.value}>₹{previousBalance.toLocaleString("en-IN")}</Text>
        </View>
      ) : null}

      <View style={styles.divider} />

      <View style={styles.row}>
        <Text style={styles.totalLabel}>Grand Total</Text>
        <Text style={styles.totalValue}>₹{grandTotal.toLocaleString("en-IN")}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  value: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  smallInputContainer: {
    minWidth: 100,
    maxWidth: 120,
    minHeight: 36,
    paddingHorizontal: spacing.sm,
  },
  smallInputText: {
    fontSize: 13,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  totalLabel: {
    ...typography.body,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  totalValue: {
    ...typography.body,
    fontWeight: "600",
    color: colors.danger,
  },
});
