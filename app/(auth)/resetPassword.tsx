import { useResetPassword } from "@/src/hooks/useAuth";
import { ResetPasswordSchema } from "@/src/utils/schemas";
import { colors, spacing, typography } from "@/src/utils/theme";
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
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: spacing.screenPadding,
          }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: colors.paid.bg,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: spacing.lg,
            }}
          >
            <MailOpen size={40} color={colors.primaryDark} strokeWidth={1.5} />
          </View>
          <Text
            style={{
              ...typography.h2,
              textAlign: "center",
              color: colors.textPrimary,
              marginBottom: spacing.xs,
            }}
          >
            Check your inbox
          </Text>
          <Text
            style={{
              ...typography.body,
              color: colors.textSecondary,
              textAlign: "center",
              marginBottom: spacing.xl,
            }}
          >
            We sent a reset link to your email. Open it to set a new password.
          </Text>
          <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
            <Text
              style={{
                ...typography.body,
                color: colors.primary,
                fontWeight: "600",
              }}
            >
              ← Back to Login
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={{
              paddingHorizontal: spacing.screenPadding,
              paddingVertical: spacing.md,
              flex: 1,
              backgroundColor: colors.surface,
            }}
          >
            {/* Logo */}
            <Image
              source={require("../../assets/images/logo.png")}
              style={{
                width: 220,
                height: 220,
                marginTop: spacing.sm,
                marginBottom: spacing.md,
                alignSelf: "center",
              }}
              resizeMode="contain"
            />

            {/* Lock icon */}
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: colors.paid.bg,
                alignItems: "center",
                justifyContent: "center",
                alignSelf: "center",
                marginBottom: spacing.md,
              }}
            >
              <LockOpen
                size={32}
                color={colors.primaryDark}
                strokeWidth={1.5}
              />
            </View>

            <Text
              style={{
                ...typography.h1,
                color: colors.textPrimary,
                marginBottom: spacing.xs,
              }}
            >
              Forgot password?
            </Text>
            <Text
              style={{
                ...typography.body,
                color: colors.textSecondary,
                marginBottom: spacing.lg,
              }}
            >
              Enter your registered email and we&apos;ll send you a reset link.
            </Text>

            <Formik
              initialValues={{ email: "" }}
              validationSchema={ResetPasswordSchema}
              onSubmit={(values) => resetMutation.mutate(values.email)}
            >
              {({ handleChange, handleSubmit, values, errors, touched }) => (
                <>
                  <Text
                    style={{
                      ...typography.caption,
                      fontWeight: "700",
                      color: colors.textPrimary,
                      marginBottom: spacing.xs,
                    }}
                  >
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
                    <View
                      style={{
                        backgroundColor: colors.overdue.bg,
                        borderWidth: 1,
                        borderColor: colors.overdue.text,
                        borderRadius: 10,
                        paddingHorizontal: spacing.md,
                        paddingVertical: spacing.sm,
                        marginBottom: spacing.sm,
                      }}
                    >
                      <Text
                        style={{
                          color: colors.danger,
                          fontSize: 12,
                          textAlign: "center",
                        }}
                      >
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
                    style={{ marginTop: spacing.md }}
                  >
                    <Text
                      style={{
                        textAlign: "center",
                        color: colors.textSecondary,
                        fontSize: 12,
                      }}
                    >
                      Remember your password?{" "}
                      <Text style={{ color: colors.primary, fontWeight: "600" }}>
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
