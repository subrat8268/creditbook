import * as ImagePicker from "expo-image-picker";

export async function pickImageFromLibrary(): Promise<string | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== ImagePicker.PermissionStatus.GRANTED) {
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.85,
  });

  if (result.canceled || !result.assets?.length) return null;
  return result.assets[0].uri ?? null;
}
