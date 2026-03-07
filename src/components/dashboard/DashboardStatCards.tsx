import { dashboardPalette as C } from "@/src/utils/dashboardUi";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

type Props = {
  activeBuyers: number;
  overdueCustomers: number;
};

export default function DashboardStatCards({
  activeBuyers,
  overdueCustomers,
}: Props) {
  return (
    <View style={{ flexDirection: "row", gap: 12, marginBottom: 28 }}>
      <View
        style={{
          flex: 1,
          backgroundColor: C.white,
          borderRadius: 20,
          padding: 18,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Text style={{ fontSize: 28, fontWeight: "800", color: C.heading }}>
            {activeBuyers}
          </Text>
          <View
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              backgroundColor: C.blueLight,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="people-outline" size={20} color={C.blue} />
          </View>
        </View>
        <Text style={{ fontSize: 13, color: C.body, marginTop: 6 }}>
          Active Buyers
        </Text>
      </View>

      <View
        style={{
          flex: 1,
          backgroundColor: C.white,
          borderRadius: 20,
          padding: 18,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Text style={{ fontSize: 28, fontWeight: "800", color: C.heading }}>
            {overdueCustomers}
          </Text>
          <View
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              backgroundColor: C.redLight,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="warning-outline" size={20} color={C.red} />
          </View>
        </View>
        <Text style={{ fontSize: 13, color: C.body, marginTop: 6 }}>
          Overdue Accounts
        </Text>
      </View>
    </View>
  );
}
