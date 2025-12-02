// src/theme/ThemeProvider.tsx
import { ReactNode } from "react";
import { colors, fonts, radius, spacing, typography } from "./theme";

export const theme = {
  colors,
  spacing,
  radius,
  typography,
  fonts,
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
