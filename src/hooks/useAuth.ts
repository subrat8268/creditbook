// src/hooks/useAuth.ts
import { Sentry } from "@/src/services/sentry";
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
  const { user, profile, setUser, setProfile, logout, setRecoveryMode } =
    useAuthStore();
  const router = useRouter();

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
      (event, session) => {
        if (event === "PASSWORD_RECOVERY") {
          setRecoveryMode(true);
          router.replace("/(auth)/set-new-password" as any);
          return;
        }

        setUser(session?.user ?? null);
        if (!session) setProfile(null);
      },
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [setUser, setProfile, router]);

  // fetchProfile is triggered inside setUser — no separate effect needed.

  return { user, profile, logout };
}

// 🔹 LOGIN MUTATION
export function useLogin() {
  const { setUser, fetchProfile } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: (values: LoginValues) => loginApi(values),
    onSuccess: async (user) => {
      setUser(user);
      await AsyncStorage.setItem("hasSeenWelcome", "true");

      // Fetch profile before navigating so the root layout guard
      // always receives a non-null profile — prevents navigation flicker.
      await fetchProfile();
      const { profile } = useAuthStore.getState();

      Sentry.addBreadcrumb({
        category: "auth",
        message: "auth_login_success",
        level: "info",
        data: { userId: user?.id, hasProfile: !!profile },
      });

      if (!profile) {
        // fetchProfile completed but returned null (DB fetch + upsert both failed).
        // Routing to dashboard would target a Stack.Screen that is not registered
        // when profile=null — the root layout shows profile-error instead.
        router.replace("/profile-error" as any);
      } else if (!profile.onboarding_complete) {
        router.replace("/(auth)/onboarding/role" as any);
      } else {
        router.replace("/(main)/dashboard");
      }
    },
    onError: (error: any) => {
      console.error("Login failed:", error.message);
    },
  });
}

// 🔹 GOOGLE SIGN-IN MUTATION
async function createMinimalProfile(userId: string): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .upsert(
      { user_id: userId, onboarding_complete: false },
      { onConflict: "user_id", ignoreDuplicates: true },
    );
  if (error) {
    console.error("createMinimalProfile failed:", error.message);
  }
}

export function useGoogleSignIn() {
  const { setUser, fetchProfile } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      // Emit the breadcrumb here — before openAuthSessionAsync — so it fires
      // at the true start of the OAuth flow, not after completion.
      Sentry.addBreadcrumb({
        category: "auth",
        message: "google_oauth_start",
        level: "info",
      });
      return signInWithGoogleApi();
    },
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

      if (!profile) {
        // DB trigger did not fire or lost the race — create a minimal stub
        // so the root layout always has a non-null profile to evaluate.
        // onboarding_complete defaults to false → user will go through onboarding.
        if (user) await createMinimalProfile(user.id);
        await fetchProfile(); // re-read the row we just inserted
        Sentry.addBreadcrumb({
          category: "auth",
          message: "google_oauth_success",
          level: "info",
          data: { userId: user?.id, profileCreated: true },
        });
        router.replace("/(auth)/onboarding/role" as any);
        return;
      }

      Sentry.addBreadcrumb({
        category: "auth",
        message: "google_oauth_success",
        level: "info",
        data: {
          userId: user?.id,
          onboardingComplete: profile.onboarding_complete,
        },
      });

      if (!profile.onboarding_complete) {
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
      Sentry.addBreadcrumb({
        category: "auth",
        message: "signup_success",
        level: "info",
        data: { userId: user?.id },
      });

      const { profile: signedUpProfile } = useAuthStore.getState();
      if (!signedUpProfile) {
        // All retries exhausted and profile is still null (network failure or
        // DB trigger didn't commit). Route to the error screen so the user
        // sees a Retry option rather than a blank/broken onboarding screen.
        router.replace("/profile-error" as any);
        return;
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
  const router = useRouter();

  return useMutation({
    mutationFn: logoutApi,
    onSuccess: async () => {
      Sentry.addBreadcrumb({
        category: "auth",
        message: "logout",
        level: "info",
      });
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
