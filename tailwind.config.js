const theme = require("./src/utils/theme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./src/**/*.{js,ts,jsx,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // ── Brand ────────────────────────────────
        primary: theme.colors.primary,
        "primary-dark": theme.colors.primaryDark,
        "primary-light": theme.colors.primaryLight,

        // ── Success ──────────────────────────────
        success: theme.colors.success,
        "success-bg": theme.colors.successBg,
        "success-light": theme.colors.successLight,
        "success-dark": theme.colors.successDark,
        "success-text": theme.colors.paid.text,

        // ── Danger / Red ─────────────────────────
        danger: theme.colors.danger, // #EF4444
        "danger-bg": theme.colors.dangerBg, // #FEF2F2 — panel bg
        "danger-light": theme.colors.overdue.bg, // #FEE2E2
        "danger-dark": theme.colors.dangerStrong,
        "danger-text": theme.colors.overdue.text, // #DC2626
        "danger-strong": theme.colors.dangerStrong, // #DC2626

        // ── Warning / Amber ───────────────────────
        warning: theme.colors.warning, // #F59E0B
        "warning-bg": theme.colors.warningBg, // #FFFBEB — panel bg
        "warning-light": theme.colors.pending.bg, // #FEF3C7
        "warning-dark": theme.colors.pending.text, // #D97706
        "warning-text": theme.colors.pending.text,

        // ── Info / Blue ───────────────────────────
        info: theme.colors.primary,
        "info-bg": theme.colors.primaryLight,
        "info-light": theme.colors.partial.bg,
        "info-dark": theme.colors.primaryDark,
        "info-text": theme.colors.partial.text,

        // ── Layout surfaces ───────────────────────
        background: theme.colors.background, // #F6F7F9 — app bg
        surface: theme.colors.surface, // #FFFFFF — cards / modals
        fab: theme.colors.fabBg,

        // ── Typography ────────────────────────────
        textDark: theme.colors.textPrimary, // #1C1C1E — headings
        textPrimary: theme.colors.textPrimary, // #1C1C1E — body
        textSecondary: theme.colors.textSecondary, // #6B7280 — labels / captions
        textMuted: theme.colors.textMuted, // placeholder / muted

        // ── Borders & dividers ────────────────────
        border: theme.colors.border, // #E5E7EB
        divider: theme.colors.border, // #E5E7EB

        // ── Status chips ──────────────────────────
        paid: theme.colors.paid.bg,
        "paid-text": theme.colors.paid.text,
        pending: theme.colors.pending.bg,
        "pending-text": theme.colors.pending.text,
        overdue: theme.colors.overdue.bg,
        "overdue-text": theme.colors.overdue.text,

        // ── Misc ─────────────────────────────────
        icon: theme.colors.iconBg,
        search: theme.colors.surfaceAlt,
      },
      borderColor: {
        light: theme.colors.border,
        default: theme.colors.border,
        dark: theme.colors.textSecondary,
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
        "screen-title": ["24px", { lineHeight: "30px", fontWeight: "700" }],
        "section-title": ["18px", { lineHeight: "24px", fontWeight: "700" }],
        "card-title": ["16px", { lineHeight: "22px", fontWeight: "600" }],
        body: ["15px", { lineHeight: "22px", fontWeight: "400" }],
        caption: ["12px", { lineHeight: "16px", fontWeight: "500" }],
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
