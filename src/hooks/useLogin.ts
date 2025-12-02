import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { loginApi } from "../api/auth";
import { useAuthStore } from "../store/authStore";
import { LoginValues } from "../types/auth";

export function useLogin() {
  const { setUser, setProfile } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: (values: LoginValues) => loginApi(values),
    onSuccess: async ({ user, profile }) => {
      setUser(user);
      setProfile(profile);
      router.replace("/(main)/dashboard");
    },
    onError: (err) => {
      console.error("Login failed:", err);
    },
  });
}
