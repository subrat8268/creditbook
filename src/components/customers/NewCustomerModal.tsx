// src/components/NewCustomerModal.tsx
import { Formik } from "formik";
import { Text, TextInput, View } from "react-native";
import { CustomerSchema } from "../../utils/schemas";
import Button from "../ui/Button";
import AppModal from "../ui/Modal";

interface NewCustomerModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: {
    name: string;
    phone: string;
    address: string;
  }) => Promise<void>;
  loading?: boolean;
  errorMessage?: string;
  initialValues?: { name?: string; phone?: string; address?: string };
}

export default function NewCustomerModal({
  visible,
  onClose,
  onSubmit,
  loading = false,
  errorMessage,
  initialValues,
}: NewCustomerModalProps) {
  const formInitialValues = {
    name: initialValues?.name ?? "",
    phone: initialValues?.phone ?? "",
    address: initialValues?.address ?? "",
  };

  return (
    <AppModal title="Add New Customer" onClose={onClose} visible={visible}>
      <Formik
        initialValues={formInitialValues}
        enableReinitialize
        validationSchema={CustomerSchema}
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
              <Text className="font-medium mb-3">Customer Name *</Text>
              <TextInput
                placeholder="e.g. Sanjay Kumar"
                value={values.name}
                onChangeText={handleChange("name")}
                onBlur={handleBlur("name")}
                className="border border-default rounded-lg px-4 py-3 placeholder:text-textPrimary"
              />
              {touched.name && errors.name && (
                <Text className="text-red-500 text-sm mt-1">{errors.name}</Text>
              )}
            </View>

            {/* Phone Field */}
            <View>
              <Text className="font-medium mb-3">Phone *</Text>
              <TextInput
                placeholder="e.g. 1234567890"
                value={values.phone}
                onChangeText={handleChange("phone")}
                onBlur={handleBlur("phone")}
                keyboardType="phone-pad"
                maxLength={10}
                className="border border-default rounded-lg px-4 py-3 placeholder:text-textPrimary"
              />
              {touched.phone && errors.phone && (
                <Text className="text-red-500 text-sm mt-1">
                  {errors.phone}
                </Text>
              )}
            </View>

            {/* Address Field */}
            <View>
              <Text className="font-medium mb-3">Address</Text>
              <TextInput
                placeholder="e.g. 123 Main Street, City (optional)"
                value={values.address}
                onChangeText={handleChange("address")}
                onBlur={handleBlur("address")}
                className="border border-default rounded-lg px-4 py-3 placeholder:text-textPrimary"
              />
            </View>

            {errorMessage && (
              <Text className="text-red-500 text-sm mt-1">{errorMessage}</Text>
            )}

            {/* Submit Button */}
            <Button
              title="Add Customer"
              onPress={handleSubmit}
              className="mt-4"
              loading={loading}
            />
          </View>
        )}
      </Formik>
    </AppModal>
  );
}
