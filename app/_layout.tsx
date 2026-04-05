import Loader from "@/src/components/feedback/Loader";
import { ToastProvider } from "@/src/components/feedback/Toast";
import { useAuth } from "@/src/hooks/useAuth";
import { useFontsLoader } from "@/src/hooks/useFontsLoader";
import { ThemeProvider } from "@/src/utils/ThemeProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import "../global.css";
import "../src/i18n";
import { useAuthStore } from "../src/store/authStore";
import { useLanguageStore } from "../src/store/languageStore";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { initSentry, wrap } from "@/src/services/sentry";

initSentry();

WebBrowser.maybeCompleteAuthSession();

SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore if already prevented/hidden by the runtime.
});

const queryClient = new QueryClient();

function RootLayout() {
  useAuth();

  const { user, profile, isInitialized, isFetchingProfile, isRecoveryMode } =
    useAuthStore();
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
  }, [loadLanguage]);

  useEffect(() => {
    if (fontsLoaded && !loading) {
      SplashScreen.hideAsync().catch(() => {
        // Ignore race where splash is already hidden.
      });
      setReady(true);
    }
  }, [fontsLoaded, loading]);

  // Single Source of Truth for Routing
  useEffect(() => {
    if (!ready || !isInitialized) return;

    // If we are actively fetching the profile, do nothing (Loader will show)
    if (user && isFetchingProfile && !profile) return;

    if (isRecoveryMode) {
      router.replace("/(auth)/set-new-password" as any);
    } else if (!user) {
      router.replace(showWelcome ? "/" : ("/(auth)/login" as any));
    } else if (!profile) {
      router.replace("/profile-error" as any);
    } else if (!profile.onboarding_complete) {
      router.replace("/(auth)/onboarding/role" as any);
    } else {
      router.replace("/(main)/dashboard" as any);
    }
  }, [
    ready,
    isInitialized,
    isRecoveryMode,
    user,
    profile,
    isFetchingProfile,
    showWelcome,
    router,
  ]);

  // Show loader until fonts, welcome check, AND initial auth check are done
  if (
    !fontsLoaded ||
    loading ||
    !isInitialized ||
    (user && isFetchingProfile && !profile)
  ) {
    return <Loader />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SafeAreaProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <BottomSheetModalProvider>
              <ToastProvider>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="index" />
                  <Stack.Screen name="(auth)" />
                  <Stack.Screen name="(main)" />
                  <Stack.Screen name="profile-error" />
                </Stack>
                <StatusBar barStyle="dark-content" />
              </ToastProvider>
            </BottomSheetModalProvider>
          </GestureHandlerRootView>
        </SafeAreaProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default wrap(RootLayout);
