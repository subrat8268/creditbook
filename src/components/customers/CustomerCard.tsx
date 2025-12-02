import { Ionicons } from "@expo/vector-icons";
import { clsx } from "clsx";
import { Image, Text, TouchableOpacity, View } from "react-native";

type Props = {
  name: string;
  phone: string;
  avatar?: string;
  onPress?: () => void;
};

export default function CustomerCard({ name, phone, avatar, onPress }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={clsx(
        "flex-row items-center justify-between bg-white border-neutral-300 border py-5 px-4 rounded-xl mb-4",
        "shadow-sm"
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

      <Ionicons name="chevron-forward" size={20} color="#999" />
    </TouchableOpacity>
  );
}
