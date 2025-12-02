import { ProductVariant } from "@/src/api/products";
import { Ionicons } from "@expo/vector-icons";
import { FieldArray, Formik } from "formik";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { ProductSchema } from "../../utils/schemas";
import Button from "../ui/Button";
import AppModal from "../ui/Modal";

interface NewProductModalProps {
  title: string;
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: {
    name: string;
    base_price: number;
    variants?: ProductVariant[];
  }) => Promise<void>;
  initialValues?: {
    name: string;
    base_price: number;
    variants?: ProductVariant[];
  };
  loading?: boolean;
  errorMessage?: string;
}

export default function NewProductModal({
  title,
  visible,
  onClose,
  onSubmit,
  initialValues,
  loading = false,
  errorMessage,
}: NewProductModalProps) {
  return (
    <AppModal title={`${title} Product`} onClose={onClose} visible={visible}>
      <Formik
        initialValues={
          initialValues || { name: "", base_price: 0, variants: [] }
        }
        enableReinitialize
        validationSchema={ProductSchema}
        onSubmit={async (values, { resetForm, setSubmitting }) => {
          try {
            await onSubmit(values);
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
          values,
          errors,
          touched,
        }) => (
          <View className="flex gap-y-3">
            {/* Name Field */}
            <View>
              <Text className="font-inter-medium mb-3">Product Name *</Text>
              <TextInput
                placeholder="e.g. Fresh Tomatoes"
                value={values.name}
                onChangeText={handleChange("name")}
                onBlur={handleBlur("name")}
                className="border border-default rounded-lg px-4 py-3 placeholder:text-textPrimary"
              />
              {touched.name && errors.name && (
                <Text className="text-red-500 font-inter text-sm mt-1">
                  {errors.name}
                </Text>
              )}
            </View>

            {/* Base Price */}
            <View>
              <Text className="font-inter-medium mb-2">Base Price (₹) *</Text>
              <TextInput
                placeholder="e.g. 100"
                value={
                  values.base_price === 0 ? "" : values.base_price.toString()
                }
                onChangeText={handleChange("base_price")}
                onBlur={handleBlur("base_price")}
                keyboardType="decimal-pad"
                className="border border-default rounded-lg px-4 py-3 placeholder:text-textPrimary"
              />
              {touched.base_price && errors.base_price && (
                <Text className="text-red-500 font-inter text-sm mt-1">
                  {errors.base_price}
                </Text>
              )}
            </View>

            {/* Variants */}
            <FieldArray name="variants">
              {({ push, remove }) => (
                <View className="">
                  <Text className="font-medium mb-2">Variants (optional)</Text>
                  <View className="p-2 border border-default rounded-lg">
                    {values.variants?.map((variant, index) => (
                      <View
                        key={index}
                        className="flex-row items-center gap-2 mb-2"
                      >
                        <TextInput
                          placeholder="Variant Name"
                          value={variant.name}
                          onChangeText={handleChange(`variants[${index}].name`)}
                          onBlur={handleBlur(`variants[${index}].name`)}
                          className="flex-1 border placeholder:text-textPrimary font-inter border-default rounded-lg px-3 py-2"
                        />
                        <TextInput
                          placeholder="Price"
                          value={variant.price ? variant.price.toString() : ""}
                          onChangeText={handleChange(
                            `variants[${index}].price`
                          )}
                          onBlur={handleBlur(`variants[${index}].price`)}
                          keyboardType="decimal-pad"
                          className="w-24 border border-default font-inter placeholder:text-textPrimary rounded-lg px-3 py-2"
                        />
                        <TouchableOpacity onPress={() => remove(index)}>
                          <Ionicons
                            name="trash-outline"
                            size={24}
                            color="red"
                          />
                        </TouchableOpacity>
                      </View>
                    ))}
                    <Button
                      title="Add Variant"
                      onPress={() => push({ name: "", price: 0 })}
                      variant="outline"
                    />
                    {errors.variants && typeof errors.variants === "string" && (
                      <Text className="text-red-500 text-sm mt-1">
                        {errors.variants}
                      </Text>
                    )}
                  </View>
                </View>
              )}
            </FieldArray>

            {errorMessage && (
              <Text className="text-red-500 text-sm mt-1">{errorMessage}</Text>
            )}

            {/* Submit Button */}
            <Button
              title={`${title} Product`}
              onPress={handleSubmit}
              className=""
              loading={loading}
            />
          </View>
        )}
      </Formik>
    </AppModal>
  );
}
