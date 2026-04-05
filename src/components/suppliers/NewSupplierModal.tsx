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
      handleIndicatorStyle={{ backgroundColor: colors.border, width: 40 }}
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
        <View className="flex-row items-center justify-between py-3 mb-4">
          <Text className="text-[20px] font-black text-textPrimary tracking-tight">
            Add Supplier
          </Text>
          <TouchableOpacity onPress={onClose} disabled={loading} hitSlop={10} className="w-8 h-8 items-end justify-center">
            <X size={22} className="text-textSecondary" strokeWidth={2.5} />
          </TouchableOpacity>
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
            <View className="gap-5">
              {/* ── Supplier Name ── */}
              <View>
                <Text className="text-[11px] font-bold text-textSecondary uppercase tracking-widest mb-2">
                  Supplier Name *
                </Text>
                <View className={`flex-row items-center border rounded-[16px] overflow-hidden bg-surface ${touched.name && errors.name ? 'border-danger' : 'border-border'}`}>
                  <TextInput
                    placeholder="Metro Distributors"
                    placeholderTextColor="#AEAEB2"
                    value={values.name}
                    onChangeText={handleChange("name")}
                    onBlur={handleBlur("name")}
                    className="flex-1 px-4 py-4 text-[15px] text-textPrimary"
                  />
                </View>
                {touched.name && errors.name && (
                  <Text className="text-xs mt-1 text-danger">
                    {errors.name}
                  </Text>
                )}
              </View>

              {/* ── Phone ── */}
              <View>
                <Text className="text-[11px] font-bold text-textSecondary uppercase tracking-widest mb-2">
                  Phone
                </Text>
                <View className={`flex-row items-center border rounded-[16px] overflow-hidden bg-surface ${touched.phone && errors.phone ? 'border-danger' : 'border-border'}`}>
                  <Text className="pl-4 pr-2 text-[15px] text-textSecondary font-medium">
                    +91
                  </Text>
                  <TextInput
                    placeholder="98765 43210"
                    placeholderTextColor="#AEAEB2"
                    value={values.phone}
                    onChangeText={handleChange("phone")}
                    onBlur={handleBlur("phone")}
                    keyboardType="phone-pad"
                    maxLength={10}
                    className="flex-1 pr-4 py-4 text-[15px] text-textPrimary"
                  />
                </View>
                {touched.phone && errors.phone && (
                  <Text className="text-xs mt-1 text-danger">
                    {errors.phone}
                  </Text>
                )}
              </View>

              {/* ── Basket Mark ── */}
              <View>
                <Text className="text-[11px] font-bold text-textSecondary uppercase tracking-widest mb-2">
                  Basket Mark
                </Text>
                <View className="flex-row items-center border rounded-[16px] overflow-hidden bg-surface border-border">
                  <TextInput
                    placeholder="e.g. M-42"
                    placeholderTextColor="#AEAEB2"
                    value={values.basket_mark}
                    onChangeText={handleChange("basket_mark")}
                    onBlur={handleBlur("basket_mark")}
                    className="flex-1 px-4 py-4 text-[15px] text-textPrimary"
                  />
                </View>
              </View>

              {/* ── Bank Details row ── */}
              <TouchableOpacity
                onPress={() => setBankExpanded((v) => !v)}
                activeOpacity={0.7}
                className="flex-row items-center p-4 rounded-[20px] bg-[#FFFBEB] border border-[#FEF3C7]"
              >
                {/* orange-tinted circular icon */}
                <View className="w-10 h-10 rounded-full items-center justify-center mr-3 bg-[#FFEDD5]">
                  <Landmark size={18} color="#EA580C" strokeWidth={2} />
                </View>
                
                <View className="flex-1">
                  <Text className="text-[15px] font-bold text-[#92400E]">
                    Add Bank Details
                  </Text>
                  <Text className="text-[13px] font-medium text-[#D97706] opacity-80 mt-0.5">
                    Receive payments directly
                  </Text>
                </View>

                {bankExpanded ? (
                  <ChevronRight
                    size={20}
                    color="#D97706"
                    strokeWidth={2.5}
                    style={{ transform: [{ rotate: "-90deg" }] }}
                  />
                ) : (
                  <View className="flex-row items-center">
                    <Text className="text-[13px] font-semibold text-[#94A3B8] mr-1">
                      Optional
                    </Text>
                    <ChevronRight size={18} color="#F59E0B" strokeWidth={2.5} />
                  </View>
                )}
              </TouchableOpacity>

              {/* ── Bank fields (expandable) ── */}
              {bankExpanded && (
                <View className="gap-4">
                  {/* Bank Name */}
                  <View>
                    <Text className="text-[12px] font-bold text-textPrimary mb-2">Bank Name</Text>
                    <View className="flex-row items-center border rounded-[16px] overflow-hidden bg-surface border-border">
                      <TextInput
                        placeholder="e.g. HDFC Bank"
                        placeholderTextColor="#AEAEB2"
                        value={values.bank_name ?? ""}
                        onChangeText={handleChange("bank_name")}
                        onBlur={handleBlur("bank_name")}
                        className="flex-1 px-4 py-4 text-[15px] text-textPrimary"
                      />
                    </View>
                  </View>
                  {/* Account Number */}
                  <View>
                    <Text className="text-[12px] font-bold text-textPrimary mb-2">Account Number</Text>
                    <View className="flex-row items-center border rounded-[16px] overflow-hidden bg-surface border-border">
                      <TextInput
                        placeholder="0000 0000 0000"
                        placeholderTextColor="#AEAEB2"
                        value={values.account_number ?? ""}
                        onChangeText={handleChange("account_number")}
                        onBlur={handleBlur("account_number")}
                        keyboardType="numeric"
                        className="flex-1 px-4 py-4 text-[15px] text-textPrimary"
                      />
                    </View>
                  </View>
                  {/* IFSC */}
                  <View>
                    <Text className="text-[12px] font-bold text-textPrimary mb-2">IFSC Code</Text>
                    <View className="flex-row items-center border rounded-[16px] overflow-hidden bg-surface border-border">
                      <TextInput
                        placeholder="HDFC0001234"
                        placeholderTextColor="#AEAEB2"
                        value={values.ifsc_code ?? ""}
                        onChangeText={handleChange("ifsc_code")}
                        onBlur={handleBlur("ifsc_code")}
                        autoCapitalize="characters"
                        className="flex-1 px-4 py-4 text-[15px] text-textPrimary"
                      />
                    </View>
                  </View>
                </View>
              )}

              {/* ── CTA ── */}
              <View className="mt-2">
                <TouchableOpacity
                  onPress={() => handleSubmit()}
                  disabled={loading}
                  activeOpacity={0.85}
                  className="flex-row items-center justify-center bg-success rounded-[20px] py-4 gap-2"
                >
                  <UserPlus size={20} className="text-surface" strokeWidth={2.5} />
                  <Text className="text-[18px] font-black text-surface tracking-tight">
                    Add Supplier
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Formik>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}
