import { Text, TouchableOpacity } from "react-native";

export default function FloatingActionButton({
  onPress,
  className,
  icon,
  text,
}: {
  onPress: () => void;
  className?: string;
  icon?: React.ReactNode;
  text?: string;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={className}
      accessibilityLabel="Add"
    >
      {icon && icon}
      {text && <Text className="text-white">{text}</Text>}
    </TouchableOpacity>
  );
}
