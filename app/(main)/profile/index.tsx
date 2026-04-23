import { Stack, useRouter } from "expo-router";
import {
  ArrowLeft,
  Building2,
  ChevronRight,
  CreditCard,
  Download,
  Hash,
  HelpCircle,
  Info,
  Languages,
  LogOut,
  Receipt,
  Smartphone,
  Store,
} from "lucide-react-native";
import { ComponentType, ReactNode } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Avatar from "@/src/components/ui/Avatar";
import Button from "@/src/components/ui/Button";
import ListItem from "@/src/components/layer2/ListItem";
import { supabase } from "@/src/services/supabase";
import { useAuthStore } from "@/src/store/authStore";
import { useLanguageStore } from "@/src/store/languageStore";
import { colors, spacing, typography } from "@/src/utils/theme";

function maskAccount(acc?: string | null): string {
  if (!acc) return "—";
  const cleaned = acc.replace(/\s/g, "");
  if (cleaned.length <= 4) return cleaned;
  return `**** **** ${cleaned.slice(-4)}`;
}

// ─── SectionCard ──────────────────────────────────────────────────────────────

interface SectionCardProps {
  title: string;
  children: ReactNode;
}

function SectionCard({ title, children }: SectionCardProps) {
  return (
    <View
      className="mb-4 bg-surface rounded-2xl border border-border"
      style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm }}
    >
      <Text style={[typography.caption, { marginBottom: spacing.md, textTransform: "uppercase", letterSpacing: 0.8 }]}>
        {title}
      </Text>
      {children}
    </View>
  );
}

// ─── DetailRow ────────────────────────────────────────────────────────────────

interface DetailRowProps {
  Icon: ComponentType<{ size: number; color?: string; strokeWidth?: number }>;
  label: string;
  value?: string | null;
  last?: boolean;
  onPress?: () => void;
}

function DetailRow({ Icon, label, value, last, onPress }: DetailRowProps) {
  const iconSlot = (
    <View className="items-center justify-center w-10 h-10 rounded-xl bg-primaryLight">
      <Icon size={20} color={colors.primary} strokeWidth={2} />
    </View>
  );

  return (
    <ListItem
      title={value || "—"}
      subtitle={label}
      leftSlot={iconSlot}
      variant="row"
      bordered={!last}
      noMargin
      onPress={onPress}
      trailingSlot={<ChevronRight size={18} color={colors.textSecondary} strokeWidth={2} />}
    />
  );
}

export default function ProfileScreen() {
  const { user, profile, logout } = useAuthStore();
  const { language, setLanguage } = useLanguageStore();
  const router = useRouter();

  if (!profile) {
    return (
      <SafeAreaView className="items-center justify-center flex-1 bg-background">
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await supabase.auth.signOut();
          logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const email = user?.email ?? user?.phone ?? "";

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ── Header ── */}
      <View className="flex-row items-center px-4 py-3 border-b bg-surface border-border">
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={8}
          className="items-start justify-center w-10"
        >
          <ArrowLeft size={24} color={colors.textPrimary} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[typography.sectionTitle, { flex: 1, textAlign: "center" }]}>Profile</Text>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Avatar ── */}
        <View className="items-center py-4 mb-4">
          <Avatar name={profile.business_name || "Your Business"} size="lg" />
          <Text style={[typography.screenTitle, { marginTop: spacing.md }]}> 
            {profile.business_name || "Your Business"}
          </Text>
          {!!email && (
            <Text style={[typography.caption, { marginTop: spacing.xs }]}> 
              {email}
            </Text>
          )}

          <View style={{ marginTop: spacing.lg, width: 180 }}>
            <Button
              title="Edit Profile"
              variant="outline"
              onPress={() => router.push("/(main)/profile/edit" as never)}
            />
          </View>
        </View>

        {/* ── Business Details ── */}
        <SectionCard title="BUSINESS DETAILS">
          <DetailRow Icon={Store} label="NAME" value={profile.business_name} />
          <DetailRow Icon={Receipt} label="GSTIN" value={profile.gstin} />
          <DetailRow
            Icon={Hash}
            label="PREFIX"
            value={profile.bill_number_prefix ?? "INV"}
          />
          <DetailRow
            Icon={Smartphone}
            label="UPI ID"
            value={profile.upi_id}
            last
          />
        </SectionCard>

        {/* ── Bank Account ── */}
        <SectionCard title="BANK ACCOUNT">
          <DetailRow
            Icon={Building2}
            label="BANK NAME"
            value={profile.bank_name}
          />
          <DetailRow
            Icon={CreditCard}
            label="ACC NO"
            value={maskAccount(profile.account_number)}
          />
          <DetailRow Icon={Info} label="IFSC" value={profile.ifsc_code} last />
        </SectionCard>

        {/* ── App Preferences ── */}
        <SectionCard title="APP PREFERENCES">
            <View className="flex-row items-center justify-between py-2 mb-2">
              <View className="flex-row items-center gap-3">
              <View
                className="items-center justify-center w-10 h-10 rounded-xl"
                style={{ backgroundColor: colors.primaryLight }}
              >
                <Languages size={20} color={colors.primary} strokeWidth={2} />
              </View>
                <Text style={typography.body}>
                  Language
                </Text>
              </View>
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => setLanguage("en")}
                activeOpacity={0.8}
                className={`py-2 px-4 rounded-xl border ${
                  language === "en"
                    ? "bg-primary border-primary"
                    : "bg-background border-border"
                }`}
              >
                <Text
                  className={`text-[13px] font-extrabold ${language === "en" ? "text-surface" : "text-textSecondary"}`}
                >
                  EN
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setLanguage("hi")}
                activeOpacity={0.8}
                className={`py-2 px-3 rounded-xl border ${
                  language === "hi"
                    ? "bg-primary border-primary"
                    : "bg-background border-border"
                }`}
              >
                <Text
                  className={`text-[13px] font-extrabold ${language === "hi" ? "text-surface" : "text-textSecondary"}`}
                >
                  🇮🇳
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SectionCard>

        {/* ── Support ── */}
        <SectionCard title="SUPPORT">
          <DetailRow
            Icon={HelpCircle}
            label="HELP"
            value="Contact Support"
            onPress={() =>
              Alert.alert("Help & Support", "Contact us at support@kredbook.in")
            }
          />
          <DetailRow
            Icon={Info}
            label="ABOUT"
            value="KredBook v1.0.0"
            last
            onPress={() =>
              Alert.alert(
                "About KredBook",
                "KredBook v1.0.0\nBuilt for Indian kirana stores and small businesses.",
              )
            }
          />
        </SectionCard>

        {/* ── Export Data ── */}
        <SectionCard title="DATA">
          <DetailRow
            Icon={Download}
            label="Export All Data"
            value="CSV backup"
            onPress={() => router.push("/(main)/export")}
          />
        </SectionCard>

        {/* ── Sign Out ── */}
        <View className="mt-2 mb-4">
          <Button
            title="Sign Out"
            variant="danger"
            onPress={handleSignOut}
            icon={<LogOut size={18} color={colors.surface} strokeWidth={2.5} />}
          />
        </View>

        <Text style={[typography.caption, { textAlign: "center", marginTop: spacing.sm, marginBottom: spacing.md, opacity: 0.6 }]}> 
          KredBook Systems • v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
