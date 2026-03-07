import { dashboardPalette as C } from "@/src/utils/dashboardUi";
import { Ionicons } from "@expo/vector-icons";
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
        shadowColor: "#000",
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
        <Ionicons name="document-text-outline" size={18} color={C.blue} />
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
        <Ionicons name="send-outline" size={18} color={C.blue} />
        <Text style={{ fontSize: 14, fontWeight: "600", color: C.blue }}>
          Send Reminder
        </Text>
      </TouchableOpacity>
    </View>
  );
}
