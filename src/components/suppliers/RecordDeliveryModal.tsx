import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { PlusCircle, Trash2 } from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { RecordDeliveryInput } from "../../api/suppliers";
import Button from "../ui/Button";

interface DeliveryItemDraft {
  item_name: string;
  quantity: string;
  rate: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: RecordDeliveryInput) => Promise<void>;
  loading?: boolean;
}

const emptyItem = (): DeliveryItemDraft => ({
  item_name: "",
  quantity: "",
  rate: "",
});

export default function RecordDeliveryModal({
  visible,
  onClose,
  onSubmit,
  loading,
}: Props) {
  const todayISO = new Date().toISOString().split("T")[0];
  const [delivery_date, setDeliveryDate] = useState(todayISO);
  const [items, setItems] = useState<DeliveryItemDraft[]>([emptyItem()]);
  const [loading_charge, setLoadingCharge] = useState("");
  const [advance_paid, setAdvancePaid] = useState("");
  const [notes, setNotes] = useState("");

  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["90%"], []);

  useEffect(() => {
    if (visible) {
      sheetRef.current?.expand();
    } else {
      sheetRef.current?.close();
    }
  }, [visible]);

  const reset = () => {
    setDeliveryDate(todayISO);
    setItems([emptyItem()]);
    setLoadingCharge("");
    setAdvancePaid("");
    setNotes("");
  };

  const updateItem = (
    idx: number,
    field: keyof DeliveryItemDraft,
    value: string,
  ) => {
    setItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it)),
    );
  };

  const addItem = () => setItems((prev) => [...prev, emptyItem()]);

  const removeItem = (idx: number) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  // Live totals
  const itemsTotal = items.reduce((s, it) => {
    const qty = parseFloat(it.quantity) || 0;
    const rate = parseFloat(it.rate) || 0;
    return s + qty * rate;
  }, 0);
  const loadingNum = parseFloat(loading_charge) || 0;
  const advanceNum = parseFloat(advance_paid) || 0;
  const grandTotal = itemsTotal + loadingNum;
  const balanceAfter = grandTotal - advanceNum;

  const handleSubmit = async () => {
    const validItems = items.filter(
      (it) =>
        it.item_name.trim() &&
        parseFloat(it.quantity) > 0 &&
        parseFloat(it.rate) > 0,
    );
    if (validItems.length === 0) {
      Alert.alert(
        "Required",
        "Add at least one delivery item with qty and rate.",
      );
      return;
    }
    if (!delivery_date) {
      Alert.alert("Required", "Delivery date is required.");
      return;
    }

    await onSubmit({
      delivery_date,
      loading_charge: loadingNum,
      advance_paid: advanceNum,
      notes: notes.trim() || undefined,
      items: validItems.map((it) => ({
        item_name: it.item_name.trim(),
        quantity: parseFloat(it.quantity),
        rate: parseFloat(it.rate),
      })),
    });
    reset();
  };

  const inputClass =
    "border border-neutral-300 rounded-lg px-3 py-2.5 font-inter text-neutral-900";
  const labelClass = "text-xs font-inter-medium text-neutral-500 mb-1";

  return (
    <BottomSheet
      ref={sheetRef}
      snapPoints={snapPoints}
      index={-1}
      enablePanDownToClose
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.4}
        />
      )}
      onClose={onClose}
    >
      {/* Sheet header */}
      <View className="flex-row items-center justify-between px-6 pb-3 border-b border-neutral-200">
        <TouchableOpacity onPress={onClose}>
          <Text className="text-neutral-500 font-inter text-base">Cancel</Text>
        </TouchableOpacity>
        <Text className="text-lg font-inter-semibold">Record Delivery</Text>
        <View className="w-14" />
      </View>

      <BottomSheetScrollView
        contentContainerStyle={{ padding: 24, paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Date */}
        <Text className={labelClass}>Delivery Date</Text>
        <TextInput
          className={`${inputClass} mb-4`}
          value={delivery_date}
          onChangeText={setDeliveryDate}
          placeholder="YYYY-MM-DD"
        />

        {/* Items */}
        <Text className="text-base font-inter-semibold text-neutral-800 mb-3">
          Items Received
        </Text>

        {items.map((it, idx) => (
          <View
            key={idx}
            className="border border-neutral-200 rounded-xl p-3 mb-3 bg-neutral-50"
          >
            <View className="flex-row items-center justify-between mb-2">
              <Text className="font-inter-medium text-neutral-700">
                Item {idx + 1}
              </Text>
              {items.length > 1 && (
                <TouchableOpacity onPress={() => removeItem(idx)}>
                  <Trash2 size={18} color={colors.danger.DEFAULT} strokeWidth={2} />
                </TouchableOpacity>
              )}
            </View>

            <Text className={labelClass}>Item Name</Text>
            <TextInput
              className={`${inputClass} mb-2`}
              placeholder="e.g. Gutka, Cigarette box"
              value={it.item_name}
              onChangeText={(v) => updateItem(idx, "item_name", v)}
            />

            <View className="flex-row gap-2">
              <View className="flex-1">
                <Text className={labelClass}>Qty</Text>
                <TextInput
                  className={inputClass}
                  placeholder="0"
                  value={it.quantity}
                  onChangeText={(v) => updateItem(idx, "quantity", v)}
                  keyboardType="numeric"
                />
              </View>
              <View className="flex-1">
                <Text className={labelClass}>Rate (₹)</Text>
                <TextInput
                  className={inputClass}
                  placeholder="0"
                  value={it.rate}
                  onChangeText={(v) => updateItem(idx, "rate", v)}
                  keyboardType="numeric"
                />
              </View>
              <View className="flex-1">
                <Text className={labelClass}>Subtotal</Text>
                <View className={`${inputClass} bg-neutral-100`}>
                  <Text className="text-neutral-700 font-inter-medium">
                    ₹
                    {(
                      (parseFloat(it.quantity) || 0) *
                      (parseFloat(it.rate) || 0)
                    ).toLocaleString("en-IN")}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ))}

        <TouchableOpacity
          onPress={addItem}
          className="flex-row items-center gap-2 py-2 mb-4"
        >
          <PlusCircle size={20} color={colors.info.dark} strokeWidth={2} />
          <Text className="text-primary font-inter-medium">Add Item</Text>
        </TouchableOpacity>

        {/* Charges */}
        <View className="flex-row gap-3 mb-4">
          <View className="flex-1">
            <Text className={labelClass}>Loading Charge (₹)</Text>
            <TextInput
              className={inputClass}
              placeholder="0"
              value={loading_charge}
              onChangeText={setLoadingCharge}
              keyboardType="numeric"
            />
          </View>
          <View className="flex-1">
            <Text className={labelClass}>Advance Paid (₹)</Text>
            <TextInput
              className={inputClass}
              placeholder="0"
              value={advance_paid}
              onChangeText={setAdvancePaid}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Notes */}
        <Text className={labelClass}>Notes (optional)</Text>
        <TextInput
          className={`${inputClass} mb-4`}
          placeholder="Any remarks..."
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        {/* Summary */}
        <View className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 mb-6">
          <Text className="font-inter-semibold text-neutral-800 mb-2">
            Summary
          </Text>
          <View className="flex-row justify-between mb-1">
            <Text className="text-neutral-600 font-inter">Items Total</Text>
            <Text className="font-inter-medium">
              ₹{itemsTotal.toLocaleString("en-IN")}
            </Text>
          </View>
          {loadingNum > 0 && (
            <View className="flex-row justify-between mb-1">
              <Text className="text-neutral-600 font-inter">
                Loading Charge
              </Text>
              <Text className="font-inter-medium">
                ₹{loadingNum.toLocaleString("en-IN")}
              </Text>
            </View>
          )}
          <View className="flex-row justify-between mb-2 border-t border-neutral-200 pt-2">
            <Text className="font-inter-semibold text-neutral-900">
              Grand Total
            </Text>
            <Text className="font-inter-bold text-neutral-900 text-base">
              ₹{grandTotal.toLocaleString("en-IN")}
            </Text>
          </View>
          {advanceNum > 0 && (
            <>
              <View className="flex-row justify-between mb-1">
                <Text className="text-green-600 font-inter">Advance Paid</Text>
                <Text className="text-green-600 font-inter-medium">
                  −₹{advanceNum.toLocaleString("en-IN")}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-danger-strong font-inter-semibold">
                  Balance Owed
                </Text>
                <Text className="text-danger-strong font-inter-bold text-base">
                  ₹{Math.max(0, balanceAfter).toLocaleString("en-IN")}
                </Text>
              </View>
            </>
          )}
        </View>

        <Button
          title="Record Delivery"
          onPress={handleSubmit}
          loading={loading}
        />
      </BottomSheetScrollView>
    </BottomSheet>
  );
}
