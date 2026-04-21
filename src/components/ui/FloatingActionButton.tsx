import { colors, spacing } from "@/src/utils/theme";
import { Plus } from "lucide-react-native";
import { StyleSheet, TouchableOpacity, ViewStyle } from "react-native";

interface FABProps {
  onPress: () => void;
  bottom?: number;
  right?: number;
  style?: ViewStyle;
}

export default function FloatingActionButton({
  onPress,
  bottom = 24,
  right = 20,
  style,
}: FABProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityLabel="Add"
      style={[styles.fab, { bottom, right }, style]}
    >
      <Plus size={24} color={colors.surface} strokeWidth={2.5} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    width: spacing.fabSize,
    height: spacing.fabSize,
    borderRadius: spacing.fabSize / 2,
    backgroundColor: colors.fabBg,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
  },
});
