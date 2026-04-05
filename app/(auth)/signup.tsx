import { useGoogleSignIn, useSignUp } from "@/src/hooks/useAuth";
import { SignUpSchema } from "@/src/utils/schemas";
import { colors } from "@/src/utils/theme";
import { useRouter } from "expo-router";
import { Formik } from "formik";
import { AlertCircle, Eye, EyeOff } from "lucide-react-native";
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
import AuthCard from "../../src/components/ui/AuthCard";
import AuthDivider from "../../src/components/ui/AuthDivider";
import AuthHeader from "../../src/components/ui/AuthHeader";
import Button from "../../src/components/ui/Button";
import GoogleButton from "../../src/components/ui/GoogleButton";
import Input from "../../src/components/ui/Input";

export default function SignUpPage() {
  const router = useRouter();
  const signUpMutation = useSignUp();
  const googleSignIn = useGoogleSignIn();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      edges={["top"]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-6 pb-10 justify-center">
            <AuthHeader
              title="Create Account"
              subtitle="Set up your KredBook in 2 minutes"
            />

            <AuthCard>
              <Formik
                initialValues={{
                  fullName: "",
                  email: "",
                  password: "",
                  confirmPassword: "",
                }}
                validationSchema={SignUpSchema}
                onSubmit={(values) =>
                  signUpMutation.mutate({
                    fullName: values.fullName,
                    email: values.email,
                    password: values.password,
                  })
                }
              >
                {({ handleChange, handleSubmit, values, errors, touched }) => (
                  <>
                    <Text className="text-[13px] font-semibold text-textPrimary mb-2">
                      Full Name
                    </Text>
                    <Input
                      placeholder="Enter your full name"
                      value={values.fullName}
                      onChangeText={handleChange("fullName")}
                      error={touched.fullName ? errors.fullName : undefined}
                      variant="white"
                    />

                    <Text className="text-[13px] font-semibold text-textPrimary mb-2 mt-4">
                      Email Address
                    </Text>
                    <Input
                      placeholder="email@example.com"
                      value={values.email}
                      onChangeText={handleChange("email")}
                      error={touched.email ? errors.email : undefined}
                      keyboardType="email-address"
                      variant="white"
                    />

                    <Text className="text-[13px] font-semibold text-textPrimary mb-2 mt-4">
                      Password
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
                          onPress={() => setShowPassword((prev) => !prev)}
                          accessibilityLabel="Toggle password visibility"
                        >
                          {showPassword ? (
                            <EyeOff
                              size={20}
                              color={colors.textSecondary}
                              strokeWidth={1.8}
                            />
                          ) : (
                            <Eye
                              size={20}
                              color={colors.textSecondary}
                              strokeWidth={1.8}
                            />
                          )}
                        </TouchableOpacity>
                      }
                      iconPosition="right"
                    />

                    <Text className="text-[13px] font-semibold text-textPrimary mb-2 mt-4">
                      Confirm Password
                    </Text>
                    <Input
                      placeholder="Re-enter your password"
                      value={values.confirmPassword}
                      onChangeText={handleChange("confirmPassword")}
                      secureTextEntry={!showConfirmPassword}
                      error={
                        touched.confirmPassword
                          ? errors.confirmPassword
                          : undefined
                      }
                      variant="white"
                      icon={
                        <TouchableOpacity
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                          onPress={() => setShowConfirmPassword((p) => !p)}
                          accessibilityLabel="Toggle confirm password visibility"
                        >
                          {showConfirmPassword ? (
                            <EyeOff
                              size={20}
                              color={colors.textSecondary}
                              strokeWidth={1.8}
                            />
                          ) : (
                            <Eye
                              size={20}
                              color={colors.textSecondary}
                              strokeWidth={1.8}
                            />
                          )}
                        </TouchableOpacity>
                      }
                      iconPosition="right"
                    />

                    <Button
                      title="Create Account"
                      onPress={handleSubmit}
                      loading={signUpMutation.isPending}
                      className="mt-5"
                    />

                    <AuthDivider />

                    <GoogleButton
                      onPress={() => googleSignIn.mutate()}
                      isPending={googleSignIn.isPending}
                      disabled={signUpMutation.isPending}
                    />
                  </>
                )}
              </Formik>
            </AuthCard>

            {(signUpMutation.isError || googleSignIn.isError) && (
              <View className="flex-row items-center self-center gap-2 rounded-full px-4 py-3 mt-4 bg-dangerBg border border-red-200">
                <AlertCircle
                  size={16}
                  color={colors.dangerStrong}
                  strokeWidth={2}
                />
                <Text className="text-dangerStrong text-sm">
                  {(signUpMutation.error as any)?.message ??
                    (googleSignIn.error as any)?.message ??
                    "Something went wrong. Please try again."}
                </Text>
              </View>
            )}

            <TouchableOpacity
              onPress={() => router.replace("/(auth)/login")}
              className="mt-4 mb-10"
            >
              <Text className="text-center text-textSecondary text-sm">
                {"Already have an account? "}
                <Text className="text-primary font-semibold">Log In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
