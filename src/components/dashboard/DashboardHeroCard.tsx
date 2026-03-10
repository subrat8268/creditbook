import { formatINR } from "@/src/utils/dashboardUi";
import { RefreshCw } from "lucide-react-native";
import { Text, View } from "react-native";

type Props = {
  label: string;
  amount: number;
  updatedText?: string;
};

export default function DashboardHeroCard({
  label,
  amount,
  updatedText = "Updated just now",
}: Props) {
  return (
    <View
      className="bg-white rounded-3xl p-7 mb-3 overflow-hidden"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.07,
        shadowRadius: 12,
        elevation: 4,
      }}
    >
      {/* Decorative blobs */}
      <View
        style={{
          position: "absolute",
          top: -30,
          right: -30,
          width: 140,
          height: 140,
          borderRadius: 70,
          backgroundColor: "#F5ECD8",
          opacity: 0.9,
        }}
      />
      <View
        style={{
          position: "absolute",
          top: 24,
          right: 24,
          width: 70,
          height: 70,
          borderRadius: 35,
          backgroundColor: "#F5ECD8",
          opacity: 0.55,
        }}
      />

      <Text className="text-[11px] font-bold tracking-[1.4px] text-textSecondary mb-2.5">
        {label}
      </Text>
      <Text className="text-[40px] font-extrabold text-warning mb-2.5 tracking-tight">
        {formatINR(amount)}
      </Text>
      <View className="flex-row items-center gap-1.5">
        <RefreshCw size={12} color="#6B7280" strokeWidth={2} />
        <Text className="text-xs text-textSecondary">{updatedText}</Text>
      </View>
    </View>
  );
}
