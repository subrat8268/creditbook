import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

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
}

const PAYMENT_MODES = ["Cash", "UPI", "NEFT", "Draft", "Cheque"];

export default function RecordPaymentMadeModal({
  visible,
  balanceOwed,
  onClose,
  onSubmit,
  loading,
}: Props) {
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState("Cash");
  const [notes, setNotes] = useState("");

  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["62%"], []);

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

  const reset = () => {
    setAmount("");
    setMode("Cash");
    setNotes("");
  };

  const handleSubmit = async () => {
    const num = parseFloat(amount);
    if (!num || num <= 0) {
      Alert.alert("Error", "Enter a valid amount.");
      return;
    }
    if (num > balanceOwed) {
      Alert.alert("Error", "Amount exceeds balance owed.");
      return;
    }
    await onSubmit({ amount: num, payment_mode: mode, notes: notes.trim() });
    reset();
  };

  const inputNum = parseFloat(amount) || 0;
  const showWarning = inputNum > 0 && inputNum > balanceOwed;
  const isValid = inputNum > 0 && inputNum <= balanceOwed && mode !== null;

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
      <BottomSheetScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 40,
          paddingTop: 8,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-lg font-inter-semibold mb-1">
          Record Payment to Supplier
        </Text>
        <Text className="text-neutral-500 font-inter text-sm mb-4">
          Balance owed: \u20B9{balanceOwed.toLocaleString("en-IN")}
        </Text>

        {/* Amount */}
        <View className="border border-neutral-300 rounded-lg flex-row items-center px-3 mb-1">
          <Text className="text-neutral-600 font-inter mr-1">₹</Text>
          <TextInput
            className="flex-1 py-2.5 font-inter"
            placeholder={`Enter amount (max ₹${balanceOwed.toLocaleString("en-IN")})`}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
        </View>
        {showWarning && (
          <Text className="text-red-500 text-xs font-inter mb-3">
            Amount exceeds balance owed (₹{balanceOwed.toLocaleString("en-IN")})
          </Text>
        )}
        {!showWarning && <View className="mb-3" />}

        {/* Payment Mode */}
        <View className="flex-row flex-wrap gap-2 mb-3">
          {PAYMENT_MODES.map((m) => (
            <TouchableOpacity
              key={m}
              onPress={() => setMode(m)}
              className={`px-3 py-2 rounded-lg border ${
                mode === m ? "bg-primary border-primary" : "border-neutral-300"
              }`}
            >
              <Text
                className={`font-inter-medium text-sm ${
                  mode === m ? "text-white" : "text-neutral-700"
                }`}
              >
                {m}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Notes */}
        <TextInput
          className="border border-neutral-300 rounded-lg px-3 py-2.5 font-inter mb-4"
          placeholder="Notes (optional)"
          value={notes}
          onChangeText={setNotes}
        />

        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={onClose}
            className="flex-1 py-3 rounded-lg border border-neutral-300"
          >
            <Text className="text-center font-inter-medium text-neutral-700">
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading || !isValid}
            className={`flex-2 flex-grow py-3 rounded-lg ${
              loading || !isValid ? "bg-neutral-300" : "bg-primary"
            }`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-center font-inter-semibold text-white">
                Record Payment
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}
