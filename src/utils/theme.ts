// ─── Core Palette ────────────────────────────────────────────────────────────
// Single source of truth for the CreditBook fintech color system.
// All components and screens must reference tokens from here.
export const colors = {
  white: "#FFFFFF",
  black: "#000000",

  // Brand — Green-first, growth-oriented
  primary: {
    DEFAULT: "#22C55E", // Brand green — CTAs, active nav, FAB
    gradient: "#4F9CFF", // Gradient end (green → blue hero cards)
    light: "#DCFCE7", // Tinted surface / chip background
    dark: "#16A34A", // Pressed / dark variant
  },

  // Semantic — Emotion-aware financial signals
  success: {
    DEFAULT: "#22C55E", // Credit In / Paid — relief, resolution (matches primary)
    bg: "#F0FDF4", // Panel/section background (green-50)
    light: "#DCFCE7", // Paid chip background (green-100)
    text: "#166534", // Paid chip label
    dark: "#16A34A", // Pressed / dark
    gradient: "#4ADE80", // Gradient end — subscription / active state cards
  },
  danger: {
    DEFAULT: "#E74C3C", // Dues / Credit Out — urgency, delete
    bg: "#FEF2F2", // Panel/section background (red-50)
    light: "#FEE2E2", // Overdue chip background / danger surface
    text: "#991B1B", // Overdue chip label
    dark: "#B33226", // Pressed / dark
    strong: "#DC2626", // Dashboard-level alert red (gradient start)
    gradient: "#F87171", // Gradient end — unsubscribed / expired state cards
  },
  warning: {
    DEFAULT: "#F59E0B", // Pending / Reminder — attention, not alarm
    bg: "#FFFBEB", // Panel/section background (amber-50)
    light: "#FEF3C7", // Pending chip background
    text: "#92400E", // Pending chip label
    dark: "#D97706", // Pressed / dark
  },
  info: {
    DEFAULT: "#4F9CFF", // Informational / partial state
    bg: "#EFF6FF", // Panel/section background (blue-50)
    light: "#EAF0FB", // Partial chip background
    text: "#0369A1", // Partial chip label
    dark: "#2563EB", // Pressed / dark
  },

  // Neutrals — Soft, low-fatigue grays
  neutral: {
    bg: "#F6F7F9", // App background — low-stress canvas
    surface: "#FFFFFF", // Card / modal surface
    100: "#F6F7F9",
    200: "#E5E7EB", // Dividers / borders
    300: "#E2E8F0",
    400: "#AEAEB2", // Muted labels, captions
    500: "#6B7280", // Secondary text
    600: "#636366", // Body text
    700: "#48484A",
    900: "#1C1C1E", // Primary text (near-black)
  },

  // UI tokens
  icon: {
    bg: "#22C55E22", // Translucent brand green icon backing
  },
  border: {
    tabborder: "#E5E7EB",
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

  // Dashboard "Both" mode — split hero panels
  receivePanelBg: colors.success.bg, // #F0FDF4 — YOU RECEIVE panel
  owePanelBg: colors.danger.bg, // #FEF2F2 — YOU OWE panel
  dashboardRed: colors.danger.strong, // #DC2626 — gradient & alert red

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
  "2xl": 20,
  "3xl": 24,
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
