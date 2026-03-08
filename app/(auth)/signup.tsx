import { useSignUp } from "@/src/hooks/useAuth";
import { SignUpSchema } from "@/src/utils/schemas";
import { useRouter } from "expo-router";
import { Formik } from "formik";
import { AlertCircle, Lock, Mail, ShieldCheck } from "lucide-react-native";
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Button from "../../src/components/ui/Button";
import Input from "../../src/components/ui/Input";

export default function SignUpPage() {
  const router = useRouter();
  const signUpMutation = useSignUp();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-6 py-4 flex-1 justify-start bg-white">
          {/* Logo */}
          <Image
            source={require("../../assets/images/greenlogo.png")}
            className="w-60 mt-3 mb-5 self-center"
            resizeMode="contain"
          />

          <Text className="text-h1 font-bold text-neutral-900 mb-1">
            Create Account
          </Text>
          <Text className="text-neutral-600 text-body mb-6">
            Sign up to start managing your bills and customers.
          </Text>

          <Formik
            initialValues={{ email: "", password: "", confirmPassword: "" }}
            validationSchema={SignUpSchema}
            onSubmit={(values) =>
              signUpMutation.mutate({
                email: values.email,
                password: values.password,
              })
            }
          >
            {({ handleChange, handleSubmit, values, errors, touched }) => (
              <>
                {/* Email */}
                <Text className="text-body font-semibold text-neutral-900 mb-2">
                  Email
                </Text>
                <Input
                  placeholder="e.g., vendor@example.com"
                  value={values.email}
                  onChangeText={handleChange("email")}
                  error={touched.email ? errors.email : undefined}
                  keyboardType="email-address"
                  icon={<Mail size={20} color="#6B7280" strokeWidth={1.8} />}
                  iconPosition="left"
                />

                {/* Password */}
                <Text className="text-body font-semibold text-neutral-900 mb-2 mt-2">
                  Password
                </Text>
                <Input
                  placeholder="Minimum 6 characters"
                  value={values.password}
                  onChangeText={handleChange("password")}
                  secureTextEntry
                  error={touched.password ? errors.password : undefined}
                  icon={<Lock size={20} color="#6B7280" strokeWidth={1.8} />}
                  iconPosition="left"
                />

                {/* Confirm Password */}
                <Text className="text-body font-semibold text-neutral-900 mb-2 mt-2">
                  Confirm Password
                </Text>
                <Input
                  placeholder="Re-enter your password"
                  value={values.confirmPassword}
                  onChangeText={handleChange("confirmPassword")}
                  secureTextEntry
                  error={
                    touched.confirmPassword ? errors.confirmPassword : undefined
                  }
                  icon={
                    <ShieldCheck size={20} color="#6B7280" strokeWidth={1.8} />
                  }
                  iconPosition="left"
                />

                {/* Server error */}
                {signUpMutation.isError && (
                  <View className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-2 mt-1 flex-row items-start gap-2">
                    <AlertCircle
                      size={16}
                      color="#dc2626"
                      strokeWidth={2}
                      style={{ marginTop: 1 }}
                    />
                    <Text className="text-red-600 text-sm flex-1">
                      {(signUpMutation.error as any)?.message ||
                        "Sign up failed. Please try again."}
                    </Text>
                  </View>
                )}

                {/* Sign Up Button */}
                <Button
                  title="Create Account"
                  onPress={handleSubmit}
                  loading={signUpMutation.isPending}
                  className="mt-4"
                />

                {/* Already have an account */}
                <TouchableOpacity
                  onPress={() => router.replace("/(auth)/login")}
                  className="mt-5 mb-4"
                >
                  <Text className="text-center text-neutral-500 text-sm">
                    Already have an account?{" "}
                    <Text className="text-primary font-semibold">Sign In</Text>
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </Formik>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
