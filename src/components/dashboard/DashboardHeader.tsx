import { useAuthStore } from "@/src/store/authStore";
import { Bell, Menu, Settings } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  /** default  = business avatar + name + greeting + settings (seller / distributor)
   *  both     = hamburger + "CreditBook" brand + bell only (both mode) */
  variant?: "default" | "both";
  roleLabel?: string;
  overdueCount?: number;
  onPressMenu?: () => void;
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
  variant = "default",
  overdueCount = 0,
  onPressMenu,
  onPressNotifications,
  onPressSettings,
}: Props) {
  const { profile } = useAuthStore();
  const businessName = profile?.business_name ?? profile?.name ?? "My Business";
  const initials = getInitials(businessName);

  // ── "Both" mode header — hamburger + brand + bell ─────────────────────────
  if (variant === "both") {
    return (
      <View className="pt-[54px] px-5 pb-4 flex-row items-center bg-white">
        {/* Hamburger — TODO(v3.6): opens drawer navigation */}
        <TouchableOpacity
          className="w-[38px] h-[38px] items-center justify-center mr-2"
          onPress={onPressMenu}
        >
          <Menu size={22} color="#1C1C1E" strokeWidth={1.75} />
        </TouchableOpacity>

        <Text className="flex-1 text-[18px] font-extrabold text-textDark text-center">
          CreditBook
        </Text>

        {/* Bell */}
        <TouchableOpacity
          className="w-[38px] h-[38px] rounded-full bg-primary-light items-center justify-center"
          onPress={onPressNotifications}
        >
          <View style={{ position: "relative" }}>
            <Bell size={20} color="#22C55E" strokeWidth={1.75} />
            {overdueCount > 0 && (
              <View
                className="bg-primary rounded-full"
                style={{
                  position: "absolute",
                  top: -2,
                  right: -2,
                  width: 8,
                  height: 8,
                }}
              />
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Default header — avatar + business name + greeting + settings ──────────
  return (
    <View className="pt-[54px] px-5 pb-4 flex-row items-center bg-background">
      {/* Initials avatar */}
      <View className="w-10 h-10 rounded-full bg-primary items-center justify-center mr-3">
        <Text className="text-sm font-bold text-white">{initials}</Text>
      </View>

      <View className="flex-1">
        <Text className="text-base font-bold text-textDark" numberOfLines={1}>
          {businessName}
        </Text>
        <Text className="text-xs text-textPrimary">{getGreeting()}</Text>
      </View>

      {/* Bell */}
      <TouchableOpacity
        className="w-[38px] h-[38px] rounded-full bg-white items-center justify-center mr-2"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.06,
          shadowRadius: 4,
          elevation: 2,
        }}
        onPress={onPressNotifications}
      >
        <View style={{ position: "relative" }}>
          <Bell size={22} color="#1C1C1E" strokeWidth={1.75} />
          {overdueCount > 0 && (
            <View
              className="bg-danger rounded-full"
              style={{
                position: "absolute",
                top: -2,
                right: -2,
                width: 8,
                height: 8,
              }}
            />
          )}
        </View>
      </TouchableOpacity>

      {/* Settings */}
      <TouchableOpacity
        className="w-[38px] h-[38px] rounded-full bg-white items-center justify-center"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.06,
          shadowRadius: 4,
          elevation: 2,
        }}
        onPress={onPressSettings}
      >
        <Settings size={20} color="#1C1C1E" strokeWidth={1.8} />
      </TouchableOpacity>
    </View>
  );
}
