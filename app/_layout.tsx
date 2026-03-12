import Loader from "@/src/components/feedback/Loader";
import { ToastProvider } from "@/src/components/feedback/Toast";
import { useAuth } from "@/src/hooks/useAuth";
import { useFontsLoader } from "@/src/hooks/useFontsLoader";
import { initSentry, Sentry } from "@/src/services/sentry";
import { ThemeProvider } from "@/src/utils/ThemeProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../global.css";
import "../src/i18n"; // initialise i18n (side-effect import)
import { useAuthStore } from "../src/store/authStore";
import { useLanguageStore } from "../src/store/languageStore";

// Initialise Sentry as early as possible — before any component mounts
initSentry();

// Required for expo-web-browser OAuth redirect handling (noop on Android/iOS,
// closes the auth session tab on web)
WebBrowser.maybeCompleteAuthSession();

// Keep native splash visible until first app frame is intentionally ready.
SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore if already prevented/hidden by the runtime.
});

const queryClient = new QueryClient();

function RootLayout() {
  // useAuth sets up supabase.auth.onAuthStateChange + restores the persisted
  // session on startup — this keeps auth.uid() valid for all RLS policies.
  useAuth();

  const {
    user,
    profile,
    loading: profileLoading,
    isRecoveryMode,
  } = useAuthStore();
  const loadLanguage = useLanguageStore((s) => s.loadLanguage);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [ready, setReady] = useState(false);

  const fontsLoaded = useFontsLoader();
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      try {
        const [seen] = await Promise.all([
          AsyncStorage.getItem("hasSeenWelcome"),
          loadLanguage(), // restore persisted language before first render
        ]);
        setShowWelcome(!seen);
      } catch (error) {
        console.warn("App init failed, continuing with defaults:", error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Hide native splash once basic app shell is ready.
  // Profile loading should not block splash; we show an in-app loader instead.
  useEffect(() => {
    if (fontsLoaded && !loading) {
      SplashScreen.hideAsync().catch(() => {
        // Ignore race where splash is already hidden.
      });
      setReady(true);
    }
  }, [fontsLoaded, loading]);

  // Navigate to the correct screen once ready
  useEffect(() => {
    if (!ready) return;

    if (isRecoveryMode) {
      router.replace("/(auth)/set-new-password" as any);
    } else if (!user) {
      router.replace(showWelcome ? "/" : ("/(auth)/login" as any));
    } else if (!profile && !profileLoading) {
      router.replace("/profile-error" as any);
    } else if (profile && !profile.onboarding_complete) {
      router.replace("/(auth)/onboarding" as any);
    } else if (profile?.onboarding_complete === true) {
      router.replace("/(main)/dashboard" as any);
    }
  }, [
    ready,
    isRecoveryMode,
    user,
    profile,
    profileLoading,
    showWelcome,
    router,
  ]);

  // Show loader until fonts, welcome check, AND profile fetch are all done
  if (!fontsLoaded || loading || (user && profileLoading)) return <Loader />;

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <ToastProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(main)" />
              <Stack.Screen name="profile-error" />
            </Stack>
            <StatusBar barStyle="dark-content" />
          </ToastProvider>
        </GestureHandlerRootView>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default Sentry.wrap(RootLayout);
