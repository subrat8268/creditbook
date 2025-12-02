import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface QuickActionProps {
  label: string;
  icon: React.ReactNode;
  onPress?: () => void;
}

const QuickAction = ({ label, icon, onPress }: QuickActionProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="rounded-lg p-4 bg-white flex items-center justify-center border border-neutral-300"
    >
      <View className="mb-2">{icon}</View>
      <Text className="text-gray-700 font-medium">{label}</Text>
    </TouchableOpacity>
  );
};

export default QuickAction;
