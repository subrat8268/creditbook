import { FileText, Send } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  onViewReport?: () => void;
  onSendReminder?: () => void;
};

export default function DashboardActionBar({
  onViewReport,
  onSendReminder,
}: Props) {
  return (
    <View
      className="bg-white rounded-[20px] flex-row mb-4 overflow-hidden"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <TouchableOpacity
        className="flex-1 py-[18px] flex-row items-center justify-center gap-2 border-r border-divider"
        onPress={onViewReport}
      >
        <FileText size={18} color="#22C55E" strokeWidth={2} />
        <Text className="text-sm font-semibold text-primary">View Report</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="flex-1 py-[18px] flex-row items-center justify-center gap-2"
        onPress={onSendReminder}
      >
        <Send size={18} color="#22C55E" strokeWidth={2} />
        <Text className="text-sm font-semibold text-primary">
          Send Reminder
        </Text>
      </TouchableOpacity>
    </View>
  );
}
