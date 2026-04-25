import { colors, spacing } from "@/src/utils/theme";
import { Plus } from "lucide-react-native";
import { TouchableOpacity, type ViewStyle } from "react-native";

interface FABProps {
  onPress: () => void;
  bottom?: number;
  right?: number;
  size?: number;
  style?: ViewStyle;
}

export default function FloatingActionButton({
  onPress,
  bottom = 24,
  right = 20,
  size = spacing.fabSize,
  style,
}: FABProps) {
  const fabStyle: ViewStyle = {
    position: "absolute",
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: colors.fabBg,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityLabel="Add"
      style={[fabStyle, { bottom, right }, style]}
    >
      <Plus size={size <= spacing.fabSizeCompact ? 22 : 24} color={colors.surface} strokeWidth={2.5} />
    </TouchableOpacity>
  );
}
