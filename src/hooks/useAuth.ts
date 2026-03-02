// src/hooks/useAuth.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { loginApi, logoutApi, resetPasswordApi, signUpApi } from "../api/auth";
import { supabase } from "../services/supabase";
import { useAuthStore } from "../store/authStore";
import { LoginValues } from "../types/auth";

export function useAuth() {
  const { user, profile, setUser, setProfile, logout, fetchProfile } =
    useAuthStore();

  useEffect(() => {
    let mounted = true;

    // Initialize session
    const initSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (mounted) setUser(data.session?.user ?? null);
    };

    initSession();

    // Subscribe to auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (!session) setProfile(null);
      },
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [setUser, setProfile]);

  // Automatically fetch profile when user logs in
  useEffect(() => {
    if (user && !profile) fetchProfile();
  }, [user, profile, fetchProfile]);

  return { user, profile, logout };
}

// 🔹 LOGIN MUTATION
export function useLogin() {
  const { setUser } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: (values: LoginValues) => loginApi(values),
    onSuccess: async (user) => {
      setUser(user);
      await AsyncStorage.setItem("hasSeenWelcome", "true");
      router.replace("/(main)/dashboard");
    },
    onError: (error: any) => {
      console.error("Login failed:", error.message);
    },
  });
}

// 🔹 SIGN UP MUTATION
export function useSignUp() {
  const { setUser, fetchProfile } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: (values: { email: string; password: string }) =>
      signUpApi(values),
    onSuccess: async (user) => {
      setUser(user);
      await AsyncStorage.setItem("hasSeenWelcome", "true");
      // fetchProfile picks up the new profile row; _layout.tsx then routes to onboarding
      await fetchProfile();
      router.replace("/(auth)/onboarding");
    },
    onError: (error: any) => {
      console.error("Sign-up failed:", error.message);
    },
  });
}

// 🔹 RESET PASSWORD MUTATION
export function useResetPassword() {
  return useMutation({
    mutationFn: (email: string) => resetPasswordApi(email),
    onError: (error: any) => {
      console.error("Reset password failed:", error.message);
    },
  });
}

// 🔹 LOGOUT MUTATION
export function useLogout() {
  const { setUser } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: logoutApi,
    onSuccess: async () => {
      setUser(null);
      await AsyncStorage.removeItem("hasSeenWelcome");
      router.replace("/(auth)/login");
    },
    onError: (error: any) => {
      console.error("Logout failed:", error.message);
    },
  });
}
