import { useLogin } from "@/src/hooks/useAuth";
import { LoginSchema } from "@/src/utils/schemas";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Formik } from "formik";
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

export default function LoginPage() {
  const router = useRouter();
  const loginMutation = useLogin();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0} // Optional: Adjust offset for your header
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled" // Allows taps on buttons while keyboard is open
      >
        <View className="px-6 py-4 flex-1 justify-start bg-white">
          <Image
            source={require("../../assets/images/greenlogo.png")}
            className="w-60 mt-3 mb-5 self-center"
            resizeMode="contain"
          />

          <Text className="text-h1 font-bold text-neutral-900 mb-1">
            Welcome Back!
          </Text>
          <Text className="text-neutral-600 text-body mb-6">
            Enter your registered details to access your account.
          </Text>

          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={LoginSchema}
            onSubmit={(values) => loginMutation.mutate(values)}
          >
            {({
              handleChange,
              handleSubmit,
              values,
              errors,
              touched,
              isSubmitting,
            }) => (
              <>
                <Text className="text-body font-semibold text-neutral-900 mb-2">
                  Email
                </Text>
                <Input
                  placeholder="e.g., vendor@example.com"
                  value={values.email}
                  onChangeText={handleChange("email")}
                  error={touched.email ? errors.email : undefined}
                  icon={
                    <Ionicons name="mail-outline" size={20} color="#6B7280" />
                  }
                  iconPosition="left"
                />
                <Text className="text-sm text-neutral-600 mb-4">
                  We’ll use this to verify your identity.
                </Text>

                <Text className="text-body font-semibold text-neutral-900 mb-2">
                  Password
                </Text>
                <Input
                  placeholder="Enter your password" // Changed placeholder to be more relevant
                  value={values.password}
                  onChangeText={handleChange("password")}
                  secureTextEntry
                  error={touched.password ? errors.password : undefined}
                  icon={
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color="#6B7280"
                    />
                  }
                  iconPosition="left"
                />

                <TouchableOpacity
                  onPress={() => router.push("/(auth)/resetPassword")}
                  className="mb-6"
                >
                  <Text className="text-primary text-sm font-medium">
                    Forgot Password?
                  </Text>
                </TouchableOpacity>

                <Button
                  title="Login Securely"
                  onPress={handleSubmit}
                  loading={loginMutation.isPending}
                />

                {/* Error Message */}
                {loginMutation.isError && (
                  <Text className="text-red-500 text-center mt-2">
                    {(loginMutation.error as any)?.message || "Login failed"}
                  </Text>
                )}

                <Text className="text-center text-neutral-500 text-sm mt-4">
                  Contact Admin for credentials
                </Text>
              </>
            )}
          </Formik>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
