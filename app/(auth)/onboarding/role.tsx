import { supabase } from "@/src/services/supabase";
import { useAuthStore } from "@/src/store/authStore";
import { useRouter } from "expo-router";
import { ArrowLeft, Check, Store, User, Users } from "lucide-react-native";
import { ComponentType, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

type Role = "retailer" | "wholesaler" | "small-business";

interface RoleCard {
  role: Role;
  Icon: ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  title: string;
  subtitle: string;
  accentColor: string;
  image: any;
  bannerBg: string;
}

const ROLES: RoleCard[] = [
  {
    role: "retailer",
    Icon: Store,
    title: "Retailer / Shopkeeper",
    subtitle: "I sell goods directly to customers in my shop or online.",
    accentColor: "#16a34a",
    image: require("../../../assets/images/role-retailer.png"),
    bannerBg: "#bbf7d0",
  },
  {
    role: "wholesaler",
    Icon: Users,
    title: "Wholesaler / Distributor",
    subtitle: "I buy in bulk from suppliers and sell to other retailers.",
    accentColor: "#2563eb",
    image: require("../../../assets/images/role-wholesaler.png"),
    bannerBg: "#bfdbfe",
  },
  {
    role: "small-business",
    Icon: User,
    title: "Small Business Owner",
    subtitle: "I run a small business and want to track sales and credit.",
    accentColor: "#d97706",
    image: require("../../../assets/images/role-user.png"),
    bannerBg: "#fde68a",
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
    <View style={{ flex: 1, backgroundColor: "#f5f5f0" }}>
      {/* ── Header ── */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingTop: 56,
          paddingHorizontal: 20,
          paddingBottom: 12,
          backgroundColor: "#f5f5f0",
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <ArrowLeft size={22} color="#111827" strokeWidth={2} />
        </TouchableOpacity>
        <Text
          style={{
            flex: 1,
            textAlign: "center",
            fontSize: 16,
            fontWeight: "600",
            color: "#111827",
            marginRight: 22, // offset for back arrow width
          }}
        >
          Select your role
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Title ── */}
        <Text
          style={{
            fontSize: 30,
            fontWeight: "800",
            color: "#0f172a",
            marginTop: 20,
            marginBottom: 8,
            lineHeight: 38,
          }}
        >
          How do you do{"\n"}business?
        </Text>
        <Text
          style={{
            fontSize: 15,
            color: "#64748b",
            lineHeight: 22,
            marginBottom: 28,
          }}
        >
          Choose the option that best describes your business to get a
          personalized experience.
        </Text>

        {/* ── Role cards ── */}
        <View style={{ gap: 16 }}>
          {ROLES.map((item) => {
            const isActive = selected === item.role;
            return (
              <TouchableOpacity
                key={item.role}
                onPress={() => setSelected(item.role)}
                activeOpacity={0.9}
              >
                <View
                  style={{
                    backgroundColor: "#ffffff",
                    borderRadius: 20,
                    overflow: "hidden",
                    borderWidth: isActive ? 2.5 : 1.5,
                    borderColor: isActive ? item.accentColor : "#e2e8f0",
                    // shadow
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.06,
                    shadowRadius: 8,
                    elevation: 3,
                  }}
                >
                  {/* Image banner */}
                  {item.image ? (
                    <Image
                      source={item.image}
                      style={{ width: "100%", height: 160 }}
                      resizeMode="cover"
                    />
                  ) : (
                    // Placeholder — remove once image is added
                    <View
                      style={{
                        width: "100%",
                        height: 160,
                        backgroundColor: item.bannerBg,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <item.Icon
                        size={56}
                        color={item.accentColor + "99"}
                        strokeWidth={1.2}
                      />
                    </View>
                  )}

                  {/* Card body */}
                  <View style={{ padding: 18 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 8,
                        gap: 10,
                      }}
                    >
                      {/* Icon badge */}
                      <View
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          backgroundColor: item.accentColor + "18",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <item.Icon
                          size={20}
                          color={item.accentColor}
                          strokeWidth={1.8}
                        />
                      </View>

                      <Text
                        style={{
                          fontSize: 17,
                          fontWeight: "700",
                          color: "#0f172a",
                          flex: 1,
                        }}
                      >
                        {item.title}
                      </Text>

                      {/* Selection circle */}
                      <View
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          backgroundColor: isActive
                            ? item.accentColor
                            : "#f1f5f9",
                          borderWidth: isActive ? 0 : 1.5,
                          borderColor: "#cbd5e1",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {isActive && (
                          <Check size={14} color="#ffffff" strokeWidth={3} />
                        )}
                      </View>
                    </View>

                    <Text
                      style={{
                        fontSize: 13,
                        color: "#64748b",
                        lineHeight: 19,
                      }}
                    >
                      {item.subtitle}
                    </Text>
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
              backgroundColor: "#fef2f2",
              borderWidth: 1,
              borderColor: "#fecaca",
              borderRadius: 10,
              padding: 12,
            }}
          >
            <Text
              style={{ color: "#dc2626", fontSize: 13, textAlign: "center" }}
            >
              {error}
            </Text>
          </View>
        )}

        {/* ── CTA ── */}
        <TouchableOpacity
          onPress={handleContinue}
          disabled={!selected || loading}
          activeOpacity={0.85}
          style={{
            marginTop: 28,
            backgroundColor: selected && !loading ? "#22c55e" : "#d1d5db",
            borderRadius: 50,
            paddingVertical: 18,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "700" }}>
            {loading ? "Saving…" : "Start using CreditBook →"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
