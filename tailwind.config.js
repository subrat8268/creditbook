const theme = require("./src/utils/theme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./src/**/*.{js,ts,jsx,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // ── Brand ────────────────────────────────
        primary: theme.colors.primary, // #22C55E — CTAs, active nav
        "primary-dark": theme.colors.primaryDark, // #16A34A — pressed / icon accent
        "primary-light": theme.colors.paid.bg, // #DCFCE7 — chip bg, tinted surfaces

        // ── Success ──────────────────────────────
        success: theme.colors.primary, // #22C55E
        "success-bg": theme.colors.successBg, // #F0FDF4 — panel bg
        "success-light": theme.colors.paid.bg, // #DCFCE7
        "success-dark": theme.colors.primaryDark, // #16A34A
        "success-text": theme.colors.paid.text, // #16A34A

        // ── Danger / Red ─────────────────────────
        danger: theme.colors.danger, // #EF4444
        "danger-bg": theme.colors.dangerBg, // #FEF2F2 — panel bg
        "danger-light": theme.colors.overdue.bg, // #FEE2E2
        "danger-dark": "#B33226", // deep red — pressed state
        "danger-text": theme.colors.overdue.text, // #DC2626
        "danger-strong": theme.colors.damgerStrong, // #DC2626

        // ── Warning / Amber ───────────────────────
        warning: theme.colors.warning, // #F59E0B
        "warning-bg": theme.colors.warningBg, // #FFFBEB — panel bg
        "warning-light": theme.colors.pending.bg, // #FEF3C7
        "warning-dark": theme.colors.pending.text, // #D97706
        "warning-text": "#92400E", // amber-900

        // ── Info / Blue ───────────────────────────
        info: "#4F9CFF", // info blue
        "info-bg": "#EFF6FF", // blue-50
        "info-light": "#EAF0FB", // light blue tint
        "info-dark": theme.colors.fab, // #2563EB
        "info-text": "#0369A1", // blue-700

        // ── Layout surfaces ───────────────────────
        background: theme.colors.background, // #F6F7F9 — app bg
        surface: theme.colors.surface, // #FFFFFF — cards / modals
        fab: theme.colors.fab, // #2563EB — FAB

        // ── Typography ────────────────────────────
        textDark: theme.colors.textPrimary, // #1C1C1E — headings
        textPrimary: theme.colors.textPrimary, // #1C1C1E — body
        textSecondary: theme.colors.textSecondary, // #6B7280 — labels / captions
        textMuted: "#AEAEB2", // placeholder / muted

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
        icon: theme.colors.iconBg, // #22C55E22
        search: theme.colors.background, // #F6F7F9
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
