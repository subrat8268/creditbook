import { useToast } from "@/src/components/feedback/Toast";
import { supabase } from "@/src/services/supabase";
import { useAuthStore } from "@/src/store/authStore";
import { colors } from "@/src/utils/theme";
import { useRouter } from "expo-router";
import { Formik } from "formik";
import { Eye, EyeOff, KeyRound } from "lucide-react-native";
import { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Yup from "yup";
import Button from "../../src/components/ui/Button";
import Input from "../../src/components/ui/Input";

const SetNewPasswordSchema = Yup.object().shape({
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("New password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords do not match")
    .required("Please confirm your password"),
});

export default function SetNewPasswordPage() {
  const router = useRouter();
  const { show } = useToast();
  const setRecoveryMode = useAuthStore((s) => s.setRecoveryMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (
    values: { password: string; confirmPassword: string },
    { setSubmitting }: { setSubmitting: (v: boolean) => void },
  ) => {
    const { error } = await supabase.auth.updateUser({
      password: values.password,
    });

    setSubmitting(false);

    if (error) {
      show({ message: error.message, type: "error" });
      return;
    }

    show({ message: "Password updated successfully", type: "success" });

    // Clear recovery pin so the root layout guard resumes normal evaluation.
    // Sign out so the Supabase recovery session is invalidated and the
    // USER_UPDATED event cannot race the router and land the user on dashboard.
    setRecoveryMode(false);
    await supabase.auth.signOut();
    router.replace("/(auth)/login");
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#F6F7F9" }}
      edges={["top"]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-white"
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-6 py-10 justify-center">
            {/* Icon */}
            <View className="w-16 h-16 rounded-full bg-success-light items-center justify-center self-center mb-6">
              <KeyRound
                size={32}
                color={colors.primaryDark}
                strokeWidth={1.5}
              />
            </View>

            {/* Heading */}
            <Text className="text-2xl font-bold text-neutral-900 text-center mb-2">
              Set New Password
            </Text>
            <Text className="text-neutral-500 text-sm text-center mb-8">
              Choose a strong password for your CreditBook account.
            </Text>

            <Formik
              initialValues={{ password: "", confirmPassword: "" }}
              validationSchema={SetNewPasswordSchema}
              onSubmit={handleSubmit}
            >
              {({
                handleChange,
                handleSubmit: submit,
                values,
                errors,
                touched,
                isSubmitting,
              }) => (
                <>
                  {/* New Password */}
                  <Text className="text-[13px] font-semibold text-textDark mb-2">
                    New Password
                  </Text>
                  <Input
                    placeholder="Min. 6 characters"
                    value={values.password}
                    onChangeText={handleChange("password")}
                    secureTextEntry={!showPassword}
                    error={touched.password ? errors.password : undefined}
                    variant="white"
                    icon={
                      <TouchableOpacity
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        onPress={() => setShowPassword((p) => !p)}
                        accessibilityLabel="Toggle password visibility"
                      >
                        {showPassword ? (
                          <EyeOff
                            size={20}
                            color={"#AEAEB2"}
                            strokeWidth={1.8}
                          />
                        ) : (
                          <Eye
                            size={20}
                            color={"#AEAEB2"}
                            strokeWidth={1.8}
                          />
                        )}
                      </TouchableOpacity>
                    }
                    iconPosition="right"
                  />

                  {/* Confirm Password */}
                  <Text className="text-[13px] font-semibold text-textDark mb-2 mt-4">
                    Confirm Password
                  </Text>
                  <Input
                    placeholder="Re-enter your password"
                    value={values.confirmPassword}
                    onChangeText={handleChange("confirmPassword")}
                    secureTextEntry={!showConfirm}
                    error={
                      touched.confirmPassword
                        ? errors.confirmPassword
                        : undefined
                    }
                    variant="white"
                    icon={
                      <TouchableOpacity
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        onPress={() => setShowConfirm((p) => !p)}
                        accessibilityLabel="Toggle confirm password visibility"
                      >
                        {showConfirm ? (
                          <EyeOff
                            size={20}
                            color={"#AEAEB2"}
                            strokeWidth={1.8}
                          />
                        ) : (
                          <Eye
                            size={20}
                            color={"#AEAEB2"}
                            strokeWidth={1.8}
                          />
                        )}
                      </TouchableOpacity>
                    }
                    iconPosition="right"
                  />

                  <Button
                    title="Update Password"
                    onPress={submit}
                    loading={isSubmitting}
                    className="mt-6"
                  />
                </>
              )}
            </Formik>

            <TouchableOpacity
              onPress={() => router.replace("/(auth)/login")}
              className="mt-6 items-center"
            >
              <Text className="text-textSecondary text-sm">
                {"Back to "}
                <Text className="text-primary font-semibold">Log In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
