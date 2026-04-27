import { useTheme } from "@/src/utils/ThemeProvider";
import { Search } from "lucide-react-native";
import React, { memo } from "react";
import { TextInput, View } from "react-native";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export default memo(function SearchBar({ value, onChangeText, placeholder }: Props) {
  const { colors } = useTheme();

  return (
    <View
      className="flex-row items-center rounded-full px-4 py-2.5"
      style={{ backgroundColor: colors.surfaceAlt }}
    >
      <Search size={18} color={colors.textSecondary} strokeWidth={2} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || "Search..."}
        className="ml-2 flex-1 text-base"
        style={{ color: colors.textPrimary }}
        placeholderTextColor={colors.textMuted}
        returnKeyType="search"
      />
    </View>
  );
});
