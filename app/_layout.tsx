import Loader from "@/src/components/feedback/Loader";
import { useAuth } from "@/src/hooks/useAuth";
import { useFontsLoader } from "@/src/hooks/useFontsLoader";
import { initSentry, Sentry } from "@/src/services/sentry";
import { ThemeProvider } from "@/src/utils/ThemeProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SplashScreen, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../global.css";
import "../src/i18n"; // initialise i18n (side-effect import)
import { useAuthStore } from "../src/store/authStore";
import { useLanguageStore } from "../src/store/languageStore";

// Initialise Sentry as early as possible — before any component mounts
initSentry();

const queryClient = new QueryClient();

function RootLayout() {
  // useAuth sets up supabase.auth.onAuthStateChange + restores the persisted
  // session on startup — this keeps auth.uid() valid for all RLS policies.
  useAuth();

  const {
    user,
    profile,
    fetchProfile,
    loading: profileLoading,
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

  // setUser now calls fetchProfile internally, so no separate effect needed.
  // We still watch for edge cases where user appears without triggering setUser.
  useEffect(() => {
    if (user && !profile && !profileLoading) {
      fetchProfile();
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

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
          <Stack screenOptions={{ headerShown: false }}>
            {/* Not logged in: show welcome or login */}
            {!user && showWelcome && <Stack.Screen name="index" />}
            {!user && !showWelcome && <Stack.Screen name="(auth)/login" />}

            {/* Logged in: onboarding not completed (false / null / undefined) */}
            {user && profile && !profile.onboarding_complete && (
              <Stack.Screen name="(auth)/onboarding" />
            )}

            {/* Logged in: onboarding done → main app */}
            {user && profile && profile.onboarding_complete === true && (
              <Stack.Screen name="(main)/dashboard" />
            )}
          </Stack>
          <StatusBar barStyle="dark-content" />
        </GestureHandlerRootView>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default Sentry.wrap(RootLayout);
