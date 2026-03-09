import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import * as ImagePicker from "expo-image-picker";
import { FieldArray, Formik } from "formik";
import { PlusCircle, Trash2, X } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    Text,
    TextInput,
    View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Button from "./ui/Button";
import Input from "./ui/Input";

type FieldType = "text" | "number" | "textarea";

interface FieldConfig {
  name: string;
  label: string;
  placeholder?: string;
  type?: FieldType;
  isImagePicker?: boolean;
}

interface BottomSheetFormProps<T> {
  visible: boolean;
  title: string;
  initialValues: T;
  validationSchema: any;
  fields: FieldConfig[];
  variantFields?: FieldConfig[];
  onSubmit: (values: T) => Promise<void> | void;
  onClose: () => void;
  isSubmitting?: boolean;
}

export default function BottomSheetForm<T extends Record<string, any>>({
  visible,
  title,
  initialValues,
  validationSchema,
  fields,
  variantFields,
  onSubmit,
  onClose,
  isSubmitting = false,
}: BottomSheetFormProps<T>) {
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["90%"], []);
  const [showVariants, setShowVariants] = useState(false);

  // Handle sheet open/close
  useEffect(() => {
    if (visible) {
      sheetRef.current?.expand();
      // Check if we have existing variants to show
      if (
        initialValues.variants &&
        Array.isArray(initialValues.variants) &&
        initialValues.variants.length > 0
      ) {
        setShowVariants(true);
      } else {
        setShowVariants(false);
      }
    } else {
      sheetRef.current?.close();
      setShowVariants(false);
    }
  }, [visible, initialValues]);

  const handleSheetChange = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
        setShowVariants(false);
      }
    },
    [onClose],
  );

  // Common Image Picker (Camera or Gallery)
  const handlePickImage = async (
    setFieldValue: (field: string, value: any) => void,
    fieldPath: string,
  ) => {
    Alert.alert("Select Image", "Choose image source", [
      {
        text: "Camera",
        onPress: async () => {
          const camPerm = await ImagePicker.requestCameraPermissionsAsync();
          if (camPerm.status !== "granted") {
            Alert.alert("Permission denied", "Please allow camera access.");
            return;
          }
          const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.8,
          });
          if (!result.canceled && result.assets?.[0]?.uri) {
            setFieldValue(fieldPath, result.assets[0].uri);
          }
        },
      },
      {
        text: "Gallery",
        onPress: async () => {
          const galPerm =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (galPerm.status !== "granted") {
            Alert.alert("Permission denied", "Please allow gallery access.");
            return;
          }
          const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            quality: 0.8,
          });
          if (!result.canceled && result.assets?.[0]?.uri) {
            setFieldValue(fieldPath, result.assets[0].uri);
          }
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onChange={handleSheetChange}
      handleIndicatorStyle={{ backgroundColor: colors.neutral[300], width: 40 }}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      backgroundStyle={{
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        backgroundColor: "white",
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
      }}
    >
      <BottomSheetScrollView style={{ flex: 1 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-3">
          <Text className="text-xl font-semibold text-textDark">{title}</Text>
          <Pressable onPress={onClose} disabled={isSubmitting}>
            <X size={22} color={colors.neutral[600]} strokeWidth={2} />
          </Pressable>
        </View>

        {/* Form */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              enableReinitialize
              onSubmit={async (values, { resetForm }) => {
                // Clean up variants if they're empty
                const cleanedValues = {
                  ...values,
                  variants:
                    values.variants?.filter((v: any) => v.name && v.price) ||
                    [],
                };

                await onSubmit(cleanedValues as T);
                resetForm();
                setShowVariants(false);
              }}
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                touched,
                setFieldValue,
                isValid,
              }) => (
                <View style={{ flexGrow: 1 }}>
                  {/* Base Fields */}
                  {fields.map((field) => {
                    const keyboardType =
                      field.type === "number" ? "decimal-pad" : "default";

                    if (field.isImagePicker) {
                      const imageUri = values[field.name];
                      return (
                        <View key={field.name} className="mb-3">
                          <Text className="text-sm font-medium text-textDark mb-1">
                            {field.label}
                          </Text>
                          <Pressable
                            onPress={() =>
                              handlePickImage(setFieldValue, field.name)
                            }
                            disabled={isSubmitting}
                            className="border border-dashed border-border rounded-lg py-3 items-center justify-center"
                          >
                            {imageUri ? (
                              <Text className="text-green-600">
                                ✅ Image Selected
                              </Text>
                            ) : (
                              <Text className="text-gray-500">
                                📷 Pick or Click Image
                              </Text>
                            )}
                          </Pressable>
                          {imageUri && (
                            <View className="mt-2 items-center">
                              <Image
                                source={{ uri: imageUri }}
                                className="w-20 h-20 rounded-lg"
                              />
                              <Pressable
                                onPress={() => setFieldValue(field.name, "")}
                                disabled={isSubmitting}
                                className="mt-1"
                              >
                                <Text className="text-red-500 text-xs">
                                  Remove
                                </Text>
                              </Pressable>
                            </View>
                          )}
                        </View>
                      );
                    }

                    return (
                      <View key={field.name} className="mb-3">
                        <Text className="text-sm font-medium text-textDark mb-1">
                          {field.label}
                        </Text>
                        <Input
                          placeholder={field.placeholder || ""}
                          variant="white"
                          value={String(values[field.name] || "")}
                          onChangeText={handleChange(field.name)}
                          secureTextEntry={false}
                          height={40}
                          keyboardType={keyboardType}
                          error={
                            touched[field.name] && errors[field.name]
                              ? String(errors[field.name])
                              : undefined
                          }
                        />
                      </View>
                    );
                  })}

                  {/* Add Variant Button */}
                  {variantFields && !showVariants && (
                    <Pressable
                      onPress={() => {
                        setShowVariants(true);
                        // Initialize with one empty variant if none exist
                        if (!values.variants || values.variants.length === 0) {
                          setFieldValue("variants", [
                            Object.fromEntries(
                              variantFields.map((vf) => [vf.name, ""]),
                            ),
                          ]);
                        }
                      }}
                      disabled={isSubmitting}
                      className="border border-dashed border-primary-dark rounded-xl py-3 mt-3 items-center justify-center"
                    >
                      <Text className="text-primary-dark font-medium">
                        + Add Variant (Optional)
                      </Text>
                    </Pressable>
                  )}

                  {/* Variant Section */}
                  {variantFields && showVariants && (
                    <View className="mt-4">
                      <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-lg font-semibold text-textDark">
                          Variants (Optional)
                        </Text>
                        <Pressable
                          onPress={() => {
                            setShowVariants(false);
                            setFieldValue("variants", []);
                          }}
                          disabled={isSubmitting}
                        >
                          <Text className="text-red-500 text-sm">
                            Remove All
                          </Text>
                        </Pressable>
                      </View>

                      <FieldArray name="variants">
                        {({ push, remove }) => (
                          <View>
                            {values.variants?.map(
                              (variant: any, index: number) => (
                                <View
                                  key={index}
                                  className="border border-border rounded-xl p-3 mb-3"
                                >
                                  <View className="flex-row justify-between items-center mb-2">
                                    <Text className="font-medium text-textDark">
                                      Variant {index + 1}
                                    </Text>
                                    {values.variants.length > 1 && (
                                      <Pressable
                                        onPress={() => remove(index)}
                                        disabled={isSubmitting}
                                      >
                                        <Trash2
                                          size={18}
                                          color={colors.danger.DEFAULT}
                                          strokeWidth={2}
                                        />
                                      </Pressable>
                                    )}
                                  </View>

                                  {variantFields.map((vf) => {
                                    const fieldPath = `variants.${index}.${vf.name}`;
                                    const value = variant?.[vf.name] ?? "";

                                    if (vf.isImagePicker) {
                                      return (
                                        <View key={vf.name} className="mb-2">
                                          <Text className="text-sm font-medium text-textDark mb-1">
                                            {vf.label}
                                          </Text>
                                          <Pressable
                                            onPress={() =>
                                              handlePickImage(
                                                setFieldValue,
                                                fieldPath,
                                              )
                                            }
                                            disabled={isSubmitting}
                                            className="border border-dashed border-border rounded-lg py-3 items-center justify-center"
                                          >
                                            <Text className="text-gray-500">
                                              {value
                                                ? "📷 Change Image"
                                                : "📷 Pick or Click Image"}
                                            </Text>
                                          </Pressable>
                                          {value ? (
                                            <View className="mt-2 items-center">
                                              <Image
                                                source={{ uri: value }}
                                                className="w-20 h-20 rounded-lg"
                                              />
                                              <Pressable
                                                onPress={() =>
                                                  setFieldValue(fieldPath, "")
                                                }
                                                disabled={isSubmitting}
                                                className="mt-1"
                                              >
                                                <Text className="text-red-500 text-xs">
                                                  Remove
                                                </Text>
                                              </Pressable>
                                            </View>
                                          ) : null}
                                        </View>
                                      );
                                    }

                                    return (
                                      <View key={vf.name} className="mb-2">
                                        <Text className="text-sm font-medium text-textDark mb-1">
                                          {vf.label}
                                        </Text>
                                        <TextInput
                                          placeholder={vf.placeholder}
                                          onChangeText={handleChange(fieldPath)}
                                          onBlur={handleBlur(fieldPath)}
                                          value={String(value)}
                                          keyboardType={
                                            vf.type === "number"
                                              ? "numeric"
                                              : "default"
                                          }
                                          editable={!isSubmitting}
                                          className="border border-border rounded-lg px-3 py-2 text-base text-textDark"
                                          placeholderTextColor={colors.neutral[400]}
                                        />
                                      </View>
                                    );
                                  })}
                                </View>
                              ),
                            )}

                            <Button
                              title="Add Another Variant"
                              onPress={() =>
                                push(
                                  Object.fromEntries(
                                    variantFields.map((vf) => [vf.name, ""]),
                                  ),
                                )
                              }
                              disabled={isSubmitting}
                              className="border border-dashed border-primary-dark rounded-xl py-2 mt-1 flex-row items-center justify-center"
                              icon={
                                <PlusCircle
                                  size={20}
                                  color={colors.primary.dark}
                                  strokeWidth={2}
                                />
                              }
                            />
                          </View>
                        )}
                      </FieldArray>
                    </View>
                  )}

                  {/* Submit Button */}
                  <Button
                    onPress={() => handleSubmit()}
                    title={isSubmitting ? "Saving..." : "Save"}
                    disabled={isSubmitting}
                    className="bg-primary-dark rounded-xl py-3 my-5"
                    icon={
                      isSubmitting ? (
                        <ActivityIndicator color="white" size="small" />
                      ) : undefined
                    }
                  />
                </View>
              )}
            </Formik>
          </ScrollView>
        </KeyboardAvoidingView>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}
