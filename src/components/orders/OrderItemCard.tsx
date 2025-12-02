import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

interface OrderItemCardProps {
  id: string;
  name: string;
  variantName?: string;
  price: number;
  quantity: number;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
}

export default function OrderItemCard({
  name,
  variantName,
  price,
  quantity,
  onUpdateQuantity,
  onRemove,
}: OrderItemCardProps) {
  return (
    <View className="flex-row items-center justify-between p-4 border-b border-gray-200 bg-white rounded-xl mb-2">
      {/* Left side: Product info */}
      <View className="flex-1">
        <View className="flex-row items-center">
          <Text className="font-inter-medium text-gray-800">{name}</Text>
          {variantName && variantName !== "Base" && (
            <Text className="text-gray-500"> ({variantName})</Text>
          )}
        </View>
        <Text className="text-gray-500 text-sm">₹{price}</Text>
      </View>

      {/* Middle: Quantity controls */}
      <View className="flex-row items-center">
        <TouchableOpacity
          onPress={() => {
            if (quantity > 1) {
              onUpdateQuantity(quantity - 1);
            } else {
              onRemove();
            }
          }}
          className="bg-gray-200 p-2 rounded-full"
        >
          <Ionicons name="remove" size={18} color="#374151" />
        </TouchableOpacity>

        <Text className="mx-3 text-base font-inter-medium">{quantity}</Text>

        <TouchableOpacity
          onPress={() => onUpdateQuantity(quantity + 1)}
          className="bg-gray-200 p-2 rounded-full"
        >
          <Ionicons name="add" size={18} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Right side: Total */}
      <Text className="ml-4 font-inter-semibold text-gray-800">
        ₹{price * quantity}
      </Text>
    </View>
  );
}
