import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ScreenWrapperProps = {
  edges?: ("top" | "bottom" | "left" | "right")[];
  children: React.ReactNode;
};

export default function ScreenWrapper({
  children,
  edges = ["left", "right"],
}: ScreenWrapperProps) {
  return (
    <SafeAreaView edges={edges} style={styles.safe}>
      <View style={styles.container}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, paddingVertical: 16, paddingHorizontal: 24 },
});
