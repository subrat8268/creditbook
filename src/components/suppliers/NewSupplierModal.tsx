import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface NewSupplierValues {
  name: string;
  phone: string;
  address?: string;
  basket_mark?: string;
  bank_name?: string;
  account_number?: string;
  ifsc_code?: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: NewSupplierValues) => Promise<void>;
  loading?: boolean;
}

export default function NewSupplierModal({
  visible,
  onClose,
  onSubmit,
  loading,
}: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [basket_mark, setBasketMark] = useState("");
  const [bank_name, setBankName] = useState("");
  const [account_number, setAccountNo] = useState("");
  const [ifsc_code, setIfsc] = useState("");

  const reset = () => {
    setName("");
    setPhone("");
    setAddress("");
    setBasketMark("");
    setBankName("");
    setAccountNo("");
    setIfsc("");
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Required", "Supplier name is required.");
      return;
    }
    await onSubmit({
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim() || undefined,
      basket_mark: basket_mark.trim() || undefined,
      bank_name: bank_name.trim() || undefined,
      account_number: account_number.trim() || undefined,
      ifsc_code: ifsc_code.trim() || undefined,
    });
    reset();
  };

  const inputClass =
    "border border-neutral-300 rounded-lg px-3 py-2.5 font-inter text-neutral-900 mb-3";
  const labelClass = "text-sm font-inter-medium text-neutral-600 mb-1";

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 pt-14 pb-4 border-b border-neutral-200">
          <TouchableOpacity onPress={onClose}>
            <Text className="text-neutral-500 font-inter text-base">
              Cancel
            </Text>
          </TouchableOpacity>
          <Text className="text-lg font-inter-semibold">Add Supplier</Text>
          <TouchableOpacity onPress={handleSubmit} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color={colors.info.dark} />
            ) : (
              <Text className="text-primary font-inter-semibold text-base">
                Save
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1 px-4 pt-4"
          keyboardShouldPersistTaps="handled"
        >
          {/* Basic Info */}
          <Text className="text-base font-inter-semibold text-neutral-800 mb-3">
            Basic Info
          </Text>

          <Text className={labelClass}>Supplier Name *</Text>
          <TextInput
            className={inputClass}
            placeholder="e.g. Sri Krishna Pan Bhandar"
            value={name}
            onChangeText={setName}
          />

          <Text className={labelClass}>Phone</Text>
          <TextInput
            className={inputClass}
            placeholder="e.g. 9876543210"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <Text className={labelClass}>Address</Text>
          <TextInput
            className={inputClass}
            placeholder="Supplier address"
            value={address}
            onChangeText={setAddress}
            multiline
          />

          <Text className={labelClass}>Basket / Brand Mark</Text>
          <TextInput
            className={inputClass}
            placeholder="e.g. SKB, Tapas, Blue Crate"
            value={basket_mark}
            onChangeText={setBasketMark}
          />

          {/* Bank Details */}
          <Text className="text-base font-inter-semibold text-neutral-800 mt-2 mb-3">
            Bank Details (for payments)
          </Text>

          <Text className={labelClass}>Bank Name</Text>
          <TextInput
            className={inputClass}
            placeholder="e.g. State Bank of India"
            value={bank_name}
            onChangeText={setBankName}
          />

          <Text className={labelClass}>Account Number</Text>
          <TextInput
            className={inputClass}
            placeholder="Account number"
            value={account_number}
            onChangeText={setAccountNo}
            keyboardType="numeric"
          />

          <Text className={labelClass}>IFSC Code</Text>
          <TextInput
            className={inputClass}
            placeholder="e.g. SBIN0001234"
            value={ifsc_code}
            onChangeText={setIfsc}
            autoCapitalize="characters"
          />

          <View className="h-10" />
        </ScrollView>
      </View>
    </Modal>
  );
}
