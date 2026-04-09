import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { Trash2, Truck, X } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { RecordDeliveryInput } from "../../api/suppliers";
import { colors } from "../../utils/theme";
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
  supplierName?: string;
}

const emptyItem = (): DeliveryItemDraft => ({
  item_name: "",
  quantity: "",
  rate: "",
});

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmtINR(n: number) {
  return (
    "₹" +
    n.toLocaleString("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function ChargeRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View className="flex-row items-center justify-between mb-3">
      <Text className="text-[15px]" style={{ color: colors.textSecondary }}>
        {label}
      </Text>
      <View
        className="flex-row items-center border rounded-lg overflow-hidden"
        style={{ borderColor: colors.border, width: 110 }}
      >
        <Text className="pl-3 text-sm" style={{ color: colors.textSecondary }}>
          ₹
        </Text>
        <TextInput
          placeholder="0"
          placeholderTextColor={"#AEAEB2"}
          value={value}
          onChangeText={onChange}
          keyboardType="numeric"
          className="flex-1 px-2 py-2.5 text-sm"
          style={{ color: colors.textPrimary }}
        />
      </View>
    </View>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function RecordDeliveryModal({
  visible,
  onClose,
  onSubmit,
  loading,
  supplierName,
}: Props) {
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["90%"], []);

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

  const todayISO = new Date().toISOString().split("T")[0];
  const [items, setItems] = useState<DeliveryItemDraft[]>([emptyItem()]);
  const [loading_charge, setLoadingCharge] = useState("");
  const [advance_paid, setAdvancePaid] = useState("");

  const reset = () => {
    setItems([emptyItem()]);
    setLoadingCharge("");
    setAdvancePaid("");
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
  const itemsTotal = items.reduce(
    (s, it) => s + (parseFloat(it.quantity) || 0) * (parseFloat(it.rate) || 0),
    0,
  );
  const loadingNum = parseFloat(loading_charge) || 0;
  const advanceNum = parseFloat(advance_paid) || 0;
  const netBalance = Math.max(0, itemsTotal + loadingNum - advanceNum);

  const handleSubmit = async () => {
    const validItems = items.filter(
      (it) =>
        it.item_name.trim() &&
        parseFloat(it.quantity) > 0 &&
        parseFloat(it.rate) > 0,
    );
    if (validItems.length === 0) {
      Alert.alert("Required", "Add at least one item with name, qty and rate.");
      return;
    }
    await onSubmit({
      delivery_date: todayISO,
      loading_charge: loadingNum,
      advance_paid: advanceNum,
      items: validItems.map((it) => ({
        item_name: it.item_name.trim(),
        quantity: parseFloat(it.quantity),
        rate: parseFloat(it.rate),
      })),
    });
    reset();
  };

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
      handleIndicatorStyle={{ backgroundColor: colors.border, width: 40 }}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      backgroundStyle={{
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        backgroundColor: colors.surface,
      }}
    >
      <BottomSheetScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between py-3 mb-2">
          <Text className="text-xl font-semibold text-textDark">
            Record Delivery
          </Text>
          <Pressable onPress={onClose} disabled={loading}>
            <X size={22} color={colors.textPrimary} strokeWidth={2} />
          </Pressable>
        </View>

        {/* ── Party name pill ── */}
        {supplierName ? (
          <View
            className="flex-row items-center self-start gap-1.5 px-3 py-1.5 rounded-full mb-4"
            style={{
              backgroundColor: colors.paid.bg ?? "#DCFCE7",
            }}
          >
            <Truck size={13} color={colors.primary} strokeWidth={2} />
            <Text
              className="text-[13px] font-semibold"
              style={{ color: colors.primary }}
            >
              {supplierName}
            </Text>
          </View>
        ) : null}
        {/* Section label */}
        <Text
          className="text-[11px] font-bold tracking-widest mb-3"
          style={{ color: colors.textSecondary }}
        >
          DELIVERY ITEMS
        </Text>

        {/* Item rows */}
        {items.map((it, idx) => {
          const subtotal =
            (parseFloat(it.quantity) || 0) * (parseFloat(it.rate) || 0);
          return (
            <View key={idx}>
              {idx > 0 && (
                <View
                  className="h-px mb-3"
                  style={{ backgroundColor: colors.border }}
                />
              )}
              {/* Name + amount + trash */}
              <View className="flex-row items-center mb-1.5">
                <TextInput
                  placeholder="Item name (e.g. Flour 50kg)"
                  placeholderTextColor={"#AEAEB2"}
                  value={it.item_name}
                  onChangeText={(v) => updateItem(idx, "item_name", v)}
                  className="flex-1 text-[15px] font-semibold"
                  style={{ color: colors.textPrimary }}
                />
                <View className="flex-row items-center gap-2 ml-2">
                  {subtotal > 0 && (
                    <Text
                      className="text-[15px] font-semibold"
                      style={{ color: colors.textPrimary }}
                    >
                      {fmtINR(subtotal)}
                    </Text>
                  )}
                  {items.length > 1 && (
                    <TouchableOpacity
                      onPress={() => removeItem(idx)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Trash2
                        size={17}
                        color={colors.danger}
                        strokeWidth={2}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              {/* Qty | Rate inline inputs */}
              <View className="flex-row items-center gap-2 mb-4">
                <View
                  className="flex-row items-center border rounded-lg overflow-hidden"
                  style={{ borderColor: colors.border, flex: 1 }}
                >
                  <Text
                    className="pl-2 pr-0.5 text-sm"
                    style={{ color: colors.textSecondary }}
                  >
                    Qty
                  </Text>
                  <TextInput
                    placeholder="0"
                    placeholderTextColor={"#AEAEB2"}
                    value={it.quantity}
                    onChangeText={(v) => updateItem(idx, "quantity", v)}
                    keyboardType="numeric"
                    className="flex-1 px-1.5 py-2 text-sm"
                    style={{ color: colors.textPrimary }}
                  />
                </View>
                <Text
                  className="text-sm"
                  style={{ color: "#AEAEB2" }}
                >
                  ×
                </Text>
                <View
                  className="flex-row items-center border rounded-lg overflow-hidden"
                  style={{ borderColor: colors.border, flex: 1.6 }}
                >
                  <Text
                    className="pl-2 pr-0.5 text-sm"
                    style={{ color: colors.textSecondary }}
                  >
                    Rate ₹
                  </Text>
                  <TextInput
                    placeholder="0"
                    placeholderTextColor={"#AEAEB2"}
                    value={it.rate}
                    onChangeText={(v) => updateItem(idx, "rate", v)}
                    keyboardType="numeric"
                    className="flex-1 px-1.5 py-2 text-sm"
                    style={{ color: colors.textPrimary }}
                  />
                </View>
              </View>
            </View>
          );
        })}

        {/* Add Item — dashed border button */}
        <TouchableOpacity
          onPress={addItem}
          activeOpacity={0.7}
          className="items-center justify-center rounded-xl py-3 mb-5"
          style={{
            borderWidth: 1.5,
            borderColor: colors.primary,
            borderStyle: "dashed",
          }}
        >
          <Text
            className="text-[14px] font-semibold"
            style={{ color: colors.primary }}
          >
            + Add Item
          </Text>
        </TouchableOpacity>

        {/* Charges */}
        <ChargeRow
          label="Loading Charge"
          value={loading_charge}
          onChange={setLoadingCharge}
        />
        <ChargeRow
          label="Advance Paid"
          value={advance_paid}
          onChange={setAdvancePaid}
        />

        {/* Summary divider */}
        <View
          className="h-px mt-2 mb-4"
          style={{ backgroundColor: colors.border }}
        />

        {/* Summary pill bar */}
        <View className="flex-row flex-wrap items-center gap-x-1.5 gap-y-1 mb-3">
          <Text className="text-xs" style={{ color: colors.textSecondary }}>
            Items:{" "}
            <Text style={{ color: colors.textSecondary, fontWeight: "600" }}>
              {fmtINR(itemsTotal)}
            </Text>
          </Text>
          {loadingNum > 0 && (
            <>
              <Text className="text-xs" style={{ color: "#AEAEB2" }}>
                •
              </Text>
              <Text className="text-xs" style={{ color: colors.textSecondary }}>
                Loading:{" "}
                <Text style={{ color: colors.textSecondary, fontWeight: "600" }}>
                  {fmtINR(loadingNum)}
                </Text>
              </Text>
            </>
          )}
          {advanceNum > 0 && (
            <>
              <Text className="text-xs" style={{ color: "#AEAEB2" }}>
                •
              </Text>
              <Text className="text-xs" style={{ color: colors.textSecondary }}>
                Advance:{" "}
                <Text
                  style={{ color: colors.danger, fontWeight: "600" }}
                >
                  -{fmtINR(advanceNum)}
                </Text>
              </Text>
            </>
          )}
        </View>

        {/* Net Added to Balance */}
        <View className="flex-row items-center justify-between">
          <Text
            className="text-[15px] font-semibold"
            style={{ color: colors.textSecondary }}
          >
            Net Added to Balance
          </Text>
          <Text
            className="text-[20px] font-bold"
            style={{ color: colors.danger }}
          >
            {fmtINR(netBalance)}
          </Text>
        </View>
      </BottomSheetScrollView>

      {/* ── Sticky CTA ── */}
      <View className="pt-4 px-6 pb-6">
        <Button
          title="Record Delivery"
          onPress={handleSubmit}
          loading={loading}
        />
      </View>
    </BottomSheet>
  );
}
