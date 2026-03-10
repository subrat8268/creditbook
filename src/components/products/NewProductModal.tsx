import { colors } from "@/src/utils/theme";
import { FieldArray, Formik } from "formik";
import { Plus, Trash2 } from "lucide-react-native";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import * as Yup from "yup";
import Button from "../ui/Button";
import AppModal from "../ui/Modal";

// ── Types ──────────────────────────────────────────────────
interface VariantRow {
  variant_name: string;
  price: string;
}

interface FormValues {
  name: string;
  variants: VariantRow[];
}

export interface ProductSubmitValues {
  name: string;
  variants: Array<{ variant_name: string; price: number }>;
}

export interface NewProductModalProps {
  /** "Add" | "Edit" — modal title becomes "{title} Product" */
  title?: string;
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: ProductSubmitValues) => Promise<void>;
  initialValues?: {
    name: string;
    variants?: Array<{ variant_name: string; price: number }>;
  };
  loading?: boolean;
  errorMessage?: string;
}

// ── Validation ─────────────────────────────────────────────
const FormSchema = Yup.object().shape({
  name: Yup.string().required("Product name is required"),
  variants: Yup.array().of(
    Yup.object().shape({
      variant_name: Yup.string().required("Variant name is required"),
      price: Yup.string()
        .required("Price is required")
        .test("positive", "Must be greater than 0", (v) => Number(v) > 0),
    }),
  ),
});

// ── Sub-component: rupee-prefixed price input ───────────────
function RupeeInput({
  value,
  onChangeText,
  onBlur,
}: {
  value: string;
  onChangeText: (v: string) => void;
  onBlur: () => void;
}) {
  return (
    <View
      style={{
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: colors.neutral[200],
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          paddingHorizontal: 10,
          paddingVertical: 12,
          borderRightWidth: 1,
          borderRightColor: colors.neutral[200],
          backgroundColor: colors.neutral[100],
        }}
      >
        <Text style={{ color: colors.neutral[500], fontSize: 14 }}>₹</Text>
      </View>
      <TextInput
        placeholder="0"
        placeholderTextColor={colors.neutral[400]}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        keyboardType="decimal-pad"
        style={{
          flex: 1,
          paddingHorizontal: 10,
          paddingVertical: 12,
          fontSize: 14,
          color: colors.neutral[900],
        }}
      />
    </View>
  );
}

// ── Main component ─────────────────────────────────────────
export default function NewProductModal({
  title = "Add",
  visible,
  onClose,
  onSubmit,
  initialValues,
  loading = false,
  errorMessage,
}: NewProductModalProps) {
  const defaultValues: FormValues = {
    name: initialValues?.name ?? "",
    variants:
      initialValues?.variants?.map((v) => ({
        variant_name: v.variant_name,
        price: String(v.price),
      })) ?? [],
  };

  return (
    <AppModal title={`${title} Product`} visible={visible} onClose={onClose}>
      {/* Subtitle */}
      <Text
        style={{
          color: colors.neutral[500],
          fontSize: 13,
          marginBottom: 16,
          lineHeight: 18,
        }}
      >
        Products appear in search when creating a bill
      </Text>

      <Formik
        initialValues={defaultValues}
        enableReinitialize
        validationSchema={FormSchema}
        onSubmit={async (values, { resetForm, setSubmitting }) => {
          try {
            await onSubmit({
              name: values.name,
              variants: values.variants.map((v) => ({
                variant_name: v.variant_name,
                price: Number(v.price),
              })),
            });
            resetForm();
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              style={{ maxHeight: 420 }}
            >
              {/* ── Product Name ── */}
              <Text
                style={{
                  fontWeight: "600",
                  fontSize: 14,
                  color: colors.neutral[900],
                  marginBottom: 8,
                }}
              >
                Product Name *
              </Text>
              <TextInput
                placeholder="e.g. Basmati Rice"
                placeholderTextColor={colors.neutral[400]}
                value={values.name}
                onChangeText={handleChange("name")}
                onBlur={handleBlur("name")}
                style={{
                  borderWidth: 1,
                  borderColor:
                    touched.name && errors.name
                      ? colors.danger.DEFAULT
                      : colors.neutral[200],
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 14,
                  color: colors.neutral[900],
                  marginBottom: 4,
                }}
              />
              {touched.name && errors.name ? (
                <Text
                  style={{
                    color: colors.danger.DEFAULT,
                    fontSize: 12,
                    marginBottom: 12,
                  }}
                >
                  {errors.name}
                </Text>
              ) : (
                <View style={{ height: 16 }} />
              )}

              {/* ── Variants ── */}
              <FieldArray name="variants">
                {({ push, remove }) => (
                  <View>
                    {/* Header row */}
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 12,
                      }}
                    >
                      <Text
                        style={{
                          fontWeight: "700",
                          fontSize: 15,
                          color: colors.neutral[900],
                        }}
                      >
                        Variants
                      </Text>
                      <TouchableOpacity
                        onPress={() => push({ variant_name: "", price: "" })}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Plus
                          size={13}
                          color={colors.primary.DEFAULT}
                          strokeWidth={2.5}
                        />
                        <Text
                          style={{
                            color: colors.primary.DEFAULT,
                            fontWeight: "700",
                            fontSize: 14,
                          }}
                        >
                          Add Variant
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Variant rows */}
                    {values.variants.map((variant, index) => (
                      <View
                        key={index}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 10,
                        }}
                      >
                        <TextInput
                          placeholder="e.g. 1kg"
                          placeholderTextColor={colors.neutral[400]}
                          value={variant.variant_name}
                          onChangeText={handleChange(
                            `variants[${index}].variant_name`,
                          )}
                          onBlur={handleBlur(`variants[${index}].variant_name`)}
                          style={{
                            flex: 1,
                            borderWidth: 1,
                            borderColor: colors.neutral[200],
                            borderRadius: 12,
                            paddingHorizontal: 12,
                            paddingVertical: 12,
                            fontSize: 14,
                            color: colors.neutral[900],
                          }}
                        />
                        <RupeeInput
                          value={variant.price}
                          onChangeText={handleChange(
                            `variants[${index}].price`,
                          )}
                          onBlur={() =>
                            handleBlur(`variants[${index}].price`)
                          }
                        />
                        <TouchableOpacity
                          onPress={() => remove(index)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Trash2
                            size={20}
                            color={colors.danger.DEFAULT}
                            strokeWidth={2}
                          />
                        </TouchableOpacity>
                      </View>
                    ))}

                    {typeof errors.variants === "string" && (
                      <Text
                        style={{
                          color: colors.danger.DEFAULT,
                          fontSize: 12,
                          marginBottom: 8,
                        }}
                      >
                        {errors.variants}
                      </Text>
                    )}
                  </View>
                )}
              </FieldArray>

              {errorMessage ? (
                <Text
                  style={{
                    color: colors.danger.DEFAULT,
                    fontSize: 12,
                    marginTop: 4,
                  }}
                >
                  {errorMessage}
                </Text>
              ) : null}

              <View style={{ height: 8 }} />
            </ScrollView>

            {/* ── Sticky CTA ── */}
            <View
              style={{
                borderTopWidth: 1,
                borderTopColor: colors.neutral[100],
                paddingTop: 14,
                marginTop: 4,
              }}
            >
              <Button
                title={`${title} Product`}
                onPress={() => handleSubmit()}
                loading={loading}
              />
            </View>
          </>
        )}
      </Formik>
    </AppModal>
  );
}
