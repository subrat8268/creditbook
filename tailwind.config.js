const theme = require("./src/utils/theme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./src/**/*.{js,ts,jsx,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // ── Brand ────────────────────────────────
        primary: theme.colors.primary.DEFAULT, // #22C55E — CTAs, active nav
        "primary-dark": theme.colors.primary.dark, // #16A34A — pressed / icon accent
        "primary-light": theme.colors.primary.light, // #DCFCE7 — chip bg, tinted surfaces

        // ── Semantic ─────────────────────────────
        success: theme.colors.success.DEFAULT, // #22C55E
        "success-bg": theme.colors.success.bg, // #F0FDF4 — panel bg
        "success-light": theme.colors.success.light, // #DCFCE7
        "success-dark": theme.colors.success.dark, // #16A34A
        "success-text": theme.colors.success.text, // #166534

        danger: theme.colors.danger.DEFAULT, // #E74C3C
        "danger-bg": theme.colors.danger.bg, // #FEF2F2 — panel bg
        "danger-light": theme.colors.danger.light, // #FEE2E2
        "danger-dark": theme.colors.danger.dark, // #B33226
        "danger-text": theme.colors.danger.text, // #991B1B
        "danger-strong": theme.colors.danger.strong, // #DC2626

        warning: theme.colors.warning.DEFAULT, // #F59E0B
        "warning-bg": theme.colors.warning.bg, // #FFFBEB — panel bg
        "warning-light": theme.colors.warning.light, // #FEF3C7
        "warning-dark": theme.colors.warning.dark, // #D97706
        "warning-text": theme.colors.warning.text, // #92400E

        info: theme.colors.info.DEFAULT, // #4F9CFF
        "info-bg": theme.colors.info.bg, // #EFF6FF — panel bg
        "info-light": theme.colors.info.light, // #EAF0FB
        "info-dark": theme.colors.info.dark, // #2563EB
        "info-text": theme.colors.info.text, // #0369A1

        // ── Layout surfaces ───────────────────────
        background: theme.colors.neutral.bg, // #F6F7F9 — app bg
        surface: theme.colors.neutral.surface, // #FFFFFF — cards / modals
        fab: theme.colors.info.dark, // #2563EB — FAB

        // ── Typography ────────────────────────────
        textDark: theme.colors.neutral[900], // #1C1C1E — headings
        textPrimary: theme.colors.neutral[600], // #636366 — body
        textSecondary: theme.colors.neutral[500], // #6B7280 — labels / captions
        textMuted: theme.colors.neutral[400], // #AEAEB2 — placeholder / muted

        // ── Borders & dividers ────────────────────
        border: theme.colors.neutral[200], // #E5E7EB
        divider: theme.colors.neutral[200], // #E5E7EB

        // ── Misc ─────────────────────────────────
        icon: theme.colors.icon.bg, // #22C55E22
        search: theme.colors.neutral[100], // #F6F7F9
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
