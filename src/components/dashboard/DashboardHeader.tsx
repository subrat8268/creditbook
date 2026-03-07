import { dashboardPalette as C } from "@/src/utils/dashboardUi";
import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  businessName: string;
  roleLabel: string;
  onPressNotifications?: () => void;
  onPressSettings?: () => void;
};

export default function DashboardHeader({
  businessName,
  roleLabel,
  onPressNotifications,
  onPressSettings,
}: Props) {
  return (
    <View
      style={{
        paddingTop: 54,
        paddingHorizontal: 20,
        paddingBottom: 16,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: C.bg,
      }}
    >
      <View
        style={{
          width: 46,
          height: 46,
          borderRadius: 23,
          backgroundColor: "#E9F0E9",
          alignItems: "center",
          justifyContent: "center",
          marginRight: 12,
          borderWidth: 1.5,
          borderColor: "#D1D9D1",
        }}
      >
        <Text style={{ fontSize: 22 }}>🌿</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{ fontSize: 16, fontWeight: "700", color: C.heading }}
          numberOfLines={1}
        >
          {businessName}
        </Text>
        <Text style={{ fontSize: 12, color: C.body }}>{roleLabel}</Text>
      </View>
      <TouchableOpacity
        style={{
          width: 38,
          height: 38,
          borderRadius: 19,
          backgroundColor: C.white,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.06,
          shadowRadius: 4,
          elevation: 2,
        }}
        onPress={onPressNotifications}
      >
        <Ionicons name="notifications-outline" size={20} color={C.heading} />
      </TouchableOpacity>
      <TouchableOpacity
        style={{
          width: 38,
          height: 38,
          borderRadius: 19,
          backgroundColor: C.white,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.06,
          shadowRadius: 4,
          elevation: 2,
        }}
        onPress={onPressSettings}
      >
        <Ionicons name="settings-outline" size={20} color={C.heading} />
      </TouchableOpacity>
    </View>
  );
}
