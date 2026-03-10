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
    <SafeAreaView edges={edges} className="flex-1 bg-white">
      <View className="flex-1 py-4 px-6">{children}</View>
    </SafeAreaView>
  );
}
