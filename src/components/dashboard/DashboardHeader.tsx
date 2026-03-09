import { useAuthStore } from "@/src/store/authStore";
import { dashboardPalette as C } from "@/src/utils/dashboardUi";
import { colors } from "@/src/utils/theme";
import { Bell, Settings } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  roleLabel?: string;
  overdueCount?: number;
  onPressNotifications?: () => void;
  onPressSettings?: () => void;
};

const getInitials = (name: string): string => {
  const parts = name.trim().split(" ").slice(0, 2);
  return parts.map((w) => w[0]?.toUpperCase() || "").join("") || "CB";
};

const getGreeting = (): string => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning 👋";
  if (h < 17) return "Good afternoon 👋";
  return "Good evening 👋";
};

export default function DashboardHeader({
  overdueCount = 0,
  onPressNotifications,
  onPressSettings,
}: Props) {
  const { profile } = useAuthStore();
  const businessName = profile?.business_name ?? profile?.name ?? "My Business";
  const initials = getInitials(businessName);

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
      {/* Initials avatar */}
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: colors.primary.DEFAULT,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 12,
        }}
      >
        <Text style={{ fontSize: 14, fontWeight: "700", color: colors.white }}>
          {initials}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{ fontSize: 16, fontWeight: "700", color: C.heading }}
          numberOfLines={1}
        >
          {businessName}
        </Text>
        <Text style={{ fontSize: 12, color: C.body }}>{getGreeting()}</Text>
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
          shadowColor: colors.black,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.06,
          shadowRadius: 4,
          elevation: 2,
        }}
        onPress={onPressNotifications}
      >
        <View style={{ position: "relative" }}>
          <Bell size={22} color={colors.neutral[900]} strokeWidth={1.75} />
          {overdueCount > 0 && (
            <View
              style={{
                position: "absolute",
                top: -2,
                right: -2,
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: colors.danger.DEFAULT,
              }}
            />
          )}
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={{
          width: 38,
          height: 38,
          borderRadius: 19,
          backgroundColor: C.white,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: colors.black,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.06,
          shadowRadius: 4,
          elevation: 2,
        }}
        onPress={onPressSettings}
      >
        <Settings size={20} color={C.heading} strokeWidth={1.8} />
      </TouchableOpacity>
    </View>
  );
}
