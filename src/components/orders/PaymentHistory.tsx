import { Payment } from "@/src/api/orders";
import EmptyState from "@/src/components/feedback/EmptyState";
import { formatDate } from "@/src/utils/helper";
import { Feather } from "@expo/vector-icons";
import { FlatList, Text, View } from "react-native";

function PaymentItem({ item }: { item: Payment }) {
  return (
    <View className="flex-row justify-between items-end mb-4">
      <View className="flex-row items-start gap-4">
        <Feather name="check-circle" size={24} color="#3A8726FF" />
        <View>
          <Text className="text-neutral-600 text-sm font-inter">
            {formatDate(item.payment_date)}
          </Text>
          <Text className="font-inter-medium text-neutral-900">
            {item.payment_mode} Payment
          </Text>
        </View>
      </View>
      <Text className="text-neutral-900 font-inter-medium">
        ₹ {item.amount.toLocaleString()}
      </Text>
    </View>
  );
}

export default function PaymentHistory({ payments }: { payments: Payment[] }) {
  return (
    <View className="bg-white p-4 rounded-2xl border border-neutral-300">
      <Text className="font-inter-semibold text-xl mb-3.5">
        Payment History
      </Text>
      <FlatList
        data={payments}
        keyExtractor={(item) => item.id}
        className=""
        renderItem={({ item }) => <PaymentItem item={item} />}
        ListEmptyComponent={<EmptyState message="No payments recorded yet" />}
      />
    </View>
  );
}
