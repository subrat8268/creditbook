import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { Formik } from "formik";
import {
  ChevronRight,
  CreditCard,
  Hash,
  Landmark,
  UserPlus,
  X,
} from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SupplierSchema } from "../../utils/schemas";
import { colors } from "../../utils/theme";
import Button from "../ui/Button";

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
function FieldLabel({
  children,
  required,
}: {
  children: string;
  required?: boolean;
}) {
  return (
    <Text
      className="text-[11px] font-bold tracking-widest mb-1.5"
      style={{ color: colors.neutral[500] }}
    >
      {children.toUpperCase()}
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
        backgroundColor: "#F0FDF4",
      }}
    >
      <View
        className="w-11 h-11 items-center justify-center"
        style={{ backgroundColor: colors.primary.light ?? "#DCFCE7" }}
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
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      onChange={(idx) => {
        if (idx === -1) {
          onClose();
          setBankExpanded(false);
        }
      }}
      handleIndicatorStyle={{ backgroundColor: colors.neutral[300], width: 40 }}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      backgroundStyle={{
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        backgroundColor: "white",
      }}
    >
      <BottomSheetScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between py-3 mb-2">
          <Text className="text-xl font-semibold text-textDark">
            Add Supplier
          </Text>
          <Pressable onPress={onClose} disabled={loading}>
            <X size={22} color={colors.neutral[600]} strokeWidth={2} />
          </Pressable>
        </View>
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
          }) => (
            <View style={{ gap: 14 }}>
              {/* ── Supplier Name ── */}
              <View>
                <FieldLabel required>Supplier Name</FieldLabel>
                <InputBase hasError={!!(touched.name && errors.name)}>
                  <TextInput
                    placeholder="Metro Distributors"
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

              {/* ── Phone ── */}
              <View>
                <FieldLabel>Phone</FieldLabel>
                <View
                  className="flex-row items-center border rounded-xl overflow-hidden"
                  style={{
                    borderColor:
                      touched.phone && errors.phone
                        ? colors.danger.DEFAULT
                        : colors.neutral[200],
                    backgroundColor: "#FFFFFF",
                  }}
                >
                  <View
                    className="px-3 py-3 border-r justify-center"
                    style={{ borderRightColor: colors.neutral[200] }}
                  >
                    <Text
                      className="text-[15px] font-semibold"
                      style={{ color: colors.neutral[600] }}
                    >
                      +91
                    </Text>
                  </View>
                  <TextInput
                    placeholder="98765 43210"
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

              {/* ── Basket Mark ── */}
              <View>
                <FieldLabel>Basket Mark</FieldLabel>
                <InputBase>
                  <TextInput
                    placeholder="e.g. M-42"
                    placeholderTextColor={colors.neutral[400]}
                    value={values.basket_mark}
                    onChangeText={handleChange("basket_mark")}
                    onBlur={handleBlur("basket_mark")}
                    className="flex-1 px-4 py-3 text-base"
                    style={{ color: colors.neutral[900] }}
                  />
                </InputBase>
              </View>

              {/* ── Bank Details row ── */}
              <TouchableOpacity
                onPress={() => setBankExpanded((v) => !v)}
                activeOpacity={0.7}
                className="flex-row items-center py-3"
              >
                {/* green-tinted square icon */}
                <View
                  className="w-9 h-9 rounded-lg items-center justify-center mr-3"
                  style={{ backgroundColor: colors.primary.light ?? "#DCFCE7" }}
                >
                  <Landmark
                    size={18}
                    color={colors.primary.DEFAULT}
                    strokeWidth={2}
                  />
                </View>
                <Text
                  className="flex-1 text-[15px] font-semibold"
                  style={{ color: colors.neutral[700] }}
                >
                  Bank Details
                </Text>
                <Text
                  className="text-sm mr-0.5"
                  style={{ color: colors.neutral[400] }}
                >
                  Optional
                </Text>
                <ChevronRight
                  size={16}
                  color={colors.neutral[400]}
                  strokeWidth={2.5}
                  style={{
                    transform: [{ rotate: bankExpanded ? "90deg" : "0deg" }],
                  }}
                />
              </TouchableOpacity>

              {/* ── Bank fields (expandable) ── */}
              {bankExpanded && (
                <View
                  className="gap-3 pt-1 pb-2 px-3 rounded-xl"
                  style={{ backgroundColor: colors.neutral[100] }}
                >
                  {/* Bank Name */}
                  <View>
                    <FieldLabel>Bank Name</FieldLabel>
                    <BankField
                      icon={
                        <Landmark
                          size={16}
                          color={colors.primary.DEFAULT}
                          strokeWidth={2}
                        />
                      }
                      placeholder="e.g. HDFC Bank, SBI"
                      value={values.bank_name ?? ""}
                      onChangeText={handleChange("bank_name")}
                      onBlur={handleBlur("bank_name")}
                    />
                  </View>
                  {/* Account Number */}
                  <View>
                    <FieldLabel>Account Number</FieldLabel>
                    <BankField
                      icon={
                        <CreditCard
                          size={16}
                          color={colors.primary.DEFAULT}
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
                  {/* IFSC */}
                  <View>
                    <FieldLabel>IFSC Code</FieldLabel>
                    <BankField
                      icon={
                        <Hash
                          size={16}
                          color={colors.primary.DEFAULT}
                          strokeWidth={2}
                        />
                      }
                      placeholder="e.g. HDFC0001234"
                      value={values.ifsc_code ?? ""}
                      onChangeText={handleChange("ifsc_code")}
                      onBlur={handleBlur("ifsc_code")}
                      autoCapitalize="characters"
                    />
                  </View>
                  {/* UPI */}
                  <View>
                    <FieldLabel>UPI ID</FieldLabel>
                    <BankField
                      icon={
                        <Hash
                          size={16}
                          color={colors.primary.DEFAULT}
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

              {/* ── CTA ── */}
              <View className="pt-4">
                <Button
                  title="Add Supplier"
                  onPress={handleSubmit}
                  loading={loading}
                  icon={<UserPlus size={18} color="#FFFFFF" strokeWidth={2} />}
                  iconPosition="left"
                />
              </View>
            </View>
          )}
        </Formik>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}
