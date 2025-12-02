import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Image, Pressable, Text, View } from "react-native";

export default function ImagePickerField({
  label,
  value,
  onPick,
}: {
  label: string;
  value: string | null;
  onPick: (uri: string) => void;
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

  return (
    <View className="mb-4">
      <Text className="text-gray-700 font-medium mb-2">{label}</Text>

      <Pressable
        onPress={pick}
        className="w-24 h-24 rounded-xl bg-gray-100 items-center justify-center overflow-hidden"
      >
        {value ? (
          <Image source={{ uri: value }} className="w-full h-full" />
        ) : (
          <Ionicons name="camera-outline" size={30} color="#6B7280" />
        )}
      </Pressable>
    </View>
  );
}
