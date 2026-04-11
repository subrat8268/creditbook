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
  primaryLight: "#DCFCE7", // Green-100 — Light tint of brand color

  // ─ Semantic Blues
  fab: "#2563EB", // Floating Action Button (highest elevation)

  // ─ Semantic Reds / Pinks
  danger: "#EF4444", // Owed, Overdue states
  dangerStrong: "#DC2626", // Dashboard-level alert red (gradient start)
  supplierPrimary: "#DB2777", // Supplier card / I Owe Suppliers

  // ─ Semantic Amber
  warning: "#F59E0B", // Pending, Reminder, Caution

  // ─ Neutrals
  background: "#F6F7F9", // App canvas (very light gray)
  surface: "#FFFFFF", // Cards, modals, panels
  textPrimary: "#1C1C1E", // Primary text (near-black)
  textSecondary: "#6B7280", // Secondary text, captions
  border: "#E2E8F0",    // Dividers, input borders, subtle separators
  borderLight: "#F1F5F9", // Slate-100 — innercard borders, sub-box dividers

  // ─ Semantic Blues (FAB + action bar "New Entry")
  primaryBlue: "#3B82F6",    // Blue-500 — New Entry icon color
  primaryBlueBg: "#EFF6FF",  // Blue-50  — New Entry icon circle bg

  // ─ Semantic backgrounds (tinted panels)
  successBg: "#F0FDF4",  // Green-50: YOU RECEIVE panel
  dangerBg: "#FEF2F2",   // Red-50: YOU OWE panel
  warningBg: "#FFFBEB",  // Amber-50: Pending/Caution panel
  warningBadgeBg: "#FEF3C7", // Amber-100 — Remind action bar button bg (= pending.bg)

  // ─ Surface variants
  surfaceAlt: "#F8FAFC",  // Slate-50 — inner sub-boxes on cards

  // ─ Text variants
  textMuted: "#64748B",   // Slate-500 — secondary labels inside cards

  // ─ Status chip colors
  paid: {
    bg: "#DCFCE7", // Green-100
    text: "#16A34A", // Green-700
  },
  partial: {
    bg: "#DBEAFE", // Blue-100
    text: "#1D4ED8", // Blue-700
  },
  pending: {
    bg: "#FEF3C7", // Amber-100
    text: "#D97706", // Amber-600
  },
  overdue: {
    bg: "#FEE2E2", // Red-100
    text: "#DC2626", // Red-600
  },

  // ─ Specialized tool palettes
  reports: {
    bg: "#EDE9FE",   // Purple-100
    text: "#7C3AED", // Purple-600
  },
  export: {
    bg: "#F3F4F6",   // Gray-100
    text: "#374151", // Gray-700
  },
  orange: {
    bg: "#FFF7ED",   // Orange-50
    border: "#FFEDD5", // Orange-100
    text: "#EA580C", // Orange-600
  },

  // ─ Avatar palette (deterministic, cycled by name hash)
  avatarPalette: [
    "#4F9CFF",
    "#9B59B6",
    "#E91E8C",
    "#00BCD4",
    "#FF5722",
    "#F59E0B",
  ] as string[],

  // ─ Supplier avatar palette (pastel bg + dark fg, 8 slots)
  supplierAvatarBg: [
    "#EEF2FF", // indigo-50
    "#FDF4FF", // fuchsia-50
    "#EAF0FB", // blue-100
    "#FDF2F8", // pink-50
    "#EDE9FE", // purple-100
    "#FFF1F2", // rose-50
    "#CCFBF1", // teal-100
    "#F1F5F9", // slate-100
  ] as string[],
  supplierAvatarText: [
    "#4338CA", // indigo-700
    "#9333EA", // fuchsia-700
    "#2563EB", // blue-700 (= fab)
    "#DB2777", // pink-600 (= supplierPrimary)
    "#6D28D9", // purple-700
    "#BE123C", // rose-700
    "#0F766E", // teal-700
    "#475569", // slate-600
  ] as string[],

  // ─ Supplier tint surfaces (pink-50 / pink-100)
  supplierBg: "#FDF2F8",  // pink-50  — summary panel inner, status badge bg
  supplierBadgeBg: "#FCE7F3", // pink-100 — header "I Owe" badge bg

  // ─ Icon backgrounds
  iconBg: "#22C55E22", // Translucent brand green

  // ─ Sync status tokens (for SyncStatusBanner component)
  sync: {
    offlineBg: "#FEF3C7",   // Amber-100 — Light amber tint
    offlineText: "#D97706", // Amber-600
    syncingBg: "#DBEAFE",   // Blue-100 — Light blue tint
    syncingText: "#2563EB", // Blue-600
    syncedBg: "#ECFDF5",    // Green-50 — Light green tint
    syncedText: "#10B981",  // Green-500 (= success)
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// GRADIENT TOKENS (Hero Cards Only)
// ═══════════════════════════════════════════════════════════════════════════════

export const gradients = {
  // Person balance card — red gradient
  customerHero: {
    start: "#DC2626", // Red-600
    end: "#B91C1C", // Red-800
  },
  // Preferred alias (person naming)
  peopleHero: {
    start: "#DC2626", // Red-600
    end: "#B91C1C", // Red-800
  },

  // Supplier payable card — pink gradient
  supplierHero: {
    start: "#DB2777", // Pink-600
    end: "#BE185D",   // Pink-800
  },

  // Supplier detail hero — deeper rose gradient (hero card on supplier detail screen)
  supplierDetailHero: {
    start: "#BE2D5C", // Rose-700
    end: "#E8427D",   // Rose-500
  } as { start: string; end: string },

  // Net position card — solid dark navy
  netPosition: "#1C2333", // Dark slate

  // When person balance is zero (paid up) — green gradient
  zeroBalance: {
    start: "#22C55E", // Primary green
    end: "#16A34A", // Primary dark
  },

  // Order status hero gradients
  orderPaid: {
    start: "#10B981", // Green-500
    end: "#059669", // Green-600
  },
  orderPartial: {
    start: "#F59E0B", // Amber-500
    end: "#D97706", // Amber-600
  },
  orderPending: {
    start: "#9CA3AF", // Gray-400
    end: "#6B7280", // Gray-500
  },
  orderOverdue: {
    start: "#EF4444", // Red-500
    end: "#DC2626", // Red-600
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
  avatarMd: 44, // List cards (person, supplier)
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
  dashboardRed: colors.dangerStrong,
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
