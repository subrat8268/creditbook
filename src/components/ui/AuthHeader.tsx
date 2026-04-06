import { Text, View } from "react-native";

type Props = {
  title: string;
  subtitle: string;
};

/** Centered title + subtitle rendered above auth cards */
export default function AuthHeader({ title, subtitle }: Props) {
  return (
    <View className="items-center pt-8 pb-6">
      <Text className="text-[28px] font-bold text-textPrimary text-center mb-1">
        {title}
      </Text>
      <Text className="text-sm text-textSecondary text-center">{subtitle}</Text>
    </View>
  );
}
