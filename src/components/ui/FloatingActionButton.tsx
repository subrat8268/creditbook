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
      <Plus size={24} color="#FFFFFF" strokeWidth={2.5} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
});
