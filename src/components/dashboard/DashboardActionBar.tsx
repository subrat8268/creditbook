import { dashboardPalette as C } from "@/src/utils/dashboardUi";
import { colors } from "@/src/utils/theme";
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
      style={{
        backgroundColor: C.white,
        borderRadius: 20,
        flexDirection: "row",
        marginBottom: 16,
        overflow: "hidden",
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <TouchableOpacity
        style={{
          flex: 1,
          paddingVertical: 18,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          borderRightWidth: 1,
          borderRightColor: C.divider,
        }}
        onPress={onViewReport}
      >
        <FileText size={18} color={C.blue} strokeWidth={2} />
        <Text style={{ fontSize: 14, fontWeight: "600", color: C.blue }}>
          View Report
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={{
          flex: 1,
          paddingVertical: 18,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
        onPress={onSendReminder}
      >
        <Send size={18} color={C.blue} strokeWidth={2} />
        <Text style={{ fontSize: 14, fontWeight: "600", color: C.blue }}>
          Send Reminder
        </Text>
      </TouchableOpacity>
    </View>
  );
}
