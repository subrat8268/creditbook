import { recordPayment } from "@/src/api/orders";
import { useAuthStore } from "@/src/store/authStore";
import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Alert,
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
};

const MODES: PaymentMode[] = ["Cash", "UPI", "NEFT", "Draft", "Cheque"];

export default function RecordCustomerPaymentModal({
  visible,
  onClose,
  onSuccess,
  orderId,
  balanceDue,
  customerId,
}: Props) {
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState<PaymentMode>("Cash");
  const [loading, setLoading] = useState(false);
  const profile = useAuthStore((s) => s.profile);
  const queryClient = useQueryClient();

  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["65%"], []);

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
    if (visible) sheetRef.current?.expand();
    else sheetRef.current?.close();
  }, [visible]);

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
      await recordPayment(orderId, profile.id, payAmount, mode, markFull);
      queryClient.invalidateQueries({
        queryKey: ["customerDetail", customerId],
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard", profile.id] });
      setAmount("");
      setMode("Cash");
      onSuccess();
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to record payment.");
    } finally {
      setLoading(false);
    }
  };

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
      handleIndicatorStyle={{ backgroundColor: "#D1D5DB", width: 40 }}
      backgroundStyle={{ borderTopLeftRadius: 28, borderTopRightRadius: 28 }}
    >
      <BottomSheetView
        style={{ paddingHorizontal: 24, paddingBottom: 40, paddingTop: 8 }}
      >
        <Text className="text-xl font-bold text-[#1C1C1E] mb-1.5">
          Record Payment
        </Text>
        <Text className="text-sm text-[#8E8E93] mb-5">
          Balance Due:{" "}
          <Text className="text-danger font-bold">
            \u20B9
            {balanceDue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </Text>
        </Text>

        {/* Amount input */}
        <Text className="text-[13px] text-[#636366] font-semibold mb-2">
          Amount Received
        </Text>
        <TextInput
          className="border border-[#E5E5EA] rounded-xl px-4 py-3.5 text-lg font-bold text-[#1C1C1E] mb-5 bg-search"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          placeholder="\u20B9 0.00"
          placeholderTextColor="#8E8E93"
        />

        {/* Mode chips */}
        <Text className="text-[13px] text-[#636366] font-semibold mb-2">
          Payment Mode
        </Text>
        <View className="flex-row flex-wrap gap-2 mb-7">
          {MODES.map((m) => (
            <TouchableOpacity
              key={m}
              onPress={() => setMode(m)}
              className={`px-4 py-2 rounded-full border ${
                mode === m
                  ? "bg-primary border-primary"
                  : "bg-search border-[#E5E5EA]"
              }`}
            >
              <Text
                className={`text-[13px] font-semibold ${
                  mode === m ? "text-white" : "text-[#636366]"
                }`}
              >
                {m}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Buttons */}
        <View className="flex-row gap-3">
          <Button
            variant="outline"
            title="Record Partial"
            onPress={() => handleSubmit(false)}
            loading={loading}
            disabled={!amount || !mode || loading}
            className="flex-1"
          />
          <Button
            variant="primary"
            title="Mark Full Paid"
            onPress={() => handleSubmit(true)}
            loading={loading}
            disabled={!mode || loading}
            className="flex-1"
          />
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}
