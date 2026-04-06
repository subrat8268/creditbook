import { supabase } from "@/src/services/supabase";
import { useAuthStore } from "@/src/store/authStore";
import { colors } from "@/src/utils/theme";
import { useRouter } from "expo-router";
import { Briefcase, Check, Store, Truck } from "lucide-react-native";
import { ComponentType, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import Button from "@/src/components/ui/Button";

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
    iconColor: colors.primary,
    iconBg: colors.primaryLight,
  },
  {
    role: "wholesaler",
    Icon: Truck,
    title: "Wholesaler",
    subtitle:
      "Distributor, FMCG supplier — manage bulk deliveries and large credit cycles",
    iconColor: colors.primary,
    iconBg: colors.primaryLight,
  },
  {
    role: "small-business",
    Icon: Briefcase,
    title: "Small Business",
    subtitle:
      "Auto repair, tiffin service, pharmacy — track service charges and payments",
    iconColor: colors.primary,
    iconBg: colors.primaryLight,
  },
];

const MODE_MAP = {
  retailer: "seller",
  wholesaler: "distributor",
  "small-business": "seller",
} as const;

export default function OnboardingRole() {
  const router = useRouter();
  const { user, setProfile, fetchProfile } = useAuthStore();
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
        await fetchProfile(user.id);
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
            <View className="flex-1 h-1 rounded-full bg-border" />
            <View className="flex-1 h-1 rounded-full bg-border" />
          </View>
        </View>

        {/* ── Title ── */}
        <Text className="text-2xl font-extrabold text-textPrimary mb-1.5">
          {"What's your business?"}
        </Text>
        <Text className="text-sm text-textSecondary mb-7">
          {"We'll set up KredBook to match your work"}
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
                  className="bg-surface rounded-2xl p-4 flex-row items-center gap-3.5"
                  style={{
                    borderWidth: isActive ? 2 : 1.5,
                    borderColor: isActive ? colors.primary : colors.border,
                    shadowColor: colors.textPrimary,
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
                    <Text className="text-base font-bold text-textPrimary mb-0.5">
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
                      backgroundColor: isActive ? colors.primary : colors.surface,
                      borderWidth: isActive ? 0 : 1.5,
                      borderColor: colors.border,
                    }}
                  >
                    {isActive && (
                      <Check size={14} color={colors.surface} strokeWidth={3} />
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
        <View className="mt-8">
          <Button
            title={loading ? "Saving…" : "Continue"}
            onPress={handleContinue}
            disabled={!selected || loading}
            loading={loading}
          />
        </View>
      </ScrollView>
    </View>
  );
}
