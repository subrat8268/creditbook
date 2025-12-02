const theme = require("./src/utils/theme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./src/**/*.{js,ts,jsx,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: theme.colors.primary.DEFAULT,
        secondary: theme.colors.secondary.DEFAULT,
        info: theme.colors.info.DEFAULT,
        warning: theme.colors.warning.DEFAULT,
        danger: theme.colors.danger.DEFAULT,
        success: theme.colors.success.DEFAULT,
        icon: theme.colors.icon.bg,
        search: theme.colors.neutral[200],
        textPrimary: theme.colors.neutral[600],
      },
      borderColor: {
        light: theme.colors.neutral[200],
        default: theme.colors.neutral[300],
        dark: theme.colors.neutral[400],
      },
      fontFamily: {
        inter: [theme.fonts.regular],
        "inter-medium": [theme.fonts.medium],
        "inter-semibold": [theme.fonts.semiBold],
        "inter-bold": [theme.fonts.bold],
      },
      fontSize: {
        h1: ["30px", { lineHeight: "40px", fontWeight: "700" }],
        h2: ["24px", { lineHeight: "32px", fontWeight: "600" }],
        body: ["16px", { lineHeight: "24px", fontWeight: "400" }],
        caption: ["12px", { lineHeight: "16px", fontWeight: "400" }],
      },
      borderRadius: {
        sm: theme.radius.sm,
        md: theme.radius.md,
        lg: theme.radius.lg,
        xl: theme.radius.xl,
        full: theme.radius.full,
      },
    },
  },
  plugins: [],
};
