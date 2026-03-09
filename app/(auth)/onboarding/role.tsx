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
    iconColor: "#F59E0B",
    iconBg: "#FEF3C7",
  },
  {
    role: "small-business",
    Icon: Briefcase,
    title: "Small Business",
    subtitle:
      "Auto repair, tiffin service, pharmacy — track service charges and payments",
    iconColor: "#3B82F6",
    iconBg: "#DBEAFE",
  },
];

// Maps each selectable role to the canonical dashboard_mode stored in DB
// DB CHECK constraint: dashboard_mode IN ('seller', 'distributor', 'both')
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

      router.replace("/(auth)/onboarding" as any);
    } catch (e: any) {
      setError(e.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.neutral.bg }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Title ── */}
        <Text
          style={{
            fontSize: 26,
            fontWeight: "800",
            color: colors.neutral[900],
            marginTop: 24,
            marginBottom: 6,
          }}
        >
          {"What's your business?"}
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: colors.neutral[500],
            marginBottom: 28,
          }}
        >
          {"We'll set up CreditBook to match your work"}
        </Text>

        {/* ── Role cards ── */}
        <View style={{ gap: 14 }}>
          {ROLES.map((item) => {
            const isActive = selected === item.role;
            return (
              <TouchableOpacity
                key={item.role}
                onPress={() => setSelected(item.role)}
                activeOpacity={0.85}
              >
                <View
                  style={{
                    backgroundColor: colors.white,
                    borderRadius: 16,
                    borderWidth: isActive ? 2 : 1.5,
                    borderColor: isActive ? "#22C55E" : colors.neutral[200],
                    padding: 16,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 14,
                    shadowColor: colors.black,
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.04,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  {/* Icon badge */}
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      backgroundColor: item.iconBg,
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <item.Icon
                      size={22}
                      color={item.iconColor}
                      strokeWidth={2}
                    />
                  </View>

                  {/* Text */}
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "700",
                        color: colors.neutral[900],
                        marginBottom: 3,
                      }}
                    >
                      {item.title}
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        color: colors.neutral[500],
                        lineHeight: 18,
                      }}
                    >
                      {item.subtitle}
                    </Text>
                  </View>

                  {/* Check circle */}
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: isActive ? "#22C55E" : colors.white,
                      borderWidth: isActive ? 0 : 1.5,
                      borderColor: colors.neutral[300],
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {isActive && (
                      <Check size={14} color={colors.white} strokeWidth={3} />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Error ── */}
        {error && (
          <View
            style={{
              marginTop: 16,
              backgroundColor: colors.danger.bg,
              borderWidth: 1,
              borderColor: colors.danger.light,
              borderRadius: 10,
              padding: 12,
            }}
          >
            <Text
              style={{
                color: colors.danger.strong,
                fontSize: 13,
                textAlign: "center",
              }}
            >
              {error}
            </Text>
          </View>
        )}

        {/* ── Continue button ── */}
        <TouchableOpacity
          onPress={handleContinue}
          disabled={!selected || loading}
          activeOpacity={0.85}
          style={{
            marginTop: 32,
            backgroundColor:
              selected && !loading ? "#22C55E" : colors.neutral[300],
            borderRadius: 50,
            paddingVertical: 17,
            alignItems: "center",
          }}
        >
          <Text
            style={{ color: colors.white, fontSize: 16, fontWeight: "700" }}
          >
            {loading ? "Saving…" : "Continue"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
