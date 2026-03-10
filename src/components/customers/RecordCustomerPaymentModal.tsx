import { recordPayment } from "@/src/api/orders";
import { useAuthStore } from "@/src/store/authStore";
import { colors } from "@/src/utils/theme";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useQueryClient } from "@tanstack/react-query";
import { Check, History } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Button from "../ui/Button";

type PaymentMode = "Cash" | "UPI" | "NEFT" | "Draft" | "Cheque";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  orderId: string;
  balanceDue: number;
  customerId: string;
  /** Customer's display name — used to render the avatar card */
  customerName: string;
};

const MODES: PaymentMode[] = ["Cash", "UPI", "NEFT", "Draft", "Cheque"];

// ── Avatar utilities ─────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  colors.danger.DEFAULT,
  colors.warning.DEFAULT,
  colors.primary.DEFAULT,
  colors.info.DEFAULT,
  "#9B59B6",
  "#E91E8C",
  "#00BCD4",
  "#FF5722",
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

function formatINR(n: number) {
  return n.toLocaleString("en-IN", { minimumFractionDigits: 0 });
}
// ─────────────────────────────────────────────────────────────────────────────

export default function RecordCustomerPaymentModal({
  visible,
  onClose,
  onSuccess,
  orderId,
  balanceDue,
  customerId,
  customerName,
}: Props) {
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState<PaymentMode>("Cash");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const profile = useAuthStore((s) => s.profile);
  const queryClient = useQueryClient();

  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["75%"], []);

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
      // Pre-fill amount with full balance
      setAmount(String(balanceDue));
      setMode("Cash");
      setNotes("");
      sheetRef.current?.expand();
    } else {
      sheetRef.current?.close();
    }
  }, [visible, balanceDue]);

  const handleSubmit = async (markFull: boolean) => {
    const payAmount = markFull ? balanceDue : parseFloat(amount);
    if (!markFull && (!payAmount || payAmount <= 0)) {
      Alert.alert("Error", "Enter a valid amount.");
      return;
    }
    if (!markFull && payAmount > balanceDue) {
      Alert.alert("Error", "Amount exceeds balance due.");
      return;
    }
    if (!profile?.id) return;
    setLoading(true);
    try {
      await recordPayment(
        orderId,
        profile.id,
        markFull ? balanceDue : payAmount,
        mode,
        markFull,
        notes.trim() || undefined,
      );
      queryClient.invalidateQueries({
        queryKey: ["customerDetail", customerId],
      });
      queryClient.invalidateQueries({
        queryKey: ["customers", profile.id],
        exact: false,
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard", profile.id] });
      setAmount("");
      setMode("Cash");
      setNotes("");
      onSuccess();
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to record payment.");
    } finally {
      setLoading(false);
    }
  };

  const avatarColor = getAvatarColor(customerName);
  const initials = getInitials(customerName);
  const parsedAmount = parseFloat(amount) || 0;

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      onClose={onClose}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      handleIndicatorStyle={{
        backgroundColor: colors.neutral[300],
        width: 40,
      }}
      backgroundStyle={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
    >
      <BottomSheetScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 40,
          paddingTop: 4,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Title ── */}
        <Text
          className="text-[20px] font-bold mb-4"
          style={{ color: colors.neutral[900] }}
        >
          Record Payment
        </Text>

        {/* ── Customer card ── */}
        <View
          className="flex-row items-center px-4 py-3 rounded-2xl mb-5"
          style={{ backgroundColor: colors.neutral[100] }}
        >
          {/* Avatar */}
          <View
            className="rounded-full mr-3 items-center justify-center"
            style={{ width: 44, height: 44, backgroundColor: avatarColor }}
          >
            <Text className="font-bold text-white" style={{ fontSize: 15 }}>
              {initials}
            </Text>
          </View>

          {/* Name + balance */}
          <View className="flex-1">
            <Text
              className="font-bold text-[15px]"
              style={{ color: colors.neutral[900] }}
            >
              {customerName}
            </Text>
            <Text
              className="text-[13px] font-semibold"
              style={{ color: colors.danger.DEFAULT }}
            >
              Balance: ₹{formatINR(balanceDue)}
            </Text>
          </View>

          {/* History icon */}
          <TouchableOpacity hitSlop={8} activeOpacity={0.7}>
            <History size={20} color={colors.primary.DEFAULT} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* ── Amount Received ── */}
        <Text
          className="text-[13px] font-semibold mb-3"
          style={{ color: colors.neutral[600] }}
        >
          Amount Received
        </Text>

        {/* Large split amount row */}
        <View
          className="flex-row items-center pb-3 mb-1"
          style={{
            borderBottomWidth: 2,
            borderBottomColor: colors.primary.DEFAULT,
          }}
        >
          <Text
            className="text-[28px] font-bold mr-2"
            style={{ color: colors.neutral[900] }}
          >
            ₹
          </Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor={colors.neutral[400]}
            style={{
              flex: 1,
              fontSize: 36,
              fontWeight: "800",
              color: colors.neutral[900],
              padding: 0,
            }}
          />
        </View>

        {/* Tap-to-fill full balance hint */}
        <TouchableOpacity
          onPress={() => setAmount(String(balanceDue))}
          activeOpacity={0.7}
          className="mb-5"
        >
          <Text
            className="text-[13px] font-semibold"
            style={{ color: colors.primary.DEFAULT }}
          >
            Full balance: ₹{formatINR(balanceDue)}
          </Text>
        </TouchableOpacity>

        {/* ── Payment Mode ── */}
        <Text
          className="text-[13px] font-semibold mb-3"
          style={{ color: colors.neutral[600] }}
        >
          Payment Mode
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingBottom: 4 }}
          className="mb-5"
        >
          {MODES.map((m) => (
            <TouchableOpacity
              key={m}
              onPress={() => setMode(m)}
              activeOpacity={0.75}
              className="px-5 py-2 rounded-full border"
              style={{
                backgroundColor:
                  mode === m ? colors.primary.DEFAULT : "#FFFFFF",
                borderColor:
                  mode === m ? colors.primary.DEFAULT : colors.neutral[200],
              }}
            >
              <Text
                className="text-[14px] font-semibold"
                style={{
                  color: mode === m ? "#FFFFFF" : colors.neutral[700],
                }}
              >
                {m}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Notes (optional) ── */}
        <Text
          className="text-[13px] font-semibold mb-2"
          style={{ color: colors.neutral[600] }}
        >
          Notes (optional)
        </Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Write a note about this payment..."
          placeholderTextColor={colors.neutral[400]}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          className="rounded-xl px-4 py-3 text-[14px] mb-6"
          style={{
            borderWidth: 1,
            borderColor: colors.neutral[200],
            backgroundColor: colors.neutral[100],
            color: colors.neutral[900],
            minHeight: 80,
          }}
        />

        {/* ── Footer buttons ── */}
        <View className="flex-row gap-3">
          <Button
            variant="outline"
            title="Record Partial"
            onPress={() => handleSubmit(false)}
            loading={loading}
            disabled={parsedAmount <= 0 || loading}
            className="flex-1"
          />
          <TouchableOpacity
            onPress={() => handleSubmit(true)}
            disabled={loading}
            activeOpacity={0.8}
            className="flex-1 flex-row items-center justify-center rounded-xl h-14"
            style={{
              backgroundColor: loading
                ? colors.neutral[200]
                : colors.primary.DEFAULT,
              gap: 6,
              shadowColor: colors.primary.DEFAULT,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.25,
              shadowRadius: 10,
              elevation: 6,
            }}
          >
            <Text className="text-white text-[15px] font-bold">
              Mark Full Paid
            </Text>
            <Check size={16} color="#FFFFFF" strokeWidth={3} />
          </TouchableOpacity>
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}
