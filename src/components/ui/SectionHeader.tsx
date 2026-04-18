import { Text, TouchableOpacity, View } from "react-native";

interface SectionHeaderProps {
  title: string;
  action?: {
    label: string;
    onPress: () => void;
  };
  className?: string;
}

export default function SectionHeader({ title, action, className }: SectionHeaderProps) {
  return (
    <View className={`flex-row items-center justify-between py-3 px-4 ${className || ''}`}>
      <Text className="text-xs font-bold text-textSecondary tracking-widest uppercase">
        {title}
      </Text>
      {action && (
        <TouchableOpacity onPress={action.onPress}>
          <Text className="text-xs font-semibold text-primary">
            {action.label}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}