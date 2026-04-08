import { colors } from "@/src/utils/theme";
import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { FieldArray, Formik } from "formik";
import {
    Check,
    ChevronDown,
    ChevronUp,
    ImagePlus,
    Plus,
    Trash2,
    X,
} from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as Yup from "yup";
import Button from "../ui/Button";
import { pickImageFromLibrary } from "@/src/utils/imagePicker";
import { uploadProductImage } from "@/src/api/upload";

// ── Types ──────────────────────────────────────────────────
interface VariantRow {
  variant_name: string;
  price: string;
}

interface FormValues {
  name: string;
  base_price: string;
  category: string;
  variants: VariantRow[];
}

export interface ProductSubmitValues {
  name: string;
  base_price: number | null;
  category: string;
  variants: { variant_name: string; price: number }[];
  image_url: string | null;
}

export interface NewProductModalProps {
  /** "Add" | "Edit" — modal title becomes "{title} Product" */
  title?: string;
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: ProductSubmitValues) => Promise<void>;
  initialValues?: {
    name: string;
    base_price?: number | null;
    category?: string | null;
    variants?: { variant_name: string; price: number }[];
    image_url?: string | null;
  };
  loading?: boolean;
  errorMessage?: string;
  /** Called when user confirms deletion — only passed in Edit mode */
  onDelete?: () => void;
}

// ── Validation ─────────────────────────────────────────────
const FormSchema = Yup.object().shape({
  name: Yup.string().required("Product name is required"),
  base_price: Yup.string().test(
    "price-required-without-variants",
    "Enter a price (or add variants with prices)",
    function (value) {
      const variants = this.parent.variants as VariantRow[];
      if (variants && variants.length > 0) return true;
      return !!value && Number(value) > 0;
    },
  ),
  variants: Yup.array().of(
    Yup.object().shape({
      variant_name: Yup.string().required("Variant name is required"),
      price: Yup.string()
        .required("Price is required")
        .test("positive", "Must be greater than 0", (v) => Number(v) > 0),
    }),
  ),
  category: Yup.string().required("Please select a category"),
});

