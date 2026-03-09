import { colors } from "@/src/utils/theme";
import React from "react";
import { View } from "react-native";
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
    <SafeAreaView
      edges={edges}
      style={{ flex: 1, backgroundColor: colors.white }}
    >
      <View style={{ flex: 1, paddingVertical: 16, paddingHorizontal: 24 }}>
        {children}
      </View>
    </SafeAreaView>
  );
}
