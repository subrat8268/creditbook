/**
 * Toast — lightweight success / error feedback bar.
 *
 * Usage (imperative):
 *   const { show } = useToast();
 *   show({ message: "Payment recorded", type: "success" });
 *
 * Or mount <ToastContainer /> near your root and use the context.
 */
import { colors } from "@/src/utils/theme";
import { CheckCircle, XCircle } from "lucide-react-native";
import React, {
    createContext,
    useCallback,
    useContext,
    useRef,
    useState,
} from "react";
import { Animated, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Types ───────────────────────────────────────────────────────────────────
type ToastType = "success" | "error";

interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number; // ms, default 2800
}

interface ToastContextValue {
  show: (opts: ToastOptions) => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────
const ToastContext = createContext<ToastContextValue>({
  show: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

// ─── Provider + Container ────────────────────────────────────────────────────
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<Required<ToastOptions> | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(
    (opts: ToastOptions) => {
      if (hideTimer.current) clearTimeout(hideTimer.current);

      setToast({
        message: opts.message,
        type: opts.type ?? "success",
        duration: opts.duration ?? 2800,
      });

      // Slide + fade in
      opacity.setValue(0);
      translateY.setValue(-20);
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-hide
      hideTimer.current = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -20,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => setToast(null));
      }, opts.duration ?? 2800);
    },
    [opacity, translateY],
  );

  const isSuccess = toast?.type !== "error";
  const bg = isSuccess ? colors.success.DEFAULT : colors.danger.DEFAULT;

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toast && (
        <Animated.View
          style={[
            styles.container,
            { top: insets.top + 12, opacity, transform: [{ translateY }] },
            { backgroundColor: bg },
          ]}
          pointerEvents="none"
        >
          {isSuccess ? (
            <CheckCircle size={18} color={colors.white} strokeWidth={2.5} />
          ) : (
            <XCircle size={18} color={colors.white} strokeWidth={2.5} />
          )}
          <Text style={styles.message}>{toast.message}</Text>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 20,
    right: 20,
    zIndex: 9999,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  message: {
    flex: 1,
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
});
