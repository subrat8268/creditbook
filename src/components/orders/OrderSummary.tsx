import React from "react";
import { colors } from "@/src/utils/theme";
import { Text, TextInput, View } from "react-native";

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
  const [loadingInput, setLoadingInput] = React.useState(
    loadingCharge > 0 ? loadingCharge.toString() : ""
  );
  const [taxInput, setTaxInput] = React.useState(
    taxPercent > 0 ? taxPercent.toString() : ""
  );

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
      {/* Subtotal */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <Text style={{ fontSize: 13, color: colors.textSecondary }}>Subtotal</Text>
        <Text style={{ fontSize: 13, color: colors.textSecondary }}>
          ₹{itemsTotal.toLocaleString("en-IN")}
        </Text>
      </View>

      {/* Loading Charge */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <Text style={{ fontSize: 13, color: colors.textSecondary }}>
          Loading Charge
        </Text>
        <TextInput
          style={{
            fontSize: 13,
            color: colors.textPrimary,
            textAlign: "right",
            minWidth: 80,
            padding: 4,
          }}
          value={loadingInput}
          onChangeText={handleLoadingChange}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      {/* GST Tax */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <Text style={{ fontSize: 13, color: colors.textSecondary }}>GST (%)</Text>
        <TextInput
          style={{
            fontSize: 13,
            color: colors.textPrimary,
            textAlign: "right",
            minWidth: 80,
            padding: 4,
          }}
          value={taxInput}
          onChangeText={handleTaxChange}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      {/* Tax Amount */}
      {taxAmount > 0 && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <Text style={{ fontSize: 13, color: colors.textSecondary }}>Tax</Text>
          <Text style={{ fontSize: 13, color: colors.textSecondary }}>
            ₹{taxAmount.toLocaleString("en-IN")}
          </Text>
        </View>
      )}

      {/* Previous Balance */}
      {previousBalance > 0 && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <Text style={{ fontSize: 13, color: colors.textSecondary }}>
            Previous Balance
          </Text>
          <Text style={{ fontSize: 13, color: colors.textSecondary }}>
            ₹{previousBalance.toLocaleString("en-IN")}
          </Text>
        </View>
      )}

      {/* Divider */}
      <View
        style={{
          height: 1,
          backgroundColor: colors.border,
          marginVertical: 8,
        }}
      />

      {/* Grand Total */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Text style={{ fontSize: 15, fontWeight: "600", color: colors.textPrimary }}>
          Grand Total
        </Text>
        <Text style={{ fontSize: 15, fontWeight: "600", color: colors.danger }}>
          ₹{grandTotal.toLocaleString("en-IN")}
        </Text>
      </View>
    </View>
  );
}