import { colors } from "@/src/utils/theme";
import * as ImagePicker from "expo-image-picker";
import { Camera } from "lucide-react-native";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function ImagePickerField({
  label,
  value,
  onPick,
  name,
}: {
  label: string;
  value: string | null;
  onPick: (uri: string) => void;
  name?: string;
}) {
  const pick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Please allow gallery permission");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      onPick(result.assets[0].uri);
    }
  };

  const showInitials = !value && !!name;

  return (
    <View className="mb-4">
      <Text className="text-textPrimary font-medium mb-2">{label}</Text>

      <Pressable
        onPress={pick}
        style={[
          styles.container,
          showInitials ? styles.initialsContainer : styles.cameraContainer,
        ]}
      >
        {value ? (
          <Image source={{ uri: value }} style={StyleSheet.absoluteFill} />
        ) : showInitials ? (
          <Text style={styles.initialsText}>{getInitials(name!)}</Text>
        ) : (
          <Camera size={30} color={colors.neutral[500]} strokeWidth={1.8} />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  initialsContainer: {
    backgroundColor: colors.primary.DEFAULT,
  },
  cameraContainer: {
    backgroundColor: colors.neutral.bg,
  },
  initialsText: {
    color: colors.white,
    fontWeight: "bold",
    fontSize: 22,
  },
});
