import { Stack, useRouter } from "expo-router";
import {
    ArrowLeft,
    Building2,
    ChevronRight,
    CreditCard,
    Download,
    Hash,
    Info,
    Languages,
    LayoutGrid,
    LogOut,
    Package,
    Receipt,
    Smartphone,
    Store,
} from "lucide-react-native";
import { ComponentType, ReactNode } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { supabase } from "@/src/services/supabase";
import { useAuthStore } from "@/src/store/authStore";
import { useLanguageStore } from "@/src/store/languageStore";
import { colors, spacing } from "@/src/utils/theme";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name?: string | null): string {
  if (!name) return "CB";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((w) => w[0]?.toUpperCase() ?? "").join("");
}

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
    <View style={styles.sectionCard}>
      <Text style={styles.sectionLabel}>{title}</Text>
      {children}
    </View>
  );
}

// ─── DetailRow ────────────────────────────────────────────────────────────────

interface DetailRowProps {
  Icon: ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  label: string;
  value?: string | null;
  last?: boolean;
  onPress?: () => void;
}

function DetailRow({ Icon, label, value, last, onPress }: DetailRowProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={[styles.detailRow, last && styles.detailRowLast]}
    >
      <View style={styles.detailIconBox}>
        <Icon size={18} color={colors.primaryDark} strokeWidth={1.75} />
      </View>
      <View style={styles.detailText}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue} numberOfLines={1}>
          {value || "—"}
        </Text>
      </View>
      <ChevronRight size={16} color={colors.textSecondary} strokeWidth={1.75} />
    </TouchableOpacity>
  );
}

// ─── SegmentControl ───────────────────────────────────────────────────────────

interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (v: T) => void;
}

function SegmentControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentControlProps<T>) {
  return (
    <View style={styles.segmentWrapper}>
      {options.map((opt) => {
        const isActive = value === opt.value;
        return (
          <TouchableOpacity
            key={opt.value}
            onPress={() => onChange(opt.value)}
            activeOpacity={0.75}
            style={[styles.segmentItem, isActive && styles.segmentItemActive]}
          >
            <Text
              style={[styles.segmentText, isActive && styles.segmentTextActive]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function ProfileScreen() {
  const { user, profile, setProfile, logout } = useAuthStore();
  const { language, setLanguage } = useLanguageStore();
  const router = useRouter();

  if (!profile) {
    return (
      <SafeAreaView style={styles.loaderScreen}>
        <ActivityIndicator color={colors.primary.DEFAULT} />
      </SafeAreaView>
    );
  }

  const updateField = async (field: string, value: unknown) => {
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update({ [field]: value })
      .eq("user_id", user.id);
    if (!error) {
      const current = useAuthStore.getState().profile;
      if (current) setProfile({ ...current, [field]: value });
    }
  };

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

  const dashboardMode = (profile.dashboard_mode ?? "seller") as
    | "seller"
    | "distributor"
    | "both";

  const email = user?.email ?? user?.phone ?? "";

  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.headerBtn}
        >
          <ArrowLeft size={22} color={colors.textPrimary} strokeWidth={1.75} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile &amp; Settings</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Avatar ── */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarRing}>
            <Text style={styles.avatarText}>
              {getInitials(profile.business_name)}
            </Text>
          </View>
          <Text style={styles.businessName}>
            {profile.business_name || "Your Business"}
          </Text>
          {!!email && <Text style={styles.emailText}>{email}</Text>}
          <TouchableOpacity
            onPress={() =>
              Alert.alert("Edit Profile", "Profile editing coming soon.")
            }
            activeOpacity={0.75}
            style={styles.editBtn}
          >
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
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
          <View style={styles.prefRow}>
            <View style={styles.prefRowLeft}>
              <View style={styles.detailIconBox}>
                <LayoutGrid
                  size={18}
                  color={colors.primaryDark}
                  strokeWidth={1.75}
                />
              </View>
              <Text style={styles.prefRowLabel}>Dashboard Mode</Text>
            </View>
          </View>
          <SegmentControl<"seller" | "distributor" | "both">
            options={[
              { value: "seller", label: "Seller" },
              { value: "distributor", label: "Distributor" },
              { value: "both", label: "Both" },
            ]}
            value={dashboardMode}
            onChange={(v) => updateField("dashboard_mode", v)}
          />

          <View style={styles.prefDivider} />

          <View style={styles.prefRow}>
            <View style={styles.prefRowLeft}>
              <View style={styles.detailIconBox}>
                <Languages
                  size={18}
                  color={colors.primaryDark}
                  strokeWidth={1.75}
                />
              </View>
              <Text style={styles.prefRowLabel}>Language</Text>
            </View>
            <View style={styles.langToggle}>
              <TouchableOpacity
                onPress={() => setLanguage("en")}
                activeOpacity={0.75}
                style={[
                  styles.langPill,
                  language === "en" && styles.langPillActive,
                ]}
              >
                <Text
                  style={[
                    styles.langPillText,
                    language === "en" && styles.langPillTextActive,
                  ]}
                >
                  EN
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setLanguage("hi")}
                activeOpacity={0.75}
                style={[
                  styles.langPill,
                  language === "hi" && styles.langPillActive,
                ]}
              >
                <Text
                  style={[
                    styles.langPillText,
                    language === "hi" && styles.langPillTextActive,
                  ]}
                >
                  {"🇮🇳"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SectionCard>

        {/* ── Data ── */}
        <SectionCard title="DATA">
          <TouchableOpacity
            onPress={() => router.push("/(main)/products" as never)}
            activeOpacity={0.75}
            style={styles.detailRow}
          >
            <View style={styles.detailIconBox}>
              <Package
                size={18}
                color={colors.primaryDark}
                strokeWidth={1.75}
              />
            </View>
            <View style={styles.detailText}>
              <Text style={styles.detailValue}>Manage Products</Text>
            </View>
            <ChevronRight
              size={16}
              color={colors.textSecondary}
              strokeWidth={1.75}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/(main)/export" as never)}
            activeOpacity={0.75}
            style={[styles.detailRow, styles.detailRowLast]}
          >
            <View style={styles.detailIconBox}>
              <Download
                size={18}
                color={colors.primaryDark}
                strokeWidth={1.75}
              />
            </View>
            <View style={styles.detailText}>
              <Text style={styles.detailValue}>Export Business Data</Text>
            </View>
            <ChevronRight
              size={16}
              color={colors.textSecondary}
              strokeWidth={1.75}
            />
          </TouchableOpacity>
        </SectionCard>

        {/* ── Sign Out ── */}
        <View style={styles.sectionCard}>
          <TouchableOpacity
            onPress={handleSignOut}
            activeOpacity={0.75}
            style={styles.signOutRow}
          >
            <LogOut size={18} color={colors.danger} strokeWidth={1.75} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>CreditBook v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loaderScreen: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerBtn: {
    width: 36,
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 36,
    gap: spacing.sm,
  },
  avatarSection: {
    alignItems: "center",
    paddingVertical: 8,
  },
  avatarRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.surface,
  },
  businessName: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  emailText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 3,
  },
  editBtn: {
    marginTop: 14,
    paddingVertical: 8,
    paddingHorizontal: 28,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  editBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: spacing.cardRadius,
    paddingHorizontal: spacing.lg,
    paddingTop: 14,
    paddingBottom: 4,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  detailRowLast: {
    borderBottomWidth: 0,
    marginBottom: 8,
  },
  detailIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.paid.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  detailText: { flex: 1 },
  detailLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  segmentWrapper: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 12,
    marginTop: 4,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 9,
    alignItems: "center",
    backgroundColor: colors.surface,
  },
  segmentItemActive: {
    backgroundColor: colors.paid.bg,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  segmentTextActive: {
    color: colors.primaryDark,
  },
  prefRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    gap: spacing.sm,
  },
  prefRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
  prefRowLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  prefDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  langToggle: {
    flexDirection: "row",
    gap: 6,
  },
  langPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  langPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  langPillText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  langPillTextActive: {
    color: colors.surface,
  },
  signOutRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: 12,
    marginBottom: 8,
  },
  signOutText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.danger,
  },
  footer: {
    textAlign: "center",
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
  },
});