// ── Default categories (mirrors ProductsScreen filter chips) ──
const DEFAULT_CATEGORIES = [
  "General",
  "Rice & Grains",
  "Pulses & Dals",
  "Spices & Masalas",
  "Oils",
  "Dairy",
  "Dal",
  "Drinks",
];

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
        borderColor: colors.border,
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          paddingHorizontal: 10,
          paddingVertical: 12,
          borderRightWidth: 1,
          borderRightColor: colors.border,
          backgroundColor: colors.background,
        }}
      >
        <Text style={{ color: colors.textSecondary, fontSize: 14 }}>₹</Text>
      </View>
      <TextInput
        placeholder="0"
        placeholderTextColor={"#AEAEB2"}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        keyboardType="decimal-pad"
        style={{
          flex: 1,
          paddingHorizontal: 10,
          paddingVertical: 12,
          fontSize: 14,
          color: colors.textPrimary,
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
  onDelete,
}: NewProductModalProps) {
  const defaultValues: FormValues = {
    name: initialValues?.name ?? "",
    base_price:
      initialValues?.base_price != null ? String(initialValues.base_price) : "",
    category: initialValues?.category ?? "General",
    variants:
      initialValues?.variants?.map((v) => ({
        variant_name: v.variant_name,
        price: String(v.price),
      })) ?? [],
  };

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

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [addingCustom, setAddingCustom] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialValues?.image_url ?? null,
  );
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const allCategories = useMemo(
    () => [...DEFAULT_CATEGORIES, ...customCategories],
    [customCategories],
  );

  useEffect(() => {
    if (visible) {
      setImagePreview(initialValues?.image_url ?? null);
      setImageUri(null);
      setImageError(null);
    }
  }, [visible, initialValues?.image_url]);

  const handlePickImage = useCallback(async () => {
    const uri = await pickImageFromLibrary();
    if (!uri) return;
    setImagePreview(uri);
    setImageUri(uri);
    setImageError(null);
  }, []);

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
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      handleIndicatorStyle={{ backgroundColor: colors.border, width: 40 }}
      backgroundStyle={{ borderTopLeftRadius: 28, borderTopRightRadius: 28 }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingTop: 4,
          paddingBottom: 12,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: "700",
            color: colors.textPrimary,
          }}
        >
          {`${title} Product`}
        </Text>
        <TouchableOpacity
          onPress={onClose}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <X size={22} color={colors.textPrimary} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <Formik
        initialValues={defaultValues}
        enableReinitialize
        validationSchema={FormSchema}
        onSubmit={async (values, { resetForm, setSubmitting }) => {
          try {
            setImageError(null);
            let imageUrl: string | null = imagePreview ?? null;

            if (imageUri) {
              setImageUploading(true);
              imageUrl = await uploadProductImage(imageUri);
            }

            await onSubmit({
              name: values.name,
              base_price:
                values.variants.length === 0 && values.base_price
                  ? Number(values.base_price)
                  : null,
              category: values.category || "General",
              variants: values.variants.map((v) => ({
                variant_name: v.variant_name,
                price: Number(v.price),
              })),
              image_url: imageUrl,
            });
            resetForm();
            setImageUri(null);
          } catch (err: any) {
            console.error("Image upload failed:", err);
            setImageError(err?.message || "Failed to upload image");
          } finally {
            setImageUploading(false);
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
        }) => (
          <>
            <BottomSheetScrollView
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingBottom: 8,
              }}
              keyboardShouldPersistTaps="handled"
            >
              {/* ── PRODUCT INFORMATION section header ── */}
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "700",
                  letterSpacing: 1.2,
                  color: colors.textSecondary,
                  marginBottom: 16,
                }}
              >
                PRODUCT INFORMATION
              </Text>

              {/* ── Product Image ── */}
              <Text
                style={{
                  fontWeight: "600",
                  fontSize: 14,
                  color: colors.textPrimary,
                  marginBottom: 8,
                }}
              >
                Product Image
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <View
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 16,
                    backgroundColor: colors.background,
                    borderWidth: 1,
                    borderColor: colors.border,
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  {imagePreview ? (
                    <Image
                      source={{ uri: imagePreview }}
                      style={{ width: 72, height: 72 }}
                      resizeMode="cover"
                    />
                  ) : (
                    <ImagePlus size={24} color={colors.textSecondary} />
                  )}
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.textSecondary,
                      marginBottom: 6,
                    }}
                  >
                    Square image works best
                  </Text>
                  <TouchableOpacity
                    onPress={handlePickImage}
                    disabled={imageUploading}
                    style={{
                      alignSelf: "flex-start",
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderRadius: 10,
                      backgroundColor: imageUploading
                        ? colors.border
                        : colors.primary,
                    }}
                  >
                    {imageUploading ? (
                      <ActivityIndicator color={colors.surface} />
                    ) : (
                      <Text
                        style={{
                          color: colors.surface,
                          fontSize: 13,
                          fontWeight: "600",
                        }}
                      >
                        {imagePreview ? "Change Image" : "Upload Image"}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
              {imageError ? (
                <Text
                  style={{
                    color: colors.danger,
                    fontSize: 12,
                    marginBottom: 12,
                  }}
                >
                  {imageError}
                </Text>
              ) : (
                <View style={{ height: 8 }} />
              )}
              {/* ── Product Name ── */}
              <Text
                style={{
                  fontWeight: "600",
                  fontSize: 14,
                  color: colors.textPrimary,
                  marginBottom: 8,
                }}
              >
                Product Name *
              </Text>
              <TextInput
                placeholder="e.g. Basmati Rice"
                placeholderTextColor={"#AEAEB2"}
                value={values.name}
                onChangeText={handleChange("name")}
                onBlur={handleBlur("name")}
                style={{
                  borderWidth: 1,
                  borderColor:
                    touched.name && errors.name ? colors.danger : colors.border,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 14,
                  color: colors.textPrimary,
                  marginBottom: 4,
                }}
              />
              {touched.name && errors.name ? (
                <Text
                  style={{
                    color: colors.danger,
                    fontSize: 12,
                    marginBottom: 12,
                  }}
                >
                  {errors.name}
                </Text>
              ) : (
                <View style={{ height: 16 }} />
              )}

              {/* ── Category ── */}
              <Text
                style={{
                  fontWeight: "600",
                  fontSize: 14,
                  color: colors.textPrimary,
                  marginBottom: 8,
                }}
              >
                Category *
              </Text>
              {/* Selector button */}
              <TouchableOpacity
                onPress={() => {
                  setCategoryOpen((v) => !v);
                  setAddingCustom(false);
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: categoryOpen ? colors.primary : colors.border,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                }}
              >
                <Text
                  style={{ flex: 1, fontSize: 14, color: colors.textPrimary }}
                >
                  {values.category || "General"}
                </Text>
                {categoryOpen ? (
                  <ChevronUp size={18} color={colors.textSecondary} />
                ) : (
                  <ChevronDown size={18} color={colors.textSecondary} />
                )}
              </TouchableOpacity>
              {/* Inline dropdown */}
              {categoryOpen && (
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 12,
                    marginTop: 4,
                    overflow: "hidden",
                    backgroundColor: "white",
                  }}
                >
                  {allCategories.map((cat, idx) => (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => {
                        setFieldValue("category", cat);
                        setCategoryOpen(false);
                      }}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        borderBottomWidth:
                          idx < allCategories.length - 1 ? 1 : 0,
                        borderBottomColor: colors.border,
                        backgroundColor:
                          values.category === cat ? "#F0FDF4" : "white",
                      }}
                    >
                      <Text
                        style={{
                          flex: 1,
                          fontSize: 14,
                          color:
                            values.category === cat
                              ? colors.primary
                              : colors.textPrimary,
                          fontWeight: values.category === cat ? "600" : "400",
                        }}
                      >
                        {cat}
                      </Text>
                      {values.category === cat && (
                        <Check
                          size={16}
                          color={colors.primary}
                          strokeWidth={2.5}
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                  {/* Create New Category */}
                  {addingCustom ? (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        borderTopWidth: 1,
                        borderTopColor: colors.border,
                      }}
                    >
                      <TextInput
                        placeholder="New category name"
                        placeholderTextColor="#AEAEB2"
                        value={newCategoryInput}
                        onChangeText={setNewCategoryInput}
                        autoFocus
                        style={{
                          flex: 1,
                          fontSize: 14,
                          color: colors.textPrimary,
                          borderBottomWidth: 1,
                          borderBottomColor: colors.border,
                          paddingVertical: 2,
                        }}
                      />
                      <TouchableOpacity
                        onPress={() => {
                          const trimmed = newCategoryInput.trim();
                          if (trimmed) {
                            setCustomCategories((prev) => [...prev, trimmed]);
                            setFieldValue("category", trimmed);
                            setNewCategoryInput("");
                            setAddingCustom(false);
                            setCategoryOpen(false);
                          }
                        }}
                        style={{ marginLeft: 10 }}
                      >
                        <Check
                          size={18}
                          color={colors.primary}
                          strokeWidth={2.5}
                        />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={() => setAddingCustom(true)}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        borderTopWidth: 1,
                        borderTopColor: colors.border,
                      }}
                    >
                      <Plus
                        size={15}
                        color={colors.primary}
                        strokeWidth={2.5}
                      />
                      <Text
                        style={{
                          marginLeft: 6,
                          fontSize: 14,
                          color: colors.primary,
                          fontWeight: "600",
                        }}
                      >
                        Create New Category
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
              <View style={{ height: 16 }} />

              {/* ── Price (shown when no variants) ── */}
              {values.variants.length === 0 && (
                <View>
                  <Text
                    style={{
                      fontWeight: "600",
                      fontSize: 14,
                      color: colors.textPrimary,
                      marginBottom: 8,
                    }}
                  >
                    Price *
                  </Text>
                  <RupeeInput
                    value={values.base_price}
                    onChangeText={handleChange("base_price")}
                    onBlur={handleBlur("base_price") as () => void}
                  />
                  {touched.base_price && errors.base_price ? (
                    <Text
                      style={{
                        color: colors.danger,
                        fontSize: 12,
                        marginTop: 4,
                        marginBottom: 4,
                      }}
                    >
                      {errors.base_price}
                    </Text>
                  ) : (
                    <View style={{ height: 16 }} />
                  )}
                </View>
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
                          color: colors.textPrimary,
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
                          color={colors.primary}
                          strokeWidth={2.5}
                        />
                        <Text
                          style={{
                            color: colors.primary,
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
                          placeholderTextColor={"#AEAEB2"}
                          value={variant.variant_name}
                          onChangeText={handleChange(
                            `variants[${index}].variant_name`,
                          )}
                          onBlur={handleBlur(`variants[${index}].variant_name`)}
                          style={{
                            flex: 1,
                            borderWidth: 1,
                            borderColor: colors.border,
                            borderRadius: 12,
                            paddingHorizontal: 12,
                            paddingVertical: 12,
                            fontSize: 14,
                            color: colors.textPrimary,
                          }}
                        />
                        <RupeeInput
                          value={variant.price}
                          onChangeText={handleChange(
                            `variants[${index}].price`,
                          )}
                          onBlur={() => handleBlur(`variants[${index}].price`)}
                        />
                        <TouchableOpacity
                          onPress={() => remove(index)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Trash2
                            size={20}
                            color={colors.danger}
                            strokeWidth={2}
                          />
                        </TouchableOpacity>
                      </View>
                    ))}

                    {typeof errors.variants === "string" && (
                      <Text
                        style={{
                          color: colors.danger,
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
                    color: colors.danger,
                    fontSize: 12,
                    marginTop: 4,
                  }}
                >
                  {errorMessage}
                </Text>
              ) : null}

              <View style={{ height: 8 }} />
            </BottomSheetScrollView>

            {/* ── Sticky CTA ── */}
            <View
              style={{
                borderTopWidth: 1,
                borderTopColor: colors.background,
                paddingTop: 14,
                marginTop: 4,
                paddingHorizontal: 20,
                paddingBottom: 20,
              }}
            >
              <Button
                title={title === "Edit" ? "Save Changes" : `${title} Product`}
                onPress={() => handleSubmit()}
                loading={loading}
              />
              {/* Delete Product — only in Edit mode */}
              {onDelete && (
                <TouchableOpacity
                  onPress={onDelete}
                  activeOpacity={0.7}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    marginTop: 14,
                    paddingVertical: 4,
                  }}
                >
                  <Trash2 size={15} color={colors.danger} strokeWidth={2} />
                  <Text
                    style={{
                      color: colors.danger,
                      fontSize: 14,
                      fontWeight: "600",
                    }}
                  >
                    Delete Product
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        )}
      </Formik>
    </BottomSheet>
  );
}
