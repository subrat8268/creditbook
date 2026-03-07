import { dashboardPalette as C, formatINR } from "@/src/utils/dashboardUi";
import { Ionicons } from "@expo/vector-icons";
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
      style={{
        backgroundColor: C.white,
        borderRadius: 24,
        padding: 28,
        marginBottom: 12,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.07,
        shadowRadius: 12,
        elevation: 4,
      }}
    >
      <View
        style={{
          position: "absolute",
          top: -30,
          right: -30,
          width: 140,
          height: 140,
          borderRadius: 70,
          backgroundColor: C.heroDecor,
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
          backgroundColor: C.heroDecor,
          opacity: 0.55,
        }}
      />

      <Text
        style={{
          fontSize: 11,
          fontWeight: "700",
          letterSpacing: 1.4,
          color: C.heroLabel,
          marginBottom: 10,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontSize: 40,
          fontWeight: "800",
          color: C.heroAmount,
          marginBottom: 10,
          letterSpacing: -0.5,
        }}
      >
        {formatINR(amount)}
      </Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
        <Ionicons name="refresh-circle-outline" size={14} color={C.heroSub} />
        <Text style={{ fontSize: 12, color: C.heroSub }}>{updatedText}</Text>
      </View>
    </View>
  );
}
