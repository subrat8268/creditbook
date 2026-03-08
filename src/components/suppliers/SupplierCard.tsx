import { Building2, ChevronRight } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";
import { Supplier } from "../../types/supplier";

type Props = {
  supplier: Supplier;
  onPress?: () => void;
};

export default function SupplierCard({ supplier, onPress }: Props) {
  const balance = supplier.balanceOwed ?? 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between bg-white border border-neutral-300 py-4 px-4 rounded-xl mb-3 shadow-sm"
    >
      <View className="flex-row items-center flex-1">
        <View className="w-10 h-10 rounded-full bg-amber-100 mr-3 items-center justify-center">
          <Building2 size={20} color="#d97706" strokeWidth={1.8} />
        </View>
        <View className="flex-1">
          <Text className="font-inter-semibold text-neutral-900">
            {supplier.name}
          </Text>
          {supplier.phone ? (
            <Text className="text-neutral-500 text-sm font-inter">
              {supplier.phone}
            </Text>
          ) : null}
          {supplier.basket_mark ? (
            <Text className="text-neutral-400 text-xs font-inter">
              Mark: {supplier.basket_mark}
            </Text>
          ) : null}
        </View>
      </View>

      <View className="items-end gap-1">
        {balance > 0 ? (
          <View className="bg-red-50 px-2 py-1 rounded-lg">
            <Text className="text-red-600 font-inter-semibold text-sm">
              ₹{balance.toLocaleString("en-IN")}
            </Text>
            <Text className="text-red-400 text-xs font-inter text-right">
              You owe
            </Text>
          </View>
        ) : (
          <View className="bg-green-50 px-2 py-1 rounded-lg">
            <Text className="text-green-600 font-inter-semibold text-sm">
              Clear
            </Text>
          </View>
        )}
        <ChevronRight size={16} color="#999" strokeWidth={2} />
      </View>
    </TouchableOpacity>
  );
}
