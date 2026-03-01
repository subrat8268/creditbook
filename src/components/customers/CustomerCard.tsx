import { Ionicons } from "@expo/vector-icons";
import { clsx } from "clsx";
import { Image, Text, TouchableOpacity, View } from "react-native";

type Props = {
  name: string;
  phone: string;
  avatar?: string;
  isOverdue?: boolean;
  onPress?: () => void;
};

export default function CustomerCard({
  name,
  phone,
  avatar,
  isOverdue,
  onPress,
}: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={clsx(
        "flex-row items-center justify-between bg-white border py-5 px-4 rounded-xl mb-4",
        "shadow-sm",
        isOverdue ? "border-red-400" : "border-neutral-300",
      )}
    >
      <View className="flex-row items-center">
        {avatar ? (
          <Image
            source={{ uri: avatar }}
            className="w-10 h-10 rounded-full mr-3"
          />
        ) : (
          <View className="w-10 h-10 rounded-full bg-neutral-300 mr-3 items-center justify-center">
            <Ionicons name="person-outline" size={20} color="#444" />
          </View>
        )}
        <View>
          <Text className="font-semibold text-neutral-900">{name}</Text>
          <Text className="text-neutral-500">{phone}</Text>
        </View>
      </View>

      <View className="flex-row items-center gap-2">
        {isOverdue && (
          <View className="bg-red-100 px-2 py-0.5 rounded-full">
            <Text className="text-red-600 text-xs font-inter-semibold">
              Overdue
            </Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </View>
    </TouchableOpacity>
  );
}
