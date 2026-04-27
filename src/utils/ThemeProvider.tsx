import { usePreferencesStore } from "@/src/store/preferencesStore";
import {
  fonts,
  getThemeTokens,
  radius,
  spacing,
  type ThemeMode,
  typography,
} from "@/src/utils/theme";
import { useColorScheme } from "nativewind";
import { createContext, ReactNode, useContext, useEffect, useMemo } from "react";

type ThemeContextValue = {
  mode: ThemeMode;
  isDark: boolean;
  colors: ReturnType<typeof getThemeTokens>["colors"];
  gradients: ReturnType<typeof getThemeTokens>["gradients"];
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  fonts: typeof fonts;
  setColorMode: (mode: ThemeMode) => void;
  toggleColorMode: () => void;
  statusBarStyle: "light-content" | "dark-content";
};

const defaultTokens = getThemeTokens("light");

const ThemeContext = createContext<ThemeContextValue>({
  mode: "light",
  isDark: false,
  colors: defaultTokens.colors,
  gradients: defaultTokens.gradients,
  spacing,
  radius,
  typography,
  fonts,
  setColorMode: () => undefined,
  toggleColorMode: () => undefined,
  statusBarStyle: "dark-content",
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const mode = usePreferencesStore((s) => s.colorMode);
  const setColorMode = usePreferencesStore((s) => s.setColorMode);
  const toggleColorMode = usePreferencesStore((s) => s.toggleColorMode);
  const { setColorScheme } = useColorScheme();

  useEffect(() => {
    setColorScheme(mode);
  }, [mode, setColorScheme]);

  const value = useMemo<ThemeContextValue>(() => {
    const tokens = getThemeTokens(mode);
    return {
      mode,
      isDark: mode === "dark",
      colors: tokens.colors,
      gradients: tokens.gradients,
      spacing,
      radius,
      typography,
      fonts,
      setColorMode,
      toggleColorMode,
      statusBarStyle: mode === "dark" ? "light-content" : "dark-content",
    };
  }, [mode, setColorMode, toggleColorMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

export const theme = {
  colors: defaultTokens.colors,
  gradients: defaultTokens.gradients,
  spacing,
  radius,
  typography,
  fonts,
};
