import Loader from "@/src/components/feedback/Loader";
import { ToastProvider } from "@/src/components/feedback/Toast";
import OfflineToastListener from "@/src/components/feedback/OfflineToastListener";
import { SyncStatusBanner } from "@/src/components/ui/SyncStatusBanner";
import { useAuth } from "@/src/hooks/useAuth";
import { useFontsLoader } from "@/src/hooks/useFontsLoader";
import { ThemeProvider } from "@/src/utils/ThemeProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createMMKVPersister } from "@/src/lib/mmkvPersister";
import { getOrCreateSyncQueueKey } from "@/src/lib/syncQueueStorage";
import { initializeSyncQueue } from "@/src/lib/syncQueue";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import {
  configureNotificationChannels,
  ensureNotificationPermission,
} from "@/src/lib/notifications";
import "../global.css";
import "../src/i18n";
import { useAuthStore } from "../src/store/authStore";
import { useLanguageStore } from "../src/store/languageStore";
import { usePreferencesStore } from "../src/store/preferencesStore";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { initSentry, wrap } from "@/src/services/sentry";
import { getThemeTokens } from "@/src/utils/theme";

initSentry();

WebBrowser.maybeCompleteAuthSession();

SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore if already prevented/hidden by the runtime.
});

// ═══════════════════════════════════════════════════════════════════════════════
// OFFLINE-FIRST ARCHITECTURE — React Query + MMKV Persistence
// ═══════════════════════════════════════════════════════════════════════════════

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache queries for 5 minutes (stale-while-revalidate pattern)
      gcTime: 1000 * 60 * 60 * 24, // 24 hours (formerly cacheTime)
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

// Create MMKV persister for React Query cache
const mmkvPersister = createMMKVPersister();

function RootLayout() {
  useAuth();

  const { user, profile, isInitialized, isFetchingProfile, isRecoveryMode } =
    useAuthStore();
  const loadLanguage = useLanguageStore((s) => s.loadLanguage);
  const colorMode = usePreferencesStore((s) => s.colorMode);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [ready, setReady] = useState(false);

  const fontsLoaded = useFontsLoader();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const init = async () => {
      try {
        const syncKeyPromise = getOrCreateSyncQueueKey().then((key) => {
          initializeSyncQueue(key);
        });
        const [seen] = await Promise.all([
          AsyncStorage.getItem("hasSeenWelcome"),
          loadLanguage(), // restore persisted language before first render
          syncKeyPromise,
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
    const setupNotifications = async () => {
      await configureNotificationChannels();
      await ensureNotificationPermission();
    };

    setupNotifications();
  }, []);

  useEffect(() => {
    if (fontsLoaded && !loading) {
      SplashScreen.hideAsync().catch(() => {
        // Ignore race where splash is already hidden.
      });
      setReady(true);
    }
  }, [fontsLoaded, loading]);

  const activeColors = getThemeTokens(colorMode).colors;

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
    } else if (!profile.phone) {
      // NEW: Enforce phone collection after login
      router.replace("/(auth)/phone-setup" as any);
    } else if (!profile.onboarding_complete) {
      // Only redirect if NOT already in onboarding folder
      const inOnboarding = segments[0] === "(auth)" && segments[1] === "onboarding";
      if (!inOnboarding) {
        router.replace("/(auth)/onboarding/business" as any);
      }
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
    segments,
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
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: mmkvPersister }}
    >
      <ThemeProvider>
        <SafeAreaProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <BottomSheetModalProvider>
              <ToastProvider>
                <OfflineToastListener />
                {/* Global Sync Status Banner */}
                <SyncStatusBanner />
                
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="index" />
                  <Stack.Screen name="(auth)" />
                  <Stack.Screen name="(main)" />
                  <Stack.Screen name="l/[token]" options={{ presentation: 'modal' }} />
                  <Stack.Screen name="profile-error" />
                </Stack>
                <StatusBar
                  barStyle={colorMode === "dark" ? "light-content" : "dark-content"}
                  backgroundColor={activeColors.background}
                />
              </ToastProvider>
            </BottomSheetModalProvider>
          </GestureHandlerRootView>
        </SafeAreaProvider>
      </ThemeProvider>
    </PersistQueryClientProvider>
  );
}

export default wrap(RootLayout);
