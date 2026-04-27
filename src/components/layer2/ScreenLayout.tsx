import { useTheme } from "@/src/utils/ThemeProvider";
import { memo } from "react";
import { StatusBar, StyleSheet, View } from "react-native";
import { Edge, SafeAreaView } from "react-native-safe-area-context";

type Props = {
  children: React.ReactNode;
  edges?: Edge[];
  backgroundColor?: string;
  withStatusBar?: boolean;
};

export default memo(function ScreenLayout({
  children,
  edges = ["top"],
  backgroundColor,
  withStatusBar = true,
}: Props) {
  const { colors, statusBarStyle } = useTheme();
  const resolvedBackgroundColor = backgroundColor ?? colors.background;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: resolvedBackgroundColor }]} edges={edges}>
      {withStatusBar ? <StatusBar barStyle={statusBarStyle} backgroundColor={resolvedBackgroundColor} /> : null}
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
