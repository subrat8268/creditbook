/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * KREDBOOK DESIGN SYSTEM — Theme Tokens
 * ═══════════════════════════════════════════════════════════════════════════════
 * Single source of truth for all design tokens.
 * Components MUST NEVER use raw hex values, pixel values, or hardcoded styles.
 * Every visual detail must reference a token defined here.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// COLOR TOKENS
// ═══════════════════════════════════════════════════════════════════════════════

export const colors = {
  // ─ Primary Green (Brand, CTAs, Active States)
  primary: "#22C55E",
  primaryDark: "#16A34A",

  // ─ Semantic Blues
  fab: "#2563EB", // Floating Action Button (highest elevation)

  // ─ Semantic Reds / Pinks
  danger: "#EF4444", // Owed, Overdue states
  damgerStrong: "#DC2626", // Dashboard-level alert red (gradient start)

  // ─ Semantic Amber
  warning: "#F59E0B", // Pending, Reminder, Caution

  // ─ Neutrals
  background: "#F6F7F9", // App canvas (very light gray)
  surface: "#FFFFFF", // Cards, modals, panels
  textPrimary: "#1C1C1E", // Primary text (near-black)
  textSecondary: "#6B7280", // Secondary text, captions
  border: "#E5E7EB", // Dividers, input borders, subtle separators

  // ─ Semantic backgrounds (tinted panels)
  successBg: "#F0FDF4", // Green-50: YOU RECEIVE panel
  dangerBg: "#FEF2F2", // Red-50: YOU OWE panel
  warningBg: "#FFFBEB", // Amber-50: Pending/Caution panel

  // ─ Status chip colors
  paid: {
    bg: "#DCFCE7", // Green-100
    text: "#16A34A", // Green-700
  },
  pending: {
    bg: "#FEF3C7", // Amber-100
    text: "#D97706", // Amber-600
  },
  overdue: {
    bg: "#FEE2E2", // Red-100
    text: "#DC2626", // Red-600
  },

  // ─ Icon backgrounds
  iconBg: "#22C55E22", // Translucent brand green
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// GRADIENT TOKENS (Hero Cards Only)
// ═══════════════════════════════════════════════════════════════════════════════

export const gradients = {
  // Customer balance card — red gradient
  customerHero: {
    start: "#DC2626", // Red-600
    end: "#B91C1C", // Red-800
  },

  // Supplier payable card — pink gradient
  supplierHero: {
    start: "#DB2777", // Pink-600
    end: "#BE185D", // Pink-800
  },

  // Net position card — solid dark navy
  netPosition: "#1C2333", // Dark slate

  // When customer balance is zero (paid up) — green gradient
  zeroBalance: {
    start: "#22C55E", // Primary green
    end: "#16A34A", // Primary dark
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// SPACING TOKENS (Component Sizes & Padding)
// ═══════════════════════════════════════════════════════════════════════════════

export const spacing = {
  // ─ Standard scale (dp)
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 48,

  // ─ Screen-level
  screenPadding: 16, // Horizontal padding on all screens (16dp)

  // ─ Component dimensions
  inputHeight: 48, // Text input, select input fields
  buttonHeight: 50, // Primary & secondary button height
  tabBarHeight: 64, // Tab navigation bar (+ device bottom inset)

  // ─ Cards
  cardRadius: 16, // Default card border radius (12–20dp range, use 16)
  cardPadding: 16, // Internal padding in cards

  // ─ Avatar sizes
  avatarSm: 36, // Compact rows, list indicators
  avatarMd: 44, // List cards (customer, supplier)
  avatarLg: 64, // Full-screen profile section

  // ─ FAB
  fabSize: 56, // Diameter of floating action button
  fabMargin: 20, // Distance from screen edge
  fabBottom: 24, // Distance above tab bar

  // ─ Header heights
  headerHeight: 48, // Custom header bar
  searchBarHeight: 44, // Search input height

  // ─ Dividers & separators
  dividerHeight: 1,

  // ─ Status chips
  chipHeight: 28,
  chipPadding: 8, // Horizontal padding in chips

  // ─ Sheet & modals
  bottomSheetHandleHeight: 4,
  handleWidth: 40,
  sheets: {
    snapFull: "95%",
    snapCustomer: "90%",
    snapPayment: "65%",
    snapCategory: "50%",
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// TYPOGRAPHY TOKENS
// ═══════════════════════════════════════════════════════════════════════════════

export const typography = {
  // ─ Font families
  fontFamily: "Inter",
  fontFamilies: {
    regular: "Inter_400Regular",
    medium: "Inter_500Medium",
    semiBold: "Inter_600SemiBold",
    bold: "Inter_700Bold",
    extraBold: "Inter_800ExtraBold",
  },

  // ─ Text styles (size, weight, line-height)
  heroAmount: {
    fontSize: 38,
    fontWeight: "800" as const,
    lineHeight: 46,
    color: "#FFFFFF",
  },

  screenTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    lineHeight: 28,
    color: colors.textPrimary,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    lineHeight: 20,
    color: colors.textPrimary,
  },

  body: {
    fontSize: 15,
    fontWeight: "400" as const,
    lineHeight: 22,
    color: colors.textPrimary,
  },

  caption: {
    fontSize: 12,
    fontWeight: "500" as const,
    lineHeight: 16,
    color: colors.textSecondary,
  },

  label: {
    fontSize: 11,
    fontWeight: "700" as const,
    lineHeight: 14,
    textTransform: "uppercase" as const,
    color: colors.textSecondary,
  },

  // ─ Additional text styles
  h1: {
    fontSize: 30,
    fontWeight: "700" as const,
    lineHeight: 40,
  },

  h2: {
    fontSize: 24,
    fontWeight: "600" as const,
    lineHeight: 32,
  },

  subtitle: {
    fontSize: 14,
    fontWeight: "500" as const,
    lineHeight: 20,
    color: colors.textSecondary,
  },

  small: {
    fontSize: 13,
    fontWeight: "400" as const,
    lineHeight: 18,
  },

  overline: {
    fontSize: 10,
    fontWeight: "700" as const,
    lineHeight: 12,
    textTransform: "uppercase" as const,
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// DERIVED THEME OBJECT (For convenience in components)
// ═══════════════════════════════════════════════════════════════════════════════

export const theme = {
  colors,
  gradients,
  spacing,
  typography,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// LEGACY / COMPATIBILITY EXPORTS (Can be removed after migration)
// These maintain backward compatibility with existing components.
// ─────────────────────────────────────────────────────────────────────────────

export const dashboardPalette = {
  bg: colors.background,
  white: colors.surface,
  heroDecor: "#F5ECD8",
  receivePanelBg: colors.successBg,
  owePanelBg: colors.dangerBg,
  dashboardRed: colors.damgerStrong,
  heroLabel: colors.textSecondary,
  heroAmount: colors.warning,
  heroSub: colors.textSecondary,
  blue: colors.fab,
  blueLight: "#EFF6FF",
  red: colors.danger,
  redLight: colors.dangerBg,
  heading: colors.textPrimary,
  body: colors.textSecondary,
  muted: "#AEAEB2",
  divider: colors.border,
  paidBg: colors.paid.bg,
  paidText: colors.paid.text,
  pendingBg: colors.pending.bg,
  pendingText: colors.pending.text,
  overdueBg: colors.overdue.bg,
  overdueText: colors.overdue.text,
  partialBg: "#EAF0FB",
  partialText: "#0369A1",
} as const;

export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: spacing.cardRadius,
  xl: 20,
  "2xl": 24,
  full: 9999,
} as const;

export const fonts = {
  regular: typography.fontFamilies.regular,
  medium: typography.fontFamilies.medium,
  semiBold: typography.fontFamilies.semiBold,
  bold: typography.fontFamilies.bold,
};
