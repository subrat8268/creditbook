import { Formik } from "formik";
import {
  ChevronRight,
  CreditCard,
  Hash,
  Landmark,
  UserPlus,
} from "lucide-react-native";
import { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SupplierSchema } from "../../utils/schemas";
import { colors } from "../../utils/theme";
import Button from "../ui/Button";
import AppModal from "../ui/Modal";

// ─── Avatar helpers (mirrors SupplierCard) ────────────────────────────────────
const AVATAR_BG = [
  colors.warning.light,
  colors.success.light,
  colors.info.light,
  colors.danger.light,
  "#EDE9FE",
  "#FCE7F3",
  "#CCFBF1",
  "#FFF7ED",
] as const;
const AVATAR_TEXT = [
  colors.warning.dark,
  colors.primary.dark,
  colors.info.dark,
  colors.danger.dark,
  "#6D28D9",
  "#9D174D",
  "#0F766E",
  "#C2410C",
] as const;

function getAvatarIdx(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % AVATAR_BG.length;
}

function getInitials(name: string): string {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length >= 2)
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  if (name.trim().length > 0) return name.substring(0, 2).toUpperCase();
  return "?";
}

// ─── Types ────────────────────────────────────────────────────────────────────
export interface NewSupplierValues {
  name: string;
  phone?: string;
  address?: string;
  basket_mark?: string;
  bank_name?: string;
  account_number?: string;
  ifsc_code?: string;
  upi?: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: NewSupplierValues) => Promise<void>;
  loading?: boolean;
}

// ─── Field helpers ────────────────────────────────────────────────────────────
const FIELD_LABEL = "text-sm font-semibold mb-1.5";

function FieldLabel({
  children,
  required,
}: {
  children: string;
  required?: boolean;
}) {
  return (
    <Text className={FIELD_LABEL} style={{ color: colors.neutral[700] }}>
      {children}
      {required ? (
        <Text style={{ color: colors.danger.DEFAULT }}> *</Text>
      ) : null}
    </Text>
  );
}

function InputBase({
  children,
  hasError,
}: {
  children: React.ReactNode;
  hasError?: boolean;
}) {
  return (
    <View
      className="flex-row items-center border rounded-xl overflow-hidden"
      style={{
        borderColor: hasError ? colors.danger.DEFAULT : colors.neutral[200],
        backgroundColor: colors.neutral[100],
      }}
    >
      {children}
    </View>
  );
}

