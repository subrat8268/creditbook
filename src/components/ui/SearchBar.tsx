import { colors } from "@/src/utils/theme";
import { Search } from "lucide-react-native";
import { TextInput, View } from "react-native";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  testID?: string;
};

export default function SearchBar({ value, onChangeText, placeholder, testID }: Props) {
  return (
    <View className="flex-row items-center bg-search rounded-full px-4 py-2.5">
      <Search size={18} color={colors.textSecondary} strokeWidth={2} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || "Search..."}
        className="ml-2 flex-1 text-base text-neutral-900"
        placeholderTextColor={colors.textSecondary}
        returnKeyType="search"
        testID={testID}
      />
    </View>
  );
}
