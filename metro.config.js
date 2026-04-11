const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// ── SVG transformer support ──────────────────────────────────────────────────
// Allows importing .svg files directly as React components:
//   import MyIcon from "@/assets/icons/my-icon.svg";
//   <MyIcon width={24} height={24} color={colors.primary} />
const { transformer, resolver } = config;

config.transformer = {
  ...transformer,
  babelTransformerPath: require.resolve("react-native-svg-transformer"),
};

config.resolver = {
  ...resolver,
  assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
  sourceExts: [...resolver.sourceExts, "svg"],
  resolverMainFields: ["react-native", "browser", "main"],
  unstable_enablePackageExports: false,
};

module.exports = withNativeWind(config, { input: './global.css' });
