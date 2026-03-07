// ─── Core Palette ────────────────────────────────────────────────────────────
// Single source of truth for the CreditBook fintech color system.
// All components and screens must reference tokens from here.
export const colors = {
  white: "#FFFFFF",
  black: "#000000",

  // Brand — Purple-first, gradient-capable
  primary: {
    DEFAULT: "#5B3FFF", // Brand purple — CTAs, active nav, FAB
    gradient: "#4F9CFF", // Gradient end (purple → blue hero cards)
    light: "#EEEAFF", // Tinted surface / chip background
    dark: "#3D28CC", // Pressed / dark variant
  },

  // Semantic — Emotion-aware financial signals
  success: {
    DEFAULT: "#2ECC71", // Credit In / Paid — relief, resolution
    light: "#DCFCE7", // Paid chip background
    text: "#166534", // Paid chip label
    dark: "#1A9950", // Pressed / dark
  },
  danger: {
    DEFAULT: "#E74C3C", // Dues / Credit Out — urgency, delete
    light: "#FEE2E2", // Overdue chip background / danger surface
    text: "#991B1B", // Overdue chip label
    dark: "#B33226", // Pressed / dark
  },
  warning: {
    DEFAULT: "#F39C12", // Pending / Reminder — attention, not alarm
    light: "#FEF3C7", // Pending chip background
    text: "#92400E", // Pending chip label
    dark: "#C27D0E", // Pressed / dark
  },
  info: {
    DEFAULT: "#4F9CFF", // Informational / partial state
    light: "#EAF0FB", // Partial chip background
    text: "#0369A1", // Partial chip label
    dark: "#2563EB", // Pressed / dark
  },

  // Neutrals — Soft, low-fatigue grays
  neutral: {
    bg: "#F6F7FB", // App background — low-stress canvas
    surface: "#FFFFFF", // Card / modal surface
    100: "#F6F7FB",
    200: "#E5E5EA", // Dividers / borders
    300: "#C7C7CC",
    400: "#AEAEB2", // Muted labels, captions
    500: "#8E8E93", // Secondary text
    600: "#636366", // Body text
    700: "#48484A",
    900: "#1C1C1E", // Primary text (near-black)
  },

  // UI tokens
  icon: {
    bg: "#5B3FFF22", // Translucent brand purple icon backing
  },
  border: {
    tabborder: "#E5E5EA",
  },
};

// ─── Dashboard Palette ───────────────────────────────────────────────────────
// Derived from `colors` — used by all dashboard components and screens.
// Import `dashboardPalette` from here (or via re-export in dashboardUi.ts).
export const dashboardPalette = {
  // Surfaces
  bg: colors.neutral.bg,
  white: colors.white,
  heroDecor: "#F5ECD8", // Warm cream blob on hero card

  // Hero card text
  heroLabel: colors.neutral[500],
  heroAmount: colors.warning.DEFAULT,
  heroSub: colors.neutral[500],

  // Brand accent (replaces old blue)
  blue: colors.primary.DEFAULT,
  blueLight: colors.primary.light,

  // Danger
  red: colors.danger.DEFAULT,
  redLight: colors.danger.light,

  // Typography
  heading: colors.neutral[900],
  body: colors.neutral[600],
  muted: colors.neutral[400],
  divider: colors.neutral[200],

  // Status chip — Paid
  paidBg: colors.success.light,
  paidText: colors.success.text,

  // Status chip — Pending
  pendingBg: colors.warning.light,
  pendingText: colors.warning.text,

  // Status chip — Overdue
  overdueBg: colors.danger.light,
  overdueText: colors.danger.text,

  // Status chip — Partially Paid
  partialBg: colors.info.light,
  partialText: colors.info.text,
} as const;

export const spacing = {
  xs: 2, // s0
  sm: 4, // s1
  md: 8, // s3
  lg: 16, // s5
  xl: 24, // s7
  "2xl": 32, // s9
  "3xl": 48, // s13
  "4xl": 64, // s15
};

export const radius = {
  xs: 2,
  sm: 4,
  md: 6,
  lg: 10,
  xl: 16,
  full: 9999,
};

export const fonts = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semiBold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
};

export const typography = {
  h1: {
    fontSize: 30,
    fontWeight: "700" as const,
    lineHeight: 40,
    fontFamily: fonts.bold,
  },
  h2: {
    fontSize: 24,
    fontWeight: "600" as const,
    lineHeight: 32,
    fontFamily: fonts.semiBold,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
    lineHeight: 24,
    fontFamily: fonts.regular,
  },
  caption: {
    fontSize: 12,
    fontWeight: "400" as const,
    lineHeight: 16,
    fontFamily: fonts.regular,
  },
};
