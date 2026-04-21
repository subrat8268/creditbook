import { clsx } from "clsx";
import React, { memo } from "react";
import { Text, View } from "react-native";

interface CardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  className?: string;
}

const Card = memo(function Card({ title, value, icon, className }: CardProps) {
  return (
    <View
      className={clsx(
        "bg-search rounded-lg p-4 flex-row justify-between items-center shadow-sm",
        className,
      )}
    >
      <View>
        <Text className="mb-1 text-textSecondary">{title}</Text>
        <Text className="text-2xl font-semibold">{value}</Text>
      </View>
      {icon && <View className="bg-icon p-3 rounded-full">{icon}</View>}
    </View>
  );
});

export default Card;