// ─── Bank input row (icon + text field, orange-tinted) ────────────────────────
function BankField({
  icon,
  placeholder,
  value,
  onChangeText,
  onBlur,
  keyboardType,
  autoCapitalize,
}: {
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  onBlur?: (e?: any) => void;
  keyboardType?: "default" | "numeric";
  autoCapitalize?: "none" | "characters";
}) {
  return (
    <View
      className="flex-row items-center rounded-xl overflow-hidden border"
      style={{
        borderColor: colors.warning.light,
        backgroundColor: "#FFF8F0",
      }}
    >
      <View
        className="w-11 h-11 items-center justify-center"
        style={{ backgroundColor: colors.warning.light }}
      >
        {icon}
      </View>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={colors.neutral[400]}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        keyboardType={keyboardType ?? "default"}
        autoCapitalize={autoCapitalize ?? "none"}
        className="flex-1 px-3 py-3 text-sm"
        style={{ color: colors.neutral[900] }}
      />
    </View>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function NewSupplierModal({
  visible,
  onClose,
  onSubmit,
  loading,
}: Props) {
  const [bankExpanded, setBankExpanded] = useState(false);

  const initialValues: NewSupplierValues = {
    name: "",
    phone: "",
    address: "",
    basket_mark: "",
    bank_name: "",
    account_number: "",
    ifsc_code: "",
    upi: "",
  };

  return (
    <AppModal title="Add Supplier" onClose={onClose} visible={visible}>
      <Formik
        initialValues={initialValues}
        validationSchema={SupplierSchema}
        onSubmit={async (values, { resetForm, setSubmitting }) => {
          try {
            await onSubmit({
              name: values.name.trim(),
              phone: values.phone?.trim() || undefined,
              address: values.address?.trim() || undefined,
              basket_mark: values.basket_mark?.trim() || undefined,
              bank_name: values.bank_name?.trim() || undefined,
              account_number: values.account_number?.trim() || undefined,
              ifsc_code: values.ifsc_code?.trim() || undefined,
              upi: values.upi?.trim() || undefined,
            });
            resetForm();
            setBankExpanded(false);
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
        }) => {
          const idx = values.name.trim() ? getAvatarIdx(values.name) : 0;
          const avatarLabel = getInitials(values.name);

          return (
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ gap: 16, paddingBottom: 8 }}
            >
              {/* ── Avatar preview ── */}
              <View className="items-center">
                <View
                  className="w-[60px] h-[60px] rounded-full items-center justify-center mb-1"
                  style={{ backgroundColor: AVATAR_BG[idx] }}
                >
                  <Text
                    className="font-bold"
                    style={{
                      fontSize: values.name.trim() ? 20 : 24,
                      color: values.name.trim()
                        ? AVATAR_TEXT[idx]
                        : colors.neutral[400],
                    }}
                  >
                    {avatarLabel}
                  </Text>
                </View>
                <Text
                  className="text-xs"
                  style={{ color: colors.neutral[400] }}
                >
                  Avatar auto-generated from name
                </Text>
              </View>

              {/* ── Supplier Name ── */}
              <View>
                <FieldLabel required>Supplier Name</FieldLabel>
                <InputBase hasError={!!(touched.name && errors.name)}>
                  <TextInput
                    placeholder="e.g. Abdullah Wholesalers"
                    placeholderTextColor={colors.neutral[400]}
                    value={values.name}
                    onChangeText={handleChange("name")}
                    onBlur={handleBlur("name")}
                    className="flex-1 px-4 py-3 text-base"
                    style={{ color: colors.neutral[900] }}
                  />
                </InputBase>
                {touched.name && errors.name && (
                  <Text
                    className="text-xs mt-1"
                    style={{ color: colors.danger.DEFAULT }}
                  >
                    {errors.name}
                  </Text>
                )}
              </View>

              {/* ── Phone Number ── */}
              <View>
                <FieldLabel>Phone Number</FieldLabel>
                <View
                  className="flex-row items-center border rounded-xl overflow-hidden"
                  style={{
                    borderColor:
                      touched.phone && errors.phone
                        ? colors.danger.DEFAULT
                        : colors.neutral[200],
                    backgroundColor: colors.neutral[100],
                  }}
                >
                  {/* +91 prefix badge */}
                  <View
                    className="px-3 py-3 border-r justify-center"
                    style={{ borderRightColor: colors.neutral[200] }}
                  >
                    <Text
                      className="text-[15px] font-semibold"
                      style={{ color: colors.neutral[700] }}
                    >
                      +91
                    </Text>
                  </View>
                  <TextInput
                    placeholder="00000 00000"
                    placeholderTextColor={colors.neutral[400]}
                    value={values.phone}
                    onChangeText={handleChange("phone")}
                    onBlur={handleBlur("phone")}
                    keyboardType="phone-pad"
                    maxLength={10}
                    className="flex-1 px-3 py-3 text-base"
                    style={{ color: colors.neutral[900] }}
                  />
                </View>
                {touched.phone && errors.phone && (
                  <Text
                    className="text-xs mt-1"
                    style={{ color: colors.danger.DEFAULT }}
                  >
                    {errors.phone}
                  </Text>
                )}
              </View>

              {/* ── Address (optional) ── */}
              <View>
                <FieldLabel>Address (optional)</FieldLabel>
                <InputBase>
                  <TextInput
                    placeholder="Enter full address"
                    placeholderTextColor={colors.neutral[400]}
                    value={values.address}
                    onChangeText={handleChange("address")}
                    onBlur={handleBlur("address")}
                    className="flex-1 px-4 py-3 text-base"
                    style={{ color: colors.neutral[900] }}
                  />
                </InputBase>
              </View>

              {/* ── Basket Mark / ID (optional) ── */}
              <View>
                <FieldLabel>Basket Mark / ID (optional)</FieldLabel>
                <InputBase>
                  <TextInput
                    placeholder="Assign a unique mark"
                    placeholderTextColor={colors.neutral[400]}
                    value={values.basket_mark}
                    onChangeText={handleChange("basket_mark")}
                    onBlur={handleBlur("basket_mark")}
                    className="flex-1 px-4 py-3 text-base"
                    style={{ color: colors.neutral[900] }}
                  />
                </InputBase>
              </View>

              {/* ── Add Bank Details accordion toggle ── */}
              <TouchableOpacity
                onPress={() => setBankExpanded((v) => !v)}
                activeOpacity={0.75}
                className="flex-row items-center px-4 py-3 rounded-xl"
                style={{ backgroundColor: colors.warning.light }}
              >
                <View
                  className="w-9 h-9 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: colors.warning.bg }}
                >
                  <Landmark
                    size={18}
                    color={colors.warning.DEFAULT}
                    strokeWidth={2}
                  />
                </View>
                <View className="flex-1">
                  <Text
                    className="text-[14px] font-bold"
                    style={{ color: colors.warning.dark }}
                  >
                    Add Bank Details
                  </Text>
                  <Text
                    className="text-xs mt-[1px]"
                    style={{ color: colors.warning.DEFAULT }}
                  >
                    Receive payments directly
                  </Text>
                </View>
                <ChevronRight
                  size={18}
                  color={colors.warning.DEFAULT}
                  strokeWidth={2.5}
                  style={{
                    transform: [{ rotate: bankExpanded ? "90deg" : "0deg" }],
                  }}
                />
              </TouchableOpacity>

              {/* ── CTA ── */}
              <Button
                title="Add Supplier"
                onPress={handleSubmit}
                loading={loading}
                icon={<UserPlus size={18} color="#FFFFFF" strokeWidth={2} />}
                iconPosition="left"
              />

              {/* ── Bank details section (expandable below CTA) ── */}
              {bankExpanded && (
                <View className="gap-3">
                  {/* Section header */}
                  <View className="flex-row items-center gap-2 mt-1">
                    <Landmark
                      size={15}
                      color={colors.warning.DEFAULT}
                      strokeWidth={2}
                    />
                    <Text
                      className="text-xs font-bold tracking-widest"
                      style={{ color: colors.warning.DEFAULT }}
                    >
                      BANK DETAILS
                    </Text>
                  </View>

                  {/* Bank Name */}
                  <View>
                    <FieldLabel>Bank Name</FieldLabel>
                    <BankField
                      icon={
                        <Landmark
                          size={16}
                          color={colors.warning.DEFAULT}
                          strokeWidth={2}
                        />
                      }
                      placeholder="e.g. HBL, Alfalah Bank"
                      value={values.bank_name ?? ""}
                      onChangeText={handleChange("bank_name")}
                      onBlur={handleBlur("bank_name")}
                    />
                  </View>

                  {/* Account Number */}
                  <View>
                    <FieldLabel>Account Number / IBAN</FieldLabel>
                    <BankField
                      icon={
                        <CreditCard
                          size={16}
                          color={colors.warning.DEFAULT}
                          strokeWidth={2}
                        />
                      }
                      placeholder="Enter account number"
                      value={values.account_number ?? ""}
                      onChangeText={handleChange("account_number")}
                      onBlur={handleBlur("account_number")}
                      keyboardType="numeric"
                    />
                  </View>

                  {/* IFSC Code */}
                  <View>
                    <FieldLabel>Branch / IFSC Code</FieldLabel>
                    <BankField
                      icon={
                        <Hash
                          size={16}
                          color={colors.warning.DEFAULT}
                          strokeWidth={2}
                        />
                      }
                      placeholder="e.g. 0012 or HBLP001"
                      value={values.ifsc_code ?? ""}
                      onChangeText={handleChange("ifsc_code")}
                      onBlur={handleBlur("ifsc_code")}
                      autoCapitalize="characters"
                    />
                  </View>

                  {/* UPI */}
                  <View>
                    <FieldLabel>UPI ID (optional)</FieldLabel>
                    <BankField
                      icon={
                        <Hash
                          size={16}
                          color={colors.warning.DEFAULT}
                          strokeWidth={2}
                        />
                      }
                      placeholder="e.g. supplier@upi"
                      value={values.upi ?? ""}
                      onChangeText={handleChange("upi")}
                      onBlur={handleBlur("upi")}
                    />
                  </View>
                </View>
              )}
            </ScrollView>
          );
        }}
      </Formik>
    </AppModal>
  );
}
