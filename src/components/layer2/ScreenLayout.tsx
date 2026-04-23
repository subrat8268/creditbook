import { colors } from "@/src/utils/theme";
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
  backgroundColor = colors.background,
  withStatusBar = true,
}: Props) {
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]} edges={edges}>
      {withStatusBar ? <StatusBar barStyle="dark-content" backgroundColor={backgroundColor} /> : null}
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
