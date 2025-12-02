export const colors = {
  white: "#FFFFFF",
  black: "#000000",
  primary: {
    light: "#89d875",
    DEFAULT: "#398526",
    dark: "#235217",
  },
  secondary: {
    light: "#f3d155",
    DEFAULT: "#9C7C0BFF",
    dark: "#5e4b07",
  },
  info: {
    light: "#8bbdea",
    DEFAULT: "#2784D5",
    dark: "#174f7f",
  },
  warning: {
    light: "#ffd359",
    DEFAULT: "#C99500",
    dark: "#745500",
  },
  danger: {
    light: "#f3a5aa",
    DEFAULT: "#E85760",
    dark: "#a91721",
  },
  success: {
    light: "#34ff93",
    DEFAULT: "#007F3C",
    dark: "#004f25",
  },
  icon: {
    bg: "#3A872633",
  },
  border: {
    tabborder: "#E5E7EBFF",
  },
  neutral: {
    100: "#f5f8fa",
    200: "#ecf2f6",
    300: "#DEE1E6FF",
    400: "#dbe5ee",
    500: "#D3E0EA",
    600: "#565D6DFF",
    700: "#5081a7",
    900: "#111b22",
  },
};

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
