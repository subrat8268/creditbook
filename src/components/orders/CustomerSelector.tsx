import { Customer } from "@/src/types/customer";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

interface Props {
  customers: Customer[];
  selectedCustomerId: string | null;
  onSelect: (id: string) => void;
}

export default function CustomerSelector({
  customers,
  selectedCustomerId,
  onSelect,
}: Props) {
  return (
    <View className="border p-4 rounded-lg mb-4">
      <Text className="font-inter-semibold mb-2">Select Customer</Text>
      <FlatList
        data={customers}
        horizontal
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => onSelect(item.id)}
            className={`px-4 py-2 rounded-xl border mr-2 ${
              selectedCustomerId === item.id
                ? "bg-primary border-primary"
                : "border-neutral-300"
            }`}
          >
            <Text
              className={`${selectedCustomerId === item.id ? "text-white" : "text-neutral-700"}`}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
