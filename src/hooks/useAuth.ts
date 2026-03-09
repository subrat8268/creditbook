// src/hooks/useAuth.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import {
  loginApi,
  logoutApi,
  resetPasswordApi,
  signInWithGoogleApi,
  signUpApi,
} from "../api/auth";
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

// 🔹 GOOGLE SIGN-IN MUTATION
export function useGoogleSignIn() {
  const { setUser, fetchProfile } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: signInWithGoogleApi,
    onSuccess: async (user) => {
      if (user) setUser(user);
      await AsyncStorage.setItem("hasSeenWelcome", "true");
      // Retry fetchProfile — Google OAuth creates the profile row via DB trigger
      // and it may not be committed immediately
      let retries = 3;
      while (retries > 0) {
        await fetchProfile();
        const { profile } = useAuthStore.getState();
        if (profile) break;
        await new Promise((r) => setTimeout(r, 600));
        retries--;
      }
      const { profile } = useAuthStore.getState();
      if (profile && !profile.onboarding_complete) {
        router.replace("/(auth)/onboarding/role" as any);
      } else {
        router.replace("/(main)/dashboard");
      }
    },
    onError: (error: any) => {
      // Cancelled by user — suppress noisy console error
      if (error?.message?.includes("cancelled")) return;
      console.error("Google sign-in failed:", error.message);
    },
  });
}

// 🔹 SIGN UP MUTATION
function friendlySignUpError(message: string): string {
  const msg = message.toLowerCase();
  if (msg.includes("rate limit") || msg.includes("email rate"))
    return "Too many sign-up attempts. Please wait a few minutes and try again, or disable email confirmation in your Supabase dashboard.";
  if (
    msg.includes("already registered") ||
    msg.includes("already exists") ||
    msg.includes("duplicate")
  )
    return "An account with this email already exists. Try signing in instead.";
  if (msg.includes("database error"))
    return "A server error occurred. Please try again in a moment.";
  if (msg.includes("invalid email"))
    return "Please enter a valid email address.";
  if (msg.includes("password") && msg.includes("weak"))
    return "Password is too weak. Use at least 6 characters.";
  return message;
}

export function useSignUp() {
  const { setUser, fetchProfile } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: (values: {
      email: string;
      password: string;
      fullName: string;
    }) => signUpApi(values),
    onSuccess: async (user) => {
      setUser(user);
      await AsyncStorage.setItem("hasSeenWelcome", "true");
      // The DB trigger creates the profile row right after auth.users INSERT.
      // Retry fetchProfile a few times in case the trigger hasn't committed yet.
      let retries = 3;
      while (retries > 0) {
        await fetchProfile();
        const { profile } = useAuthStore.getState();
        if (profile) break;
        await new Promise((r) => setTimeout(r, 600));
        retries--;
      }
      // Go directly to role selection (Step 1 of onboarding)
      router.replace("/(auth)/onboarding/role" as any);
    },
    onError: (error: any) => {
      // Re-throw with a friendly message so the UI can display it
      const friendly = friendlySignUpError(error?.message ?? "Sign up failed.");
      error.message = friendly;
      console.error("Sign-up failed:", friendly);
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
