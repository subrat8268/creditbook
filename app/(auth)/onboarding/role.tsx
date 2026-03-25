import { supabase } from "@/src/services/supabase";
import { useAuthStore } from "@/src/store/authStore";
import { colors } from "@/src/utils/theme";
import { useRouter } from "expo-router";
import { Briefcase, Check, Store, Truck } from "lucide-react-native";
import { ComponentType, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

type Role = "retailer" | "wholesaler" | "small-business";

interface RoleCard {
  role: Role;
  Icon: ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  title: string;
  subtitle: string;
  iconColor: string;
  iconBg: string;
}

const ROLES: RoleCard[] = [
  {
    role: "retailer",
    Icon: Store,
    title: "Retailer",
    subtitle:
      "Kirana store, medical shop, clothing — sell to local customers on credit",
    iconColor: "#22C55E",
    iconBg: "#DCFCE7",
  },
  {
    role: "wholesaler",
    Icon: Truck,
    title: "Wholesaler",
    subtitle:
      "Distributor, FMCG supplier — manage bulk deliveries and large credit cycles",
    iconColor: "#22C55E",
    iconBg: "#DCFCE7",
  },
  {
    role: "small-business",
    Icon: Briefcase,
    title: "Small Business",
    subtitle:
      "Auto repair, tiffin service, pharmacy — track service charges and payments",
    iconColor: "#22C55E",
    iconBg: "#DCFCE7",
  },
];

const MODE_MAP = {
  retailer: "seller",
  wholesaler: "distributor",
  "small-business": "seller",
} as const;

export default function OnboardingRole() {
  const router = useRouter();
  const { user, profile, setProfile, fetchProfile } = useAuthStore();
  const [selected, setSelected] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = async () => {
    if (!selected || !user) return;
    setLoading(true);
    setError(null);
    const dashboardMode = MODE_MAP[selected];
    try {
      const { error: dbErr } = await supabase
        .from("profiles")
        .update({ role: selected, dashboard_mode: dashboardMode })
        .eq("user_id", user.id);
      if (dbErr) throw dbErr;

      const currentProfile = useAuthStore.getState().profile;
      if (currentProfile) {
        setProfile({
          ...currentProfile,
          role: selected,
          dashboard_mode: dashboardMode,
        });
      } else {
        await fetchProfile();
        const fetched = useAuthStore.getState().profile;
        if (fetched)
          setProfile({
            ...fetched,
            role: selected,
            dashboard_mode: dashboardMode,
          });
      }

      router.push("/(auth)/onboarding/business" as any);
    } catch (e: any) {
      setError(e.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Progress ── */}
        <View className="mt-5 mb-6">
          <Text className="text-[13px] text-textSecondary mb-2">
            Step 1 of 3
          </Text>
          <View className="flex-row gap-1.5">
            <View
              className="flex-1 h-1 rounded-full"
              style={{ backgroundColor: colors.primary }}
            />
            <View className="flex-1 h-1 rounded-full bg-neutral-200" />
            <View className="flex-1 h-1 rounded-full bg-neutral-200" />
          </View>
        </View>

        {/* ── Title ── */}
        <Text className="text-2xl font-extrabold text-textDark mb-1.5">
          {"What's your business?"}
        </Text>
        <Text className="text-sm text-textSecondary mb-7">
          {"We'll set up CreditBook to match your work"}
        </Text>

        {/* ── Role cards ── */}
        <View className="gap-3.5">
          {ROLES.map((item) => {
            const isActive = selected === item.role;
            return (
              <TouchableOpacity
                key={item.role}
                onPress={() => setSelected(item.role)}
                activeOpacity={0.85}
              >
                <View
                  className="bg-white rounded-2xl p-4 flex-row items-center gap-3.5"
                  style={{
                    borderWidth: isActive ? 2 : 1.5,
                    borderColor: isActive ? "#22C55E" : "#E5E7EB",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.04,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  {/* Icon badge */}
                  <View
                    className="w-11 h-11 rounded-[10px] items-center justify-center shrink-0"
                    style={{ backgroundColor: item.iconBg }}
                  >
                    <item.Icon
                      size={22}
                      color={item.iconColor}
                      strokeWidth={2}
                    />
                  </View>

                  {/* Text */}
                  <View className="flex-1">
                    <Text className="text-base font-bold text-textDark mb-0.5">
                      {item.title}
                    </Text>
                    <Text className="text-[13px] text-textSecondary leading-[18px]">
                      {item.subtitle}
                    </Text>
                  </View>

                  {/* Check circle */}
                  <View
                    className="w-6 h-6 rounded-full items-center justify-center shrink-0"
                    style={{
                      backgroundColor: isActive ? "#22C55E" : "#FFFFFF",
                      borderWidth: isActive ? 0 : 1.5,
                      borderColor: "#D1D5DB",
                    }}
                  >
                    {isActive && (
                      <Check size={14} color="#FFFFFF" strokeWidth={3} />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Error ── */}
        {error && (
          <View className="mt-4 bg-danger-bg border border-danger-light rounded-xl p-3">
            <Text className="text-danger-strong text-[13px] text-center">
              {error}
            </Text>
          </View>
        )}

        {/* ── Continue button ── */}
        <TouchableOpacity
          onPress={handleContinue}
          disabled={!selected || loading}
          activeOpacity={0.85}
          className={`mt-8 rounded-full py-[17px] items-center ${
            selected && !loading ? "bg-primary" : "bg-neutral-300"
          }`}
        >
          <Text className="text-white text-base font-bold">
            {loading ? "Saving…" : "Continue"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
