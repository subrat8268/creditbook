import { useRecordPayment } from "@/src/hooks/usePayments";
import { useAuthStore } from "@/src/store/authStore";
import BaseBottomSheet from "@/src/components/layer2/BaseBottomSheet";
import Avatar from "@/src/components/ui/Avatar";
import Button from "@/src/components/ui/Button";
import Input from "@/src/components/ui/Input";
import MoneyAmount from "@/src/components/ui/MoneyAmount";
import { useTheme } from "@/src/utils/ThemeProvider";
import { buildPaymentShareMessage } from "@/src/utils/shareTemplates";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Check } from "lucide-react-native";
import { forwardRef, useEffect, useState } from "react";
import { Alert, ScrollView, Share, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";

type PaymentMode = "Cash" | "UPI" | "NEFT" | "Draft" | "Cheque";

type Props = {
  onSuccess: () => void;
  orderId: string;
  balanceDue: number;
  customerId: string;
  customerName: string;
  onDismiss?: () => void;
  initialAmount?: number;
};

const MODES: PaymentMode[] = ["Cash", "UPI", "NEFT", "Draft", "Cheque"];

const RecordCustomerPaymentModal = forwardRef<BottomSheetModal, Props>(
  (
    { onSuccess, orderId, balanceDue, customerId, customerName, onDismiss, initialAmount },
    ref,
  ) => {
    const { colors, radius, spacing, typography } = useTheme();
    const { i18n } = useTranslation();
    const [amount, setAmount] = useState(String(initialAmount ?? balanceDue));
    const [mode, setMode] = useState<PaymentMode>("Cash");
    const [notes, setNotes] = useState("");
    const profile = useAuthStore((s) => s.profile);
    const { recordPayment, isRecording } = useRecordPayment(
      orderId,
      profile?.id,
      customerId,
    );

    // Sync default amount when balanceDue changes (e.g. parent rerenders or loads)
    useEffect(() => {
      setAmount(String(initialAmount ?? balanceDue));
      setMode("Cash");
      setNotes("");
    }, [balanceDue, initialAmount]);

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

        const locale = i18n.language?.toLowerCase().startsWith("hi") ? "hi" : "en";
        await Share.share({
          message: buildPaymentShareMessage({
            locale,
            customerName,
            amount: payAmount,
            paymentDate: new Date(),
            remainingBalance: Math.max(0, balanceDue - payAmount),
            businessName: profile?.business_name || profile?.name || "KredBook",
          }),
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
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to record payment.";
        Alert.alert("Error", message);
      }
    };

    return (
      <BaseBottomSheet
        ref={ref}
        onClose={() => onDismiss?.()}
        snapPoints={["75%", "90%"]}
        withScroll
      >
          <Text style={typography.sectionTitle}>Record Payment</Text>
          <Text style={[typography.caption, { marginTop: spacing.xs, marginBottom: spacing.lg }]}>Balance due for this entry</Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
              borderRadius: radius.lg,
              marginBottom: spacing.xl,
              backgroundColor: colors.background,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View style={{ marginRight: spacing.md }}>
              <Avatar name={customerName} size="md" />
            </View>

            <View className="flex-1">
              <Text style={typography.cardTitle}>{customerName}</Text>
              <View className="flex-row items-center">
                <Text style={[typography.caption, { color: colors.textSecondary }]}> 
                  Due: 
                </Text>
                <MoneyAmount
                  value={balanceDue}
                  color={colors.danger}
                  style={[typography.caption, { fontWeight: "700" }]}
                />
              </View>
            </View>
          </View>

          <Text className="text-[13px] font-semibold mb-3 text-textPrimary">
            Amount Received
          </Text>

          {/* Large split amount row */}
          <Input
            placeholder="0"
            value={amount}
            onChangeText={(value) => setAmount(value.replace(/[^0-9.]/g, ""))}
            keyboardType="decimal-pad"
            icon={<Text className="text-textPrimary text-lg font-bold">₹</Text>}
          />

          {/* Tap-to-fill full balance hint */}
          <TouchableOpacity
            onPress={() => setAmount(String(balanceDue))}
            activeOpacity={0.7}
            className="mb-5"
          >
            <View className="flex-row items-center">
              <Text style={[typography.small, { fontWeight: "600" as const, color: colors.primary }]}>
                Full balance: 
              </Text>
              <MoneyAmount
                value={balanceDue}
                color={colors.primary}
                style={[typography.small, { fontWeight: "600" as const }]}
              />
            </View>
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
          <Input
            placeholder="Write a note about this payment..."
            value={notes}
            onChangeText={setNotes}
          />

          {/* ── Dynamic Action Button ── */}
          <Button
            title={isRecording ? "Recording..." : isFullPaid ? "Mark Full Paid" : "Record Payment"}
            onPress={handleSubmit}
            disabled={!isFullPaid && parsedAmount <= 0}
            loading={isRecording}
            icon={!isRecording && isFullPaid ? <Check size={16} color={colors.surface} strokeWidth={3} /> : undefined}
          />
      </BaseBottomSheet>
    );
  }
);

RecordCustomerPaymentModal.displayName = "RecordCustomerPaymentModal";

export default RecordCustomerPaymentModal;
