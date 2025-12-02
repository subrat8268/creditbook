import { ProductVariant } from "@/src/api/products";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Text, TouchableOpacity, View } from "react-native";

interface ProductCardProps {
  name: string;
  basePrice: number;
  variants?: ProductVariant[];
  image?: string;
  onOptionsPress: () => void;
}

export default function ProductCard({
  name,
  basePrice,
  variants,
  image,
  onOptionsPress,
}: ProductCardProps) {
  return (
    <View className="flex items-center justify-between bg-white border-neutral-300 border p-4 rounded-xl mb-4">
      <View className="flex-row items-center justify-between w-full">
        <View className="flex-row items-center flex-1">
          {image ? (
            <Image
              style={{
                width: 60,
                height: 72,
                borderRadius: 12,
                marginRight: 12,
              }}
              contentFit="fill"
              source={{ uri: image }}
            />
          ) : (
            <View className="w-12 h-12 rounded-lg bg-neutral-200 mr-3 items-center justify-center">
              <Ionicons name="cube-outline" size={24} color="#666" />
            </View>
          )}
          <View className="flex-1">
            <Text className="font-inter-medium text-lg text-neutral-900">
              {name}
            </Text>
            <Text className=" text-primary font-inter-semibold">
              Price: ₹{basePrice}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={onOptionsPress}>
          <Ionicons name="ellipsis-vertical" size={20} color="#999" />
        </TouchableOpacity>
      </View>
      <View className="w-full">
        {/* Show variants if present */}
        {variants && variants.length > 0 && (
          <View className="mt-2">
            {variants.map((variant, idx) => (
              <View
                key={idx}
                className="flex-row justify-between items-center py-2 mt-1 px-3 border bg-neutral-100 border-neutral-200 rounded-lg mb-1"
              >
                <Text className="text-neutral-900 font-inter-medium">
                  {variant.name}
                </Text>
                <Text className="text-primary font-inter-semibold">
                  ₹{variant.price}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
