import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { useNetInfo } from "@react-native-community/netinfo";
import { Wifi, WifiOff } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNetworkSync } from "@/src/hooks/useNetworkSync";
import { useLanguageStore } from "@/src/store/languageStore";
import { useTheme } from "@/src/utils/ThemeProvider";

const BANNER_HEIGHT = 40;
const HIDDEN_OFFSET = -48;
const ANIMATION_DURATION = 280;
const ONLINE_DISMISS_MS = 2500;

type BannerMode = "offline" | "online";

export default function OfflineBanner() {
  const netInfo = useNetInfo();
  const { triggerSync } = useNetworkSync();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const language = useLanguageStore((s) => s.language);

  const [mode, setMode] = useState<BannerMode | null>(null);
  const [visible, setVisible] = useState(false);
  const translateY = useRef(new Animated.Value(HIDDEN_OFFSET)).current;
  const prevConnectedRef = useRef<boolean | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const animateTo = useCallback(
    (toValue: number, onEnd?: () => void) => {
      Animated.timing(translateY, {
        toValue,
        duration: ANIMATION_DURATION,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished && onEnd) onEnd();
      });
    },
    [translateY],
  );

  const showBanner = useCallback(
    (nextMode: BannerMode) => {
      clearHideTimer();
      setMode(nextMode);
      setVisible(true);
      animateTo(0);
    },
    [animateTo, clearHideTimer],
  );

  const hideBanner = useCallback(() => {
    clearHideTimer();
    animateTo(HIDDEN_OFFSET, () => {
      setVisible(false);
      setMode(null);
    });
  }, [animateTo, clearHideTimer]);

  useEffect(() => {
    const connected =
      netInfo.isConnected === true && netInfo.isInternetReachable !== false;

    if (prevConnectedRef.current === null) {
      prevConnectedRef.current = connected;
      if (!connected) {
        showBanner("offline");
      }
      return;
    }

    const wasConnected = prevConnectedRef.current;
    prevConnectedRef.current = connected;

    if (!connected) {
      showBanner("offline");
      return;
    }

    if (!wasConnected && connected) {
      triggerSync().catch(() => {
        // Sync trigger errors are handled inside the sync hook.
      });
      showBanner("online");
      hideTimerRef.current = setTimeout(() => {
        hideBanner();
      }, ONLINE_DISMISS_MS);
    }
  }, [hideBanner, netInfo.isConnected, netInfo.isInternetReachable, showBanner, triggerSync]);

  useEffect(() => () => clearHideTimer(), [clearHideTimer]);

  if (!visible || !mode) return null;

  const isOffline = mode === "offline";
  const Icon = isOffline ? WifiOff : Wifi;
  const message = isOffline
    ? language === "hi"
      ? "आप ऑफलाइन हैं — कनेक्ट होने पर सिंक होगा"
      : "You're offline — changes will sync when reconnected"
    : language === "hi"
      ? "वापस ऑनलाइन — सिंक हो रहा है…"
      : "Back online — syncing…";

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        {
          top: insets.top,
          backgroundColor: isOffline ? colors.warning : colors.success,
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={styles.content}>
        <Icon size={16} color={colors.surface} strokeWidth={2} />
        <Text style={[styles.text, { color: colors.surface }]} numberOfLines={1}>
          {message}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 999,
    elevation: 20,
    height: BANNER_HEIGHT,
    justifyContent: "center",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  text: {
    fontSize: 13,
    fontWeight: "500",
    flexShrink: 1,
    marginLeft: 8,
  },
});
