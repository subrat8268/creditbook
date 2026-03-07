import { Ionicons } from "@expo/vector-icons";
import { TextInput, View } from "react-native";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export default function SearchBar({ value, onChangeText, placeholder }: Props) {
  return (
    <View className="flex-row items-center bg-search rounded-full px-4 py-2.5">
      <Ionicons name="search-outline" size={18} color="#8E8E93" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || "Search..."}
        className="ml-2 flex-1 text-base text-neutral-900"
        placeholderTextColor="#8E8E93"
        returnKeyType="search"
      />
    </View>
  );
}
