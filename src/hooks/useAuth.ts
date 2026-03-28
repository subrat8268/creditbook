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
  const { setAuth, logout, setRecoveryMode } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    // Initialize session — setAuth handles fetchProfile internally
    const initSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (mounted) setAuth(data.session?.user ?? null);
    };

    initSession();

    // Subscribe to auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "PASSWORD_RECOVERY") {
          setRecoveryMode(true);
          router.replace("/(auth)/set-new-password" as any);
          return;
        }

        setAuth(session?.user ?? null);
      },
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [setAuth, setRecoveryMode, router]);

  // fetchProfile is triggered inside setAuth — no separate effect needed.

  return { logout };
}

// 🔹 LOGIN MUTATION
export function useLogin() {
  return useMutation({
    mutationFn: (values: LoginValues) => loginApi(values),
    onSuccess: async () => {
      await AsyncStorage.setItem("hasSeenWelcome", "true");
      // DO NOTHING ELSE.
      // supabase.auth.signInWithPassword triggers onAuthStateChange.
      // onAuthStateChange calls setAuth(user).
      // setAuth(user) calls fetchProfile(user.id).
      // _layout.tsx sees the new state and routes perfectly.
    },
    onError: (error: any) => {
      console.error("Login failed:", error.message);
    },
  });
}

// 🔹 GOOGLE SIGN-IN MUTATION
export function useGoogleSignIn() {
  const { setAuth, fetchProfile } = useAuthStore();

  return useMutation({
    mutationFn: async () => signInWithGoogleApi(),
    onSuccess: async (user) => {
      if (user) setAuth(user);
      await AsyncStorage.setItem("hasSeenWelcome", "true");

      // Retry fetchProfile — Google OAuth creates the profile row via DB trigger
      // and it may not be committed immediately.
      // fetchProfile handles the upsert fallback internally if the row is missing.
      let retries = 3;
      while (retries > 0) {
        if (user) await fetchProfile(user.id);
        const { profile } = useAuthStore.getState();
        if (profile) break;
        await new Promise((r) => setTimeout(r, 600));
        retries--;
      }
      // _layout.tsx reads the updated store state and routes — no router.replace needed.
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
  const { setAuth, fetchProfile } = useAuthStore();

  return useMutation({
    mutationFn: (values: {
      email: string;
      password: string;
      fullName: string;
    }) => signUpApi(values),
    onSuccess: async (user) => {
      if (user) setAuth(user);
      await AsyncStorage.setItem("hasSeenWelcome", "true");
      // The DB trigger creates the profile row right after auth.users INSERT.
      // Retry fetchProfile a few times in case the trigger hasn't committed yet.
      // fetchProfile handles the upsert fallback internally if the row is missing.
      let retries = 3;
      while (retries > 0) {
        if (user) await fetchProfile(user.id);
        const { profile } = useAuthStore.getState();
        if (profile) break;
        await new Promise((r) => setTimeout(r, 600));
        retries--;
      }
      // _layout.tsx reads the updated store state and routes — no router.replace needed.
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
  const router = useRouter();

  return useMutation({
    mutationFn: logoutApi,
    onSuccess: async () => {
      // Do NOT call setUser(null) here. supabase.auth.signOut() synchronously
      // fires onAuthStateChange(SIGNED_OUT) which already calls setUser(null)
      // — clearing user + profile in the store. Calling it a second time here
      // was a redundant double-write (R2 race condition).
      // hasSeenWelcome is intentionally deleted on every logout so the welcome
      // screen re-appears on the next fresh launch. This supports re-engagement
      // for users who switch accounts or reinstall. Document clearly so future
      // developers don't mistake this for a bug.
      await AsyncStorage.removeItem("hasSeenWelcome");
      router.replace("/(auth)/login");
    },
    onError: (error: any) => {
      console.error("Logout failed:", error.message);
    },
  });
}
