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

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const palette = colors.avatarPalette;
  return palette[Math.abs(hash) % palette.length];
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

export default function NewCustomerModal({
  visible,
  onClose,
  onSubmit,
  loading = false,
  errorMessage,
  initialValues,
  entryFlow = false,
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
    entryAmount: initialValues?.entryAmount ?? ("" as unknown as number),
    entryNote: initialValues?.entryNote ?? "",
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
            Add Person
          </Text>
          <Pressable onPress={onClose} disabled={loading}>
            <X size={22} color={colors.textPrimary} strokeWidth={2} />
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
              : colors.primary;
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
                        color: colors.surface,
                        fontSize: values.name.trim() ? 22 : 26,
                      }}
                    >
                      {avatarLabel}
                    </Text>
                  </View>
                  <Text
                    className="text-xs"
                    style={{ color: colors.textSecondary }}
                  >
                    Avatar auto-generated from name
                  </Text>
                </View>

                {/* ── Person Name ── */}
                <View>
                  <Text
                    className="text-sm font-semibold mb-1.5"
                    style={{ color: colors.textSecondary }}
                  >
                    Person Name *
                  </Text>
                  <TextInput
                    placeholder="e.g. Mohit Sharma"
                    placeholderTextColor={colors.textSecondary}
                    value={values.name}
                    onChangeText={handleChange("name")}
                    onBlur={handleBlur("name")}
                    className="border rounded-xl px-4 py-3 text-base"
                    style={{
                      borderColor:
                        touched.name && errors.name
                          ? colors.danger
                          : colors.border,
                      color: colors.textPrimary,
                    }}
                  />
                  {touched.name && errors.name && (
                    <Text
                      className="text-xs mt-1"
                      style={{ color: colors.danger }}
                    >
                      {errors.name}
                    </Text>
                  )}
                </View>

                {/* ── Phone Number ── */}
                <View>
                  <Text
                    className="text-sm font-semibold mb-1.5"
                    style={{ color: colors.textSecondary }}
                  >
                    Phone Number
                  </Text>
                  <View
                    className="flex-row items-center border rounded-xl overflow-hidden"
                    style={{
                      borderColor:
                        touched.phone && errors.phone
                          ? colors.danger
                          : colors.border,
                    }}
                  >
                    {/* +91 prefix */}
                    <View
                      className="px-3 py-3 border-r justify-center"
                      style={{ borderRightColor: colors.border }}
                    >
                      <Text
                        className="text-base font-semibold"
                        style={{ color: colors.textSecondary }}
                      >
                        +91
                      </Text>
                    </View>
                    <TextInput
                      placeholder="98765 43210"
                      placeholderTextColor={colors.textSecondary}
                      value={values.phone}
                      onChangeText={handleChange("phone")}
                      onBlur={handleBlur("phone")}
                      keyboardType="phone-pad"
                      maxLength={10}
                      className="flex-1 px-3 py-3 text-base"
                      style={{ color: colors.textPrimary }}
                    />
                  </View>
                  {touched.phone && errors.phone && (
                    <Text
                      className="text-xs mt-1"
                      style={{ color: colors.danger }}
                    >
                      {errors.phone}
                    </Text>
                  )}
                </View>

                {/* ── Optional quick entry (only in inline flow) ── */}
                {entryFlow && (
                  <View>
                    <Text
                      className="text-sm font-semibold mb-1.5"
                      style={{ color: colors.textSecondary }}
                    >
                      Opening Entry Amount (optional)
                    </Text>
                    <View
                      className="flex-row items-center border rounded-xl px-4"
                      style={{ borderColor: colors.border }}
                    >
                      <Text
                        className="text-base mr-2"
                        style={{ color: colors.textPrimary }}
                      >
                        ₹
                      </Text>
                      <TextInput
                        placeholder="0"
                        placeholderTextColor={colors.textSecondary}
                        value={
                          values.entryAmount === ("" as unknown as number)
                            ? ""
                            : String(values.entryAmount)
                        }
                        onChangeText={(text) => {
                          const cleaned = text.replace(/[^0-9.]/g, "");
                          setFieldValue(
                            "entryAmount",
                            cleaned === ""
                              ? ("" as unknown as number)
                              : parseFloat(cleaned) || 0,
                          );
                        }}
                        keyboardType="decimal-pad"
                        className="flex-1 text-base text-right"
                        style={{ color: colors.textPrimary }}
                      />
                    </View>
                    <Text
                      className="text-xs mt-2"
                      style={{ color: colors.textSecondary }}
                    >
                      Add an entry now to start the ledger instantly.
                    </Text>
                  </View>
                )}

                {/* ── Address (optional) ── */}
                <View>
                  <Text
                    className="text-sm font-semibold mb-1.5"
                    style={{ color: colors.textSecondary }}
                  >
                    Address (optional)
                  </Text>
                  <TextInput
                    placeholder="Area / locality"
                    placeholderTextColor={colors.textSecondary}
                    value={values.address}
                    onChangeText={handleChange("address")}
                    onBlur={handleBlur("address")}
                    className="border rounded-xl px-4 py-3 text-base"
                    style={{
                      borderColor: colors.border,
                      color: colors.textPrimary,
                    }}
                  />
                </View>

                {/* ── Opening Balance (optional) ── */}
                <View>
                  <Text
                    className="text-sm font-semibold mb-1.5"
                    style={{ color: colors.textSecondary }}
                  >
                    Opening Balance (optional)
                  </Text>
                  {/* Hint pill — shown before the input so the user reads it first */}
                  <View
                    className="flex-row items-center rounded-lg px-3 py-2 mb-2"
                    style={{ backgroundColor: colors.successBg }}
                  >
                    <Text className="text-xs mr-1.5">💡</Text>
                    <Text
                      className="text-xs flex-1"
                      style={{ color: colors.primaryDark }}
                    >
                      Most users set this to ₹0 for new people
                    </Text>
                  </View>
                  <View
                    className="flex-row items-center border rounded-xl px-4"
                    style={{ borderColor: colors.border }}
                  >
                    {/* ₹ prefix */}
                    <Text
                      className="text-base mr-2"
                      style={{ color: colors.textPrimary }}
                    >
                      ₹
                    </Text>
                    <TextInput
                      placeholder="0.00"
                      placeholderTextColor={colors.textSecondary}
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
                      style={{ color: colors.textPrimary }}
                    />
                  </View>
                  {touched.openingBalance && errors.openingBalance && (
                    <Text
                      className="text-xs mt-1"
                      style={{ color: colors.danger }}
                    >
                      {errors.openingBalance as string}
                    </Text>
                  )}
                </View>

                {errorMessage && (
                  <Text className="text-xs" style={{ color: colors.danger }}>
                    {errorMessage}
                  </Text>
                )}

                {/* ── Submit ── */}
                <Button
                  title={entryFlow ? "Add Person & Entry" : "Add Person"}
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
