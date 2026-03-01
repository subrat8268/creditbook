import Loader from "@/src/components/feedback/Loader";
import { useFontsLoader } from "@/src/hooks/useFontsLoader";
import { ThemeProvider } from "@/src/utils/ThemeProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SplashScreen, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../global.css";
import { useAuthStore } from "../src/store/authStore";

const queryClient = new QueryClient();

export default function RootLayout() {
  const {
    user,
    profile,
    fetchProfile,
    loading: profileLoading,
  } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  const fontsLoaded = useFontsLoader();

  useEffect(() => {
    const checkWelcome = async () => {
      const seen = await AsyncStorage.getItem("hasSeenWelcome");
      setShowWelcome(!seen);
      setLoading(false);
    };
    checkWelcome();
  }, []);

  useEffect(() => {
    if (user && !profile) {
      fetchProfile();
    }
  }, [user, profile, fetchProfile]);

  useEffect(() => {
    if (fontsLoaded && !loading && (!user || !profileLoading)) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, loading, user, profileLoading]);

  // Show loader until fonts, welcome check, and profile (if user exists) are ready
  if (!fontsLoaded || loading || (user && profile === undefined))
    return <Loader />;

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false }}>
            {/* New user -> Welcome Page */}
            {!user && showWelcome && <Stack.Screen name="index" />}

            {/* Returning user but not logged in → Login */}
            {!user && !showWelcome && <Stack.Screen name="(auth)/login" />}

            {/* Logged in but no profile → Create Profile */}
            {user && !profile && <Stack.Screen name="index" />}

            {/* Logged in, onboarding not done → Onboarding */}
            {user && profile && profile.onboarding_complete === false && (
              <Stack.Screen name="(auth)/onboarding" />
            )}

            {/* Logged in, onboarding done → Dashboard */}
            {user && profile && profile.onboarding_complete !== false && (
              <Stack.Screen name="(main)/dashboard" />
            )}
          </Stack>
          <StatusBar barStyle="dark-content" />
        </GestureHandlerRootView>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
