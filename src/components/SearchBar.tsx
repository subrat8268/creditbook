import { Ionicons } from "@expo/vector-icons";
import { TextInput, View } from "react-native";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export default function SearchBar({ value, onChangeText, placeholder }: Props) {
  return (
    <View className="flex-row items-center bg-search rounded-lg px-3 py-1">
      <Ionicons
        name="search-outline"
        className="ml-1"
        size={18}
        color="#6B7280"
      />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || "Search..."}
        className="ml-2 flex-1 text-base text-neutral-900"
        placeholderTextColor="#9CA3AF"
      />
    </View>
  );
}
