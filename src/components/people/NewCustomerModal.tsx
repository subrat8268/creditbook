import BaseBottomSheet from "@/src/components/layer2/BaseBottomSheet";
import Button from "@/src/components/ui/Button";
import Input from "@/src/components/ui/Input";
import { useTheme } from "@/src/utils/ThemeProvider";
import { lightColors } from "@/src/utils/theme";
import { useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";

interface NewCustomerModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: {
    name: string;
    phone?: string;
    address?: string;
    openingBalance?: number;
    entryAmount?: number;
    entryNote?: string;
  }) => Promise<void>;
  loading?: boolean;
  errorMessage?: string;
  initialValues?: {
    name?: string;
    phone?: string;
    address?: string;
    openingBalance?: number;
    entryAmount?: number;
    entryNote?: string;
  };
  entryFlow?: boolean;
}

function getAvatarColor(name: string): string {
  const palette = lightColors.avatarPalette;
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return palette[Math.abs(hash) % palette.length];
}

function getInitials(name: string): string {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return "?";
}

export default function NewCustomerModal({
  visible,
  onClose,
  onSubmit,
  loading = false,
  errorMessage,
  initialValues,
  entryFlow = false,
}: NewCustomerModalProps) {
  const { colors, spacing } = useTheme();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [openingBalance, setOpeningBalance] = useState("");
  const [entryAmount, setEntryAmount] = useState("");
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    if (!visible) return;
    setName(initialValues?.name ?? "");
    setPhone(initialValues?.phone ?? "");
    setAddress(initialValues?.address ?? "");
    setOpeningBalance(
      initialValues?.openingBalance !== undefined ? String(initialValues.openingBalance) : "",
    );
    setEntryAmount(initialValues?.entryAmount !== undefined ? String(initialValues.entryAmount) : "");
    setNameError("");
  }, [visible, initialValues]);

  const avatarColor = useMemo(
    () => (name.trim() ? getAvatarColor(name) : colors.primary),
    [name, colors.primary],
  );
  const avatarLabel = useMemo(() => getInitials(name), [name]);

  const handleSave = async () => {
    if (!name.trim()) {
      setNameError("Customer name is required");
      return;
    }

    setNameError("");
    const cleanOpening = Number(openingBalance || "0");
    const cleanEntry = Number(entryAmount || "0");

    await onSubmit({
      name: name.trim(),
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
      openingBalance: cleanOpening > 0 ? cleanOpening : undefined,
      entryAmount: cleanEntry > 0 ? cleanEntry : undefined,
    });
  };

  return (
    <BaseBottomSheet visible={visible} onClose={onClose} title="Add Customer" snapPoints={["90%"]}>
      <View className="items-center mb-2">
        <View className="h-16 w-16 items-center justify-center rounded-full mb-2" style={{ backgroundColor: avatarColor }}>
          <Text className="text-surface text-[22px] font-bold">{avatarLabel}</Text>
        </View>
        <Text className="text-xs text-textSecondary dark:text-textSecondary-dark">Avatar auto-generated from name</Text>
      </View>

      <View className="gap-3">
        <Input
          label="Customer Name *"
          placeholder="e.g. Mohit Sharma"
          value={name}
          onChangeText={setName}
          error={nameError || undefined}
        />

        <Input
          label="Phone Number"
          placeholder="9876543210"
          value={phone}
          onChangeText={(value) => setPhone(value.replace(/[^0-9]/g, ""))}
          keyboardType="numeric"
        />

        <Input
          label="Address (optional)"
          placeholder="Area / locality"
          value={address}
          onChangeText={setAddress}
        />

        <Input
          label="Opening Balance (optional)"
          placeholder="0"
          value={openingBalance}
          onChangeText={(value) => setOpeningBalance(value.replace(/[^0-9.]/g, ""))}
          keyboardType="decimal-pad"
        />

        {entryFlow ? (
          <Input
            label="Opening Entry Amount (optional)"
            placeholder="0"
            value={entryAmount}
            onChangeText={(value) => setEntryAmount(value.replace(/[^0-9.]/g, ""))}
            keyboardType="decimal-pad"
          />
        ) : null}

        {errorMessage ? <Text className="text-xs text-danger">{errorMessage}</Text> : null}

        <View style={{ marginTop: spacing.sm }}>
          <Button
            title={entryFlow ? "Add Customer & Entry" : "Add Customer"}
            onPress={handleSave}
            loading={loading}
            disabled={loading}
          />
        </View>
      </View>
    </BaseBottomSheet>
  );
}
