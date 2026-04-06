import { formatINR } from "@/src/utils/dashboardUi";
import { colors } from "@/src/utils/theme";
import { Truck } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";

type SupplierFollowup = {
  id: string;
  name: string;
  phone?: string;
  amount: number;
  daysSince: number;
};

type Props = {
  suppliers: SupplierFollowup[];
  onSeeAll?: () => void;
  onRemind?: (supplier: SupplierFollowup) => void;
};

export default function DashboardSupplierFollowups({
  suppliers,
  onSeeAll,
  onRemind,
}: Props) {
  if (!suppliers.length) return null;
  const visible = suppliers.slice(0, 3);

  return (
    <View className="mb-8">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-[18px] font-extrabold text-textPrimary">
          Supplier Follow-ups
        </Text>
        {onSeeAll && (
          <TouchableOpacity onPress={onSeeAll}>
            <Text className="text-[14px] font-semibold text-primary">See All</Text>
          </TouchableOpacity>
        )}
      </View>

      {visible.map((supplier) => (
        <View
          key={supplier.id}
          className="flex-row items-center p-4 mb-3 bg-surface rounded-2xl border border-border"
        >
          <View
            className="w-12 h-12 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: colors.warningBg }}
          >
            <Truck size={18} color={colors.warning} strokeWidth={2} />
          </View>
          <View className="flex-1 mr-2">
            <Text className="text-[16px] font-bold text-textPrimary" numberOfLines={1}>
              {supplier.name}
            </Text>
            <Text className="text-[13px] font-semibold text-danger mt-0.5">
              {formatINR(supplier.amount)} • {supplier.daysSince} days overdue
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => onRemind?.(supplier)}
            className="px-3.5 py-2 rounded-full"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-[13px] font-bold text-surface">Nudge</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}
