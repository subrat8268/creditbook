import { colors } from "@/src/utils/theme";
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
  bottom = 80,
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
      <Plus size={24} color={colors.white} strokeWidth={2.5} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.fab,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
});
