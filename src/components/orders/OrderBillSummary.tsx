import { useState } from "react";
import { ActivityIndicator, Text, TextInput, View } from "react-native";
import { colors } from "../../utils/theme";

interface OrderBillSummaryProps {
  itemsTotal: number;
  loadingCharge: number;
  taxPercent: number;
  taxAmount: number;
  previousBalance: number;
  grandTotal: number;
  isFetchingBalance?: boolean;
  onLoadingChargeChange: (value: number) => void;
  onTaxChange: (value: number) => void;
}

// ── Small charge input with prefix label ─────────────────────────────────────
function ChargeInput({
  label,
  suffix,
  value,
  onChange,
}: {
  label: string;
  suffix?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View className="flex-1">
      <Text
        className="text-sm font-semibold mb-2"
        style={{ color: colors.neutral[600] }}
      >
        {label}
      </Text>
      <View className="flex-row items-center">
        <TextInput
          value={value}
          onChangeText={onChange}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor={colors.neutral[300]}
          className="text-[16px] font-bold"
          style={{ color: colors.neutral[900], minWidth: 40 }}
        />
        {suffix ? (
          <Text
            className="text-[14px] ml-1"
            style={{ color: colors.neutral[500] }}
          >
            {suffix}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

// ── Summary row ───────────────────────────────────────────────────────────────
function SummaryRow({
  label,
  value,
  labelColor,
  valueColor,
  bold,
  large,
}: {
  label: string;
  value: string;
  labelColor?: string;
  valueColor?: string;
  bold?: boolean;
  large?: boolean;
}) {
  return (
    <View className="flex-row justify-between items-center mb-1.5">
      <Text
        style={{
          fontSize: large ? 16 : 14,
          fontWeight: bold ? "700" : "400",
          color: labelColor ?? colors.neutral[500],
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontSize: large ? 28 : 14,
          fontWeight: bold ? "700" : "500",
          color: valueColor ?? colors.neutral[700],
        }}
      >
        {value}
      </Text>
    </View>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function OrderBillSummary({
  itemsTotal,
  loadingCharge,
  taxPercent,
  taxAmount,
  previousBalance,
  grandTotal,
  isFetchingBalance = false,
  onLoadingChargeChange,
  onTaxChange,
}: OrderBillSummaryProps) {
  const [loadingInput, setLoadingInput] = useState(
    loadingCharge > 0 ? String(loadingCharge) : "",
  );
  const [taxInput, setTaxInput] = useState(
    taxPercent > 0 ? String(taxPercent) : "",
  );

  const handleLoadingChange = (text: string) => {
    setLoadingInput(text);
    onLoadingChargeChange(parseFloat(text) || 0);
  };

  const handleTaxChange = (text: string) => {
    setTaxInput(text);
    onTaxChange(Math.min(parseFloat(text) || 0, 100));
  };

  const fmtINR = (n: number) =>
    "₹" +
    n.toLocaleString("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });

  return (
    <>
      {/* ── Other Charges card ── */}
      <View
        className="rounded-2xl p-4 mb-3"
        style={{
          backgroundColor: colors.white,
          borderWidth: 1,
          borderColor: colors.neutral[100],
          shadowColor: colors.black,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.04,
          shadowRadius: 4,
          elevation: 1,
        }}
      >
        <Text
          className="text-[15px] font-bold mb-4"
          style={{ color: colors.neutral[900] }}
        >
          Other Charges
        </Text>
        <View className="flex-row gap-4">
          {/* GST */}
          <ChargeInput
            label="GST (%)"
            value={taxInput}
            onChange={handleTaxChange}
          />
          {/* Divider */}
          <View
            className="w-px self-stretch"
            style={{ backgroundColor: colors.neutral[200] }}
          />
          {/* Loading */}
          <ChargeInput
            label="Loading Charge"
            suffix="₹"
            value={loadingInput}
            onChange={handleLoadingChange}
          />
        </View>
      </View>

      {/* ── Summary card ── */}
      <View
        className="rounded-2xl p-4 mb-3"
        style={{
          backgroundColor: colors.white,
          borderWidth: 1,
          borderColor: colors.neutral[100],
          shadowColor: colors.black,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.04,
          shadowRadius: 4,
          elevation: 1,
        }}
      >
        <SummaryRow label="Items Total" value={fmtINR(itemsTotal)} />

        {taxAmount > 0 && (
          <SummaryRow
            label={`GST (${taxPercent}%)`}
            value={fmtINR(taxAmount)}
          />
        )}

        {loadingCharge > 0 && (
          <SummaryRow label="Loading" value={fmtINR(loadingCharge)} />
        )}

        {/* Previous Balance */}
        <View className="flex-row justify-between items-center mb-1.5">
          <Text className="text-sm" style={{ color: colors.neutral[500] }}>
            Previous Balance
          </Text>
          {isFetchingBalance ? (
            <ActivityIndicator size="small" color={colors.danger.DEFAULT} />
          ) : (
            <Text
              className="text-sm font-semibold"
              style={{ color: colors.danger.DEFAULT }}
            >
              {fmtINR(previousBalance)}
            </Text>
          )}
        </View>

        {/* Divider */}
        <View
          className="h-px my-2"
          style={{ backgroundColor: colors.neutral[100] }}
        />

        {/* Grand Total */}
        <SummaryRow
          label="Grand Total"
          value={fmtINR(grandTotal)}
          labelColor={colors.neutral[900]}
          valueColor={colors.neutral[900]}
          bold
          large
        />
      </View>
    </>
  );
}
