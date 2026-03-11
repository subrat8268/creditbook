import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { Formik } from "formik";
import { X } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { CustomerSchema } from "../../utils/schemas";
import { colors } from "../../utils/theme";
import Button from "../ui/Button";

// ─── Avatar utilities (mirrors CustomerCard) ─────────────────────────────────
const AVATAR_COLORS = [
  "#E74C3C",
  "#3498DB",
  "#9B59B6",
  "#1ABC9C",
  "#F39C12",
  "#2ECC71",
  "#E67E22",
  "#16A085",
  "#8E44AD",
  "#2980B9",
  "#D35400",
  "#27AE60",
] as const;

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length >= 2)
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  if (name.trim().length > 0) return name.substring(0, 2).toUpperCase();
  return "?";
}
// ─────────────────────────────────────────────────────────────────────────────

interface NewCustomerModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: {
    name: string;
    phone: string;
    address?: string;
    openingBalance?: number;
  }) => Promise<void>;
  loading?: boolean;
  errorMessage?: string;
  initialValues?: {
    name?: string;
    phone?: string;
    address?: string;
    openingBalance?: number;
  };
}

export default function NewCustomerModal({
  visible,
  onClose,
  onSubmit,
  loading = false,
  errorMessage,
  initialValues,
}: NewCustomerModalProps) {
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

  const formInitialValues = {
    name: initialValues?.name ?? "",
    phone: initialValues?.phone ?? "",
    address: initialValues?.address ?? "",
    openingBalance: initialValues?.openingBalance ?? ("" as unknown as number),
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
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between py-3 mb-2">
          <Text className="text-xl font-semibold text-textDark">
            Add Customer
          </Text>
          <Pressable onPress={onClose} disabled={loading}>
            <X size={22} color={colors.neutral[600]} strokeWidth={2} />
          </Pressable>
        </View>
        <Formik
          initialValues={formInitialValues}
          enableReinitialize
          validationSchema={CustomerSchema}
          onSubmit={async (values, { resetForm, setSubmitting }) => {
            try {
              await onSubmit({
                ...values,
                openingBalance:
                  typeof values.openingBalance === "number" &&
                  values.openingBalance > 0
                    ? values.openingBalance
                    : undefined,
              });
              resetForm();
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            setFieldValue,
            values,
            errors,
            touched,
          }) => {
            // Live avatar derived from current name value
            const avatarColor = values.name.trim()
              ? getAvatarColor(values.name)
              : colors.primary.DEFAULT;
            const avatarLabel = getInitials(values.name);

            return (
              <View className="flex gap-y-4">
                {/* ── Avatar Preview ── */}
                <View className="items-center mb-1">
                  <View
                    className="w-[64px] h-[64px] rounded-full items-center justify-center mb-2"
                    style={{ backgroundColor: avatarColor }}
                  >
                    <Text
                      className="font-bold"
                      style={{
                        color: "#FFFFFF",
                        fontSize: values.name.trim() ? 22 : 26,
                      }}
                    >
                      {avatarLabel}
                    </Text>
                  </View>
                  <Text
                    className="text-xs"
                    style={{ color: colors.neutral[500] }}
                  >
                    Avatar auto-generated from name
                  </Text>
                </View>

                {/* ── Customer Name ── */}
                <View>
                  <Text
                    className="text-sm font-semibold mb-1.5"
                    style={{ color: colors.neutral[700] }}
                  >
                    Customer Name *
                  </Text>
                  <TextInput
                    placeholder="e.g. Mohit Sharma"
                    placeholderTextColor={colors.neutral[400]}
                    value={values.name}
                    onChangeText={handleChange("name")}
                    onBlur={handleBlur("name")}
                    className="border rounded-xl px-4 py-3 text-base"
                    style={{
                      borderColor:
                        touched.name && errors.name
                          ? colors.danger.DEFAULT
                          : colors.neutral[200],
                      color: colors.neutral[900],
                    }}
                  />
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
                  <Text
                    className="text-sm font-semibold mb-1.5"
                    style={{ color: colors.neutral[700] }}
                  >
                    Phone Number *
                  </Text>
                  <View
                    className="flex-row items-center border rounded-xl overflow-hidden"
                    style={{
                      borderColor:
                        touched.phone && errors.phone
                          ? colors.danger.DEFAULT
                          : colors.neutral[200],
                    }}
                  >
                    {/* +91 prefix */}
                    <View
                      className="px-3 py-3 border-r justify-center"
                      style={{ borderRightColor: colors.neutral[200] }}
                    >
                      <Text
                        className="text-base font-semibold"
                        style={{ color: colors.neutral[700] }}
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

                {/* ── Address (optional) ── */}
                <View>
                  <Text
                    className="text-sm font-semibold mb-1.5"
                    style={{ color: colors.neutral[700] }}
                  >
                    Address (optional)
                  </Text>
                  <TextInput
                    placeholder="Area / locality"
                    placeholderTextColor={colors.neutral[400]}
                    value={values.address}
                    onChangeText={handleChange("address")}
                    onBlur={handleBlur("address")}
                    className="border rounded-xl px-4 py-3 text-base"
                    style={{
                      borderColor: colors.neutral[200],
                      color: colors.neutral[900],
                    }}
                  />
                </View>

                {/* ── Opening Balance (optional) ── */}
                <View>
                  <Text
                    className="text-sm font-semibold mb-1.5"
                    style={{ color: colors.neutral[700] }}
                  >
                    Opening Balance (optional)
                  </Text>
                  <View
                    className="flex-row items-center border rounded-xl px-4 py-3"
                    style={{ borderColor: colors.neutral[200] }}
                  >
                    {/* ₹ prefix */}
                    <Text
                      className="text-base mr-2"
                      style={{ color: colors.neutral[600] }}
                    >
                      ₹
                    </Text>
                    <TextInput
                      placeholder="0.00"
                      placeholderTextColor={colors.neutral[400]}
                      value={
                        values.openingBalance === ("" as unknown as number)
                          ? ""
                          : String(values.openingBalance)
                      }
                      onChangeText={(text) => {
                        const cleaned = text.replace(/[^0-9.]/g, "");
                        setFieldValue(
                          "openingBalance",
                          cleaned === ""
                            ? ("" as unknown as number)
                            : parseFloat(cleaned) || 0,
                        );
                      }}
                      onBlur={handleBlur("openingBalance")}
                      keyboardType="decimal-pad"
                      className="flex-1 text-base text-right"
                      style={{ color: colors.neutral[900] }}
                    />
                  </View>
                  <Text
                    className="text-xs mt-1.5"
                    style={{ color: colors.neutral[500] }}
                  >
                    If this customer already owes you money
                  </Text>
                  {touched.openingBalance && errors.openingBalance && (
                    <Text
                      className="text-xs mt-1"
                      style={{ color: colors.danger.DEFAULT }}
                    >
                      {errors.openingBalance as string}
                    </Text>
                  )}
                </View>

                {errorMessage && (
                  <Text
                    className="text-xs"
                    style={{ color: colors.danger.DEFAULT }}
                  >
                    {errorMessage}
                  </Text>
                )}

                {/* ── Submit ── */}
                <Button
                  title="Add Customer"
                  onPress={handleSubmit}
                  className="mt-2"
                  loading={loading}
                />
              </View>
            );
          }}
        </Formik>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}
