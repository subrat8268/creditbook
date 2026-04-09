import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { AlertTriangle } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { colors } from "../../utils/theme";
import Button from "../ui/Button";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Props {
  visible: boolean;
  balanceOwed: number;
  onClose: () => void;
  onSubmit: (data: {
    amount: number;
    payment_mode: string;
    notes?: string;
  }) => Promise<void>;
  loading?: boolean;
  supplierName?: string;
}

const PAYMENT_MODES = ["Cash", "UPI", "NEFT", "Draft", "Cheque"];

// ─── Avatar helpers ───────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  colors.danger,
  "#0D9488", // teal-600 — replaces amber (financial state reserved)
  colors.primary,
  "#4F9CFF",
  "#9B59B6",
  "#E91E8C",
  "#00BCD4",
  "#0284C7", // sky-600 — replaces orange (financial state reserved)
] as const;

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length >= 2)
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

function fmtINR(n: number) {
  return n.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function RecordPaymentMadeModal({
  visible,
  balanceOwed,
  onClose,
  onSubmit,
  loading,
  supplierName,
}: Props) {
  const [amount, setAmount] = useState(String(balanceOwed || ""));
  const [mode, setMode] = useState("NEFT");
  const [notes, setNotes] = useState("");

  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["85%"], []);
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    [],
  );

  useEffect(() => {
    if (visible) {
      sheetRef.current?.expand();
    } else {
      sheetRef.current?.close();
    }
  }, [visible]);

  const reset = () => {
    setAmount(String(balanceOwed || ""));
    setMode("NEFT");
    setNotes("");
  };

  const handleSubmit = async () => {
    const num = parseFloat(amount);
    if (!num || num <= 0) return;
    await onSubmit({
      amount: num,
      payment_mode: mode,
      notes: notes.trim() || undefined,
    });
    reset();
  };

  const parsedAmount = parseFloat(amount) || 0;
  const showWarning = parsedAmount > 0 && parsedAmount > balanceOwed;
  const isValid = parsedAmount > 0 && !showWarning;

  const avatarColor = supplierName
    ? getAvatarColor(supplierName)
    : colors.warning;
  const initials = supplierName ? getInitials(supplierName) : "?";

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      onChange={(idx) => {
        if (idx === -1) onClose();
      }}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      handleIndicatorStyle={{ backgroundColor: colors.border, width: 40 }}
      backgroundStyle={{ borderTopLeftRadius: 28, borderTopRightRadius: 28 }}
    >
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 4,
          paddingBottom: 12,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: "700",
            color: colors.textPrimary,
          }}
        >
          Pay Party
        </Text>
      </View>
      <BottomSheetScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 8 }}
      >
        {/* ── Party card ── */}
        {supplierName ? (
          <View
            className="flex-row items-center px-4 py-3 rounded-2xl mb-5"
            style={{ backgroundColor: colors.background }}
          >
            <View
              className="rounded-full mr-3 items-center justify-center"
              style={{ width: 44, height: 44, backgroundColor: avatarColor }}
            >
              <Text className="font-bold text-white" style={{ fontSize: 15 }}>
                {initials}
              </Text>
            </View>
            <View>
              <Text
                className="text-[15px] font-bold"
                style={{ color: colors.textPrimary }}
              >
                {supplierName}
              </Text>
              <Text
                className="text-[13px] font-semibold mt-0.5"
                style={{ color: colors.danger }}
              >
                You Owe: ₹{fmtINR(balanceOwed)}
              </Text>
            </View>
          </View>
        ) : null}

        {/* ── Amount Paying ── */}
        <Text
          className="text-[13px] font-semibold mb-2"
          style={{ color: colors.textPrimary }}
        >
          Amount Paying
        </Text>

        <View className="flex-row items-center mb-1">
          <Text
            className="font-bold mr-1"
            style={{ fontSize: 30, color: colors.danger }}
          >
            ₹
          </Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={colors.border}
            style={{
              fontSize: 36,
              fontWeight: "700",
              color: colors.textPrimary,
              flex: 1,
              padding: 0,
            }}
          />
        </View>

        {/* Underline */}
        <View
          className="h-px mb-2"
          style={{ backgroundColor: colors.border }}
        />

        {/* Full balance tap-to-fill */}
        <TouchableOpacity
          onPress={() => setAmount(String(balanceOwed))}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          className="mb-5 self-start"
        >
          <Text
            className="text-[13px] font-semibold"
            style={{ color: colors.primary }}
          >
            Full balance: ₹{fmtINR(balanceOwed)}
          </Text>
        </TouchableOpacity>

        {/* ── Payment Mode ── */}
        <Text
          className="text-[13px] font-semibold mb-2.5"
          style={{ color: colors.textSecondary }}
        >
          Payment Mode
        </Text>
        <View className="flex-row flex-wrap gap-2 mb-5">
          {PAYMENT_MODES.map((m) => (
            <TouchableOpacity
              key={m}
              onPress={() => setMode(m)}
              activeOpacity={0.75}
              className="px-4 py-2 rounded-full border"
              style={{
                backgroundColor:
                  mode === m ? colors.primary : "transparent",
                borderColor:
                  mode === m ? colors.primary : colors.border,
              }}
            >
              <Text
                className="text-[14px] font-semibold"
                style={{
                  color: mode === m ? "#FFFFFF" : colors.textSecondary,
                }}
              >
                {m}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Notes ── */}
        <Text
          className="text-[13px] font-semibold mb-2"
          style={{ color: colors.textSecondary }}
        >
          Notes (optional)
        </Text>
        <View
          className="border rounded-xl px-3 py-2.5 mb-4"
          style={{ borderColor: colors.border }}
        >
          <TextInput
            placeholder="e.g. Payment for Nov delivery #D-021"
            placeholderTextColor={"#AEAEB2"}
            value={notes}
            onChangeText={setNotes}
            className="text-sm"
            style={{ color: colors.textPrimary }}
          />
        </View>

        {/* ── Warning ── */}
        {showWarning && (
          <View
            className="flex-row items-center gap-2 px-3 py-2.5 rounded-xl mb-2"
            style={{ backgroundColor: colors.overdue.bg ?? "#FEE2E2" }}
          >
            <AlertTriangle
              size={16}
              color={colors.danger}
              strokeWidth={2}
            />
            <Text
              className="text-[13px] font-semibold"
              style={{ color: colors.danger }}
            >
              Amount exceeds balance (₹{fmtINR(balanceOwed)})
            </Text>
          </View>
        )}
      </BottomSheetScrollView>

      {/* ── Sticky CTA ── */}
      <View
        style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 }}
      >
        <Button
          title="Record Payment"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading || !isValid}
        />
      </View>
    </BottomSheet>
  );
}
