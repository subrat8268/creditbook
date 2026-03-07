import { recordPayment } from "@/src/api/orders";
import { useAuthStore } from "@/src/store/authStore";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

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
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 justify-end"
      >
        <TouchableOpacity
          className="absolute inset-0"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
          onPress={onClose}
        />
        <View className="bg-white rounded-t-3xl px-6 pb-10 pt-3">
          <View className="self-center w-10 h-1 rounded-full bg-[#E5E5EA] mb-5" />
          <Text className="text-xl font-bold text-[#1C1C1E] mb-1.5">
            Record Payment
          </Text>
          <Text className="text-sm text-[#8E8E93] mb-5">
            Balance Due:{" "}
            <Text className="text-danger font-bold">
              ₹
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
            placeholder="₹ 0.00"
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
            <TouchableOpacity
              className="flex-1 py-[15px] rounded-[14px] items-center justify-center border-[1.5px] border-primary bg-white"
              onPress={() => handleSubmit(false)}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#5B3FFF" />
              ) : (
                <Text className="text-[15px] font-bold text-primary">
                  Record Partial
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 py-[15px] rounded-[14px] items-center justify-center bg-primary"
              onPress={() => handleSubmit(true)}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-[15px] font-bold text-white">
                  Mark Full Paid
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
