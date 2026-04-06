import { useRecordPayment } from "@/src/hooks/usePayments";
import { useAuthStore } from "@/src/store/authStore";
import { colors } from "@/src/utils/theme";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { Check, History } from "lucide-react-native";
import { forwardRef, useCallback, useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";

type PaymentMode = "Cash" | "UPI" | "NEFT" | "Draft" | "Cheque";

type Props = {
  onSuccess: () => void;
  orderId: string;
  balanceDue: number;
  customerId: string;
  customerName: string;
  onDismiss?: () => void;
};

const MODES: PaymentMode[] = ["Cash", "UPI", "NEFT", "Draft", "Cheque"];

// ── Avatar utilities ─────────────────────────────────────────────────────────
function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors.avatarPalette[Math.abs(hash) % colors.avatarPalette.length];
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

const RecordCustomerPaymentModal = forwardRef<BottomSheetModal, Props>(
  (
    { onSuccess, orderId, balanceDue, customerId, customerName, onDismiss },
    ref,
  ) => {
    const [amount, setAmount] = useState(String(balanceDue));
    const [mode, setMode] = useState<PaymentMode>("Cash");
    const [notes, setNotes] = useState("");
    const profile = useAuthStore((s) => s.profile);
    const { recordPayment, isRecording } = useRecordPayment(
      orderId,
      profile?.id,
      customerId,
    );

    const snapPoints = useMemo(() => ["75%", "90%"], []);

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

    // Sync default amount when balanceDue changes (e.g. parent rerenders or loads)
    useEffect(() => {
      setAmount(String(balanceDue));
      setMode("Cash");
      setNotes("");
    }, [balanceDue]);

    const parsedAmount = parseFloat(amount) || 0;
    const isFullPaid = parsedAmount >= balanceDue;

    const handleSubmit = async () => {
      const payAmount = isFullPaid ? balanceDue : parsedAmount;
      if (!isFullPaid && (!payAmount || payAmount <= 0)) {
        Alert.alert("Error", "Enter a valid amount.");
        return;
      }
      try {
        await recordPayment({
          amount: payAmount,
          mode,
          notes: notes.trim() || undefined,
        });
        setAmount(String(balanceDue));
        setMode("Cash");
        setNotes("");
        onSuccess();
        // Since we are using a ref from parent, the parent should call sheetRef.current?.dismiss() 
        // We trigger onSuccess so parent can manage state.
        if (ref && typeof ref !== "function" && ref.current) {
          ref.current.dismiss();
        }
      } catch (e: any) {
        Alert.alert("Error", e.message || "Failed to record payment.");
      }
    };

    const avatarColor = getAvatarColor(customerName);
    const initials = getInitials(customerName);

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        handleIndicatorStyle={{
          backgroundColor: colors.border,
          width: 40,
        }}
        backgroundStyle={{
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          backgroundColor: colors.surface,
        }}
        onDismiss={onDismiss}
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
          <Text className="text-xl font-bold mb-4 text-textPrimary">
            Record Payment
          </Text>

          {/* ── Customer card ── */}
          <View className="flex-row items-center px-4 py-3 rounded-2xl mb-5 bg-background">
            {/* Avatar */}
            <View
              className="rounded-full mr-3 items-center justify-center w-11 h-11"
              style={{ backgroundColor: avatarColor }}
            >
              <Text className="font-bold text-surface text-[15px]">
                {initials}
              </Text>
            </View>

            {/* Name + balance */}
            <View className="flex-1">
              <Text className="font-bold text-[15px] text-textPrimary">
                {customerName}
              </Text>
              <Text className="text-[13px] font-semibold text-danger">
                Balance: ₹{formatINR(balanceDue)}
              </Text>
            </View>

            {/* History icon */}
            <TouchableOpacity hitSlop={8} activeOpacity={0.7}>
              <History size={20} color={colors.primary} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* ── Amount Received ── */}
          <Text className="text-[13px] font-semibold mb-3 text-textPrimary">
            Amount Received
          </Text>

          {/* Large split amount row */}
          <View className="flex-row items-center pb-3 mb-1 border-b-2 border-primary">
            <Text className="text-3xl font-bold mr-2 text-textPrimary">₹</Text>
            <BottomSheetTextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={colors.textSecondary}
              className="flex-1 text-4xl font-extrabold text-textPrimary p-0"
            />
          </View>

          {/* Tap-to-fill full balance hint */}
          <TouchableOpacity
            onPress={() => setAmount(String(balanceDue))}
            activeOpacity={0.7}
            className="mb-5"
          >
            <Text className="text-[13px] font-semibold text-primary">
              Full balance: ₹{formatINR(balanceDue)}
            </Text>
          </TouchableOpacity>

          {/* ── Payment Mode ── */}
          <Text className="text-[13px] font-semibold mb-3 text-textPrimary">
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
                className={`px-5 py-2 rounded-full border ${
                  mode === m ? "bg-primary border-primary" : "bg-surface border-border"
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    mode === m ? "text-surface" : "text-textSecondary"
                  }`}
                >
                  {m}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* ── Notes (optional) ── */}
          <Text className="text-[13px] font-semibold mb-2 text-textPrimary">
            Notes (optional)
          </Text>
          <BottomSheetTextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Write a note about this payment..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            className="rounded-xl px-4 py-3 text-sm mb-6 border border-border bg-background text-textPrimary min-h-[80px]"
          />

          {/* ── Dynamic Action Button ── */}
          {isFullPaid ? (
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isRecording}
              activeOpacity={0.8}
              className={`flex-row items-center justify-center rounded-xl h-14 space-x-2 ${
                isRecording ? "bg-border shadow-none" : "bg-primary shadow-lg"
              }`}
            >
              <Text className="text-surface text-[15px] font-bold">
                {isRecording ? "Recording..." : "Mark Full Paid"}
              </Text>
              {!isRecording && <Check size={16} color={colors.surface} strokeWidth={3} />}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={parsedAmount <= 0 || isRecording}
              activeOpacity={0.8}
              className={`flex-row items-center justify-center rounded-xl h-14 ${
                parsedAmount <= 0 || isRecording ? "bg-border" : "bg-warning"
              }`}
            >
              <Text className={`text-[15px] font-bold ${parsedAmount <= 0 || isRecording ? "text-textSecondary" : "text-surface"}`}>
                {isRecording ? "Recording..." : "Record Partial Payment"}
              </Text>
            </TouchableOpacity>
          )}
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }
);

RecordCustomerPaymentModal.displayName = "RecordCustomerPaymentModal";

export default RecordCustomerPaymentModal;
