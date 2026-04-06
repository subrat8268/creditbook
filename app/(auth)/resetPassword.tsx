import { useResetPassword } from "@/src/hooks/useAuth";
import { ResetPasswordSchema } from "@/src/utils/schemas";
import { colors } from "@/src/utils/theme";
import { useRouter } from "expo-router";
import { Formik } from "formik";
import { LockOpen, Mail, MailOpen } from "lucide-react-native";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../../src/components/ui/Button";
import Input from "../../src/components/ui/Input";

export default function ResetPasswordPage() {
  const router = useRouter();
  const resetMutation = useResetPassword();

  // ── Success state ─────────────────────────────────────────
  if (resetMutation.isSuccess) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "#ffffff" }}
        edges={["top"]}
      >
        <View className="flex-1 bg-white justify-center items-center px-6">
          <View className="w-20 h-20 rounded-full bg-success-light items-center justify-center mb-6">
            <MailOpen size={40} color={colors.primaryDark} strokeWidth={1.5} />
          </View>
          <Text className="text-2xl font-bold text-neutral-900 text-center mb-2">
            Check Your Inbox!
          </Text>
          <Text className="text-neutral-500 text-body text-center mb-8">
            We{"'"}ve sent a password reset link to your email address. Follow the
            link to set a new password.
          </Text>
          <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
            <Text className="text-primary font-semibold text-base">
              ← Back to Login
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#ffffff" }}
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
        >
          <View className="px-6 py-4 flex-1 justify-start bg-white">
            {/* Logo */}
            <Image
              source={require("../../assets/images/logo.png")}
              className="w-60 h-60 mt-3 mb-5 self-center"
              resizeMode="contain"
            />

            {/* Lock icon */}
            <View className="w-16 h-16 rounded-full bg-success-light items-center justify-center self-center mb-5">
              <LockOpen
                size={32}
                color={colors.primaryDark}
                strokeWidth={1.5}
              />
            </View>

            <Text className="text-h1 font-bold text-neutral-900 mb-1">
              Forgot Password?
            </Text>
            <Text className="text-neutral-600 text-body mb-6">
              Enter your registered email and we{"'"}ll send you a reset link.
            </Text>

            <Formik
              initialValues={{ email: "" }}
              validationSchema={ResetPasswordSchema}
              onSubmit={(values) => resetMutation.mutate(values.email)}
            >
              {({ handleChange, handleSubmit, values, errors, touched }) => (
                <>
                  <Text className="text-body font-semibold text-neutral-900 mb-2">
                    Email Address
                  </Text>
                  <Input
                    placeholder="e.g., vendor@example.com"
                    value={values.email}
                    onChangeText={handleChange("email")}
                    error={touched.email ? errors.email : undefined}
                    keyboardType="email-address"
                    icon={
                      <Mail
                        size={20}
                        color={colors.textSecondary}
                        strokeWidth={1.8}
                      />
                    }
                    iconPosition="left"
                  />

                  {/* Server error */}
                  {resetMutation.isError && (
                    <View className="bg-danger-bg border border-danger-light rounded-lg px-4 py-3 mb-2">
                      <Text className="text-danger-strong text-sm text-center">
                        {(resetMutation.error as any)?.message ||
                          "Something went wrong. Please try again."}
                      </Text>
                    </View>
                  )}

                  <Button
                    title="Send Reset Link"
                    onPress={handleSubmit}
                    loading={resetMutation.isPending}
                    className="mt-4"
                  />

                  <TouchableOpacity
                    onPress={() => router.back()}
                    className="mt-5"
                  >
                    <Text className="text-center text-neutral-500 text-sm">
                      Remember your password?{" "}
                      <Text className="text-primary font-semibold">
                        Sign In
                      </Text>
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </Formik>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
