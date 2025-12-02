import { clsx } from "clsx";
import React from "react";
import { Text, View } from "react-native";

interface CardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  className?: string;
}

const Card = ({ title, value, icon, className }: CardProps) => {
  return (
    <View className={clsx("bg-neutral-100 rounded-lg p-4 flex-row justify-between items-center shadow-sm", className)}>
      <View>
        <Text className="text-gray-500 mb-1">{title}</Text>
        <Text className="text-2xl font-semibold">{value}</Text>
      </View>
      {icon && <View className="bg-icon p-3 rounded-full">{icon}</View>}
    </View>
  );
};

export default Card;
