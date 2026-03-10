import Loader from "@/src/components/feedback/Loader";
import { ToastProvider } from "@/src/components/feedback/Toast";
import { useAuth } from "@/src/hooks/useAuth";
import { useFontsLoader } from "@/src/hooks/useFontsLoader";
import { initSentry, Sentry } from "@/src/services/sentry";
import { ThemeProvider } from "@/src/utils/ThemeProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SplashScreen, Stack } from "expo-router";
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

  const fontsLoaded = useFontsLoader();

  useEffect(() => {
    const init = async () => {
      const [seen] = await Promise.all([
        AsyncStorage.getItem("hasSeenWelcome"),
        loadLanguage(), // restore persisted language before first render
      ]);
      setShowWelcome(!seen);
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (fontsLoaded && !loading && (!user || !profileLoading)) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, loading, user, profileLoading]);

  // Show loader until fonts, welcome check, AND profile fetch are all done
  if (!fontsLoaded || loading || (user && profileLoading)) return <Loader />;

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <ToastProvider>
            <Stack screenOptions={{ headerShown: false }}>
              {/* Highest priority: password recovery mode — shown regardless of
                  user/profile state so the set-new-password screen is never
                  replaced by the dashboard or onboarding guard mid-flow. */}
              {isRecoveryMode && (
                <Stack.Screen name="(auth)/set-new-password" />
              )}

              {/* Not logged in: show welcome or login */}
              {!isRecoveryMode && !user && showWelcome && (
                <Stack.Screen name="index" />
              )}
              {!isRecoveryMode && !user && !showWelcome && (
                <Stack.Screen name="(auth)/login" />
              )}

              {/* Logged in: session valid but profile fetch failed — prevents blank screen */}
              {!isRecoveryMode && user && !profile && !profileLoading && (
                <Stack.Screen name="profile-error" />
              )}

              {/* Logged in: onboarding not completed (false / null / undefined) */}
              {!isRecoveryMode &&
                user &&
                profile &&
                !profile.onboarding_complete && (
                  <Stack.Screen name="(auth)/onboarding" />
                )}

              {/* Logged in: onboarding done → main app */}
              {!isRecoveryMode &&
                user &&
                profile &&
                profile.onboarding_complete === true && (
                  <Stack.Screen name="(main)/dashboard" />
                )}
            </Stack>
            <StatusBar barStyle="dark-content" />
          </ToastProvider>
        </GestureHandlerRootView>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default Sentry.wrap(RootLayout);
