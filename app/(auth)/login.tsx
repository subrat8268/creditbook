import { useGoogleSignIn, useLogin } from "@/src/hooks/useAuth";
import { LoginSchema } from "@/src/utils/schemas";
import { colors } from "@/src/utils/theme";
import { useRouter } from "expo-router";
import { Formik } from "formik";
import { AlertCircle, ArrowLeft, Eye, EyeOff } from "lucide-react-native";
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

export default function LoginPage() {
  const router = useRouter();
  const loginMutation = useLogin();
  const googleSignIn = useGoogleSignIn();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
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
          <View className="justify-center flex-1 px-6 pb-10">
            <TouchableOpacity
              onPress={() => router.back()}
              className="items-center justify-center w-10 h-10 mb-6 border rounded-full border-border"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <ArrowLeft size={20} color={colors.textPrimary} strokeWidth={2} />
            </TouchableOpacity>

            <AuthHeader
              title="Welcome Back"
              subtitle="Sign in to your kredBook"
            />

            <AuthCard>
              <Formik
                initialValues={{ email: "", password: "" }}
                validationSchema={LoginSchema}
                onSubmit={(values) => loginMutation.mutate(values)}
              >
                {({ handleChange, handleSubmit, values, errors, touched }) => (
                  <>
                    <Text className="text-[13px] font-semibold text-textPrimary mb-2">
                      Email Address
                    </Text>
                    <Input
                      placeholder="Enter your email address"
                      value={values.email}
                      onChangeText={handleChange("email")}
                      error={touched.email ? errors.email : undefined}
                      keyboardType="email-address"
                      variant="white"
                      testID="auth-login-email"
                    />

                    <Text className="text-[13px] font-semibold text-textPrimary mb-2 mt-4">
                      Password
                    </Text>
                    <Input
                      placeholder="Enter your password"
                      value={values.password}
                      onChangeText={handleChange("password")}
                      secureTextEntry={!showPassword}
                      error={touched.password ? errors.password : undefined}
                      variant="white"
                      testID="auth-login-password"
                      icon={
                        <TouchableOpacity
                          onPress={() => setShowPassword((p) => !p)}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
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

                    <TouchableOpacity
                      onPress={() =>
                        router.push("/(auth)/resetPassword" as any)
                      }
                      className="self-end mt-2.5 mb-5"
                    >
                      <Text className="text-sm font-medium text-primary">
                        Forgot password?
                      </Text>
                    </TouchableOpacity>

                    <Button
                      title="Sign In"
                      onPress={handleSubmit}
                      loading={loginMutation.isPending}
                      testID="auth-login-submit"
                    />

                    <AuthDivider />

                    <GoogleButton
                      onPress={() => googleSignIn.mutate()}
                      isPending={googleSignIn.isPending}
                      disabled={loginMutation.isPending}
                    />
                  </>
                )}
              </Formik>
            </AuthCard>

            {(loginMutation.isError || googleSignIn.isError) && (
              <View
                className="flex-row items-center self-center gap-2 px-4 py-3 mt-4 rounded-full"
                style={{
                  backgroundColor: colors.dangerBg,
                  borderWidth: 1,
                  borderColor: colors.danger + "44",
                }}
              >
                <AlertCircle
                  size={16}
                  color={colors.dangerStrong}
                  strokeWidth={2}
                />
                <Text className="text-sm text-dangerStrong">
                  {(loginMutation.error as any)?.message ??
                    (googleSignIn.error as any)?.message ??
                    "Invalid email or password"}
                </Text>
              </View>
            )}

            <TouchableOpacity
              onPress={() => router.push("/(auth)/signup" as any)}
              className="mt-8"
            >
              <Text className="text-sm text-center text-textSecondary">
                {"New to KredBook? "}
                <Text className="font-semibold text-primary">Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
