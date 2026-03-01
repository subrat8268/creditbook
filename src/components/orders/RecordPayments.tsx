import { usePayments } from "@/src/hooks/usePayments"; // 👈 1. Import the hook
import { useOrderStore } from "@/src/store/orderStore";
import { formatRupeeInput } from "@/src/utils/helper";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface RecordPaymentProps {
  orderId: string;
  vendorId: string;
  balanceDue: number;
  onPaymentSuccess: () => void;
}

export default function RecordPayment({
  orderId,
  vendorId,
  balanceDue,
  onPaymentSuccess,
}: RecordPaymentProps) {
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState<
    "Cash" | "UPI" | "NEFT" | "Draft" | "Cheque"
  >("Cash");

  const { recordPayment, isRecording } = usePayments(orderId, vendorId);
  const { addUpdatingOrderId, removeUpdatingOrderId, updatingOrderIds } =
    useOrderStore();

  const isUpdating = updatingOrderIds.includes(orderId);

  const handleChange = (text: string) => {
    const formatted = formatRupeeInput(text);
    setAmount(formatted);
  };

  const handlePayment = async (markFull: boolean) => {
    const payAmount = markFull ? balanceDue : Number(amount);

    if (!markFull) {
      if (!payAmount || payAmount <= 0) {
        Alert.alert("Error", "Please enter a valid payment amount.");
        return;
      }
      if (payAmount > balanceDue) {
        Alert.alert(
          "Error",
          "Partial payment cannot exceed remaining balance.",
        );
        return;
      }
    }

    try {
      addUpdatingOrderId(orderId);
      await recordPayment({ amount: payAmount, mode, markFull });
      setAmount("");
      onPaymentSuccess();
    } catch (err: any) {
      console.error("Payment error", err);
      Alert.alert("Payment Failed", err.message || "Something went wrong");
    } finally {
      removeUpdatingOrderId(orderId);
    }
  };

  return (
    <View className="bg-white p-4 rounded-2xl mb-4 border border-neutral-300">
      <Text className="text-lg font-inter-semibold mb-3">Record Payment</Text>

      {/* Payment Mode */}
      <View className="flex-row flex-wrap gap-2 mb-3">
        {["Cash", "UPI", "NEFT", "Draft", "Cheque"].map((m) => (
          <TouchableOpacity
            key={m}
            className={`px-4 py-2 rounded-lg border ${
              mode === m ? "bg-primary border-primary" : "border-neutral-300"
            }`}
            onPress={() =>
              setMode(m as "Cash" | "UPI" | "NEFT" | "Draft" | "Cheque")
            }
            disabled={isRecording || isUpdating}
          >
            <Text
              className={`font-inter-medium ${
                mode === m ? "text-white" : "text-neutral-700"
              }`}
            >
              {m}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Partial Payment Input */}
      <View className="flex-row items-center border border-neutral-300 rounded-md px-3 mb-3">
        <Text className="mr-1 text-neutral-700 font-inter">₹</Text>
        <TextInput
          placeholder={`Enter amount (Max ₹${balanceDue.toLocaleString("en-IN")})`}
          value={amount}
          onChangeText={handleChange}
          keyboardType="numeric"
          className="flex-1 py-2 font-inter placeholder:text-neutral-600"
          editable={!isRecording && !isUpdating}
        />
      </View>

      {/* Buttons */}
      <View className="flex-row gap-3">
        <TouchableOpacity
          onPress={() => handlePayment(false)}
          disabled={isRecording || isUpdating || !amount || Number(amount) <= 0}
          className={`flex-1 py-3 rounded-lg ${
            isRecording || isUpdating || !amount || Number(amount) <= 0
              ? "bg-neutral-300"
              : "bg-primary"
          }`}
        >
          {isRecording || isUpdating ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center font-inter-semibold">
              Partial Payment
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handlePayment(true)}
          disabled={isRecording || balanceDue <= 0}
          className={`flex-1 py-3 rounded-lg ${
            isRecording || balanceDue <= 0 ? "bg-neutral-300" : "bg-secondary"
          }`}
        >
          {isRecording || isUpdating ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center font-inter-semibold">
              Full Payment
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
