import { Stack, useRouter } from "expo-router";
import {
  ArrowLeft,
  BarChart2,
  Building2,
  ChevronRight,
  CreditCard,
  Download,
  Hash,
  HelpCircle,
  Info,
  Languages,
  LogOut,
  Package,
  Receipt,
  Settings,
  Smartphone,
  Store,
  Truck,
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

import { colors } from "@/src/utils/theme";
import { supabase } from "@/src/services/supabase";
import { useAuthStore } from "@/src/store/authStore";
import { useLanguageStore } from "@/src/store/languageStore";

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
    <View className="bg-surface rounded-2xl px-5 pt-4 pb-2 mb-4 shadow-sm border border-border">
      <Text className="text-[11px] font-bold text-textSecondary uppercase tracking-widest mb-3">
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
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      className={`flex-row items-center py-3 ${
        !last ? "border-b border-border" : "mb-2"
      }`}
    >
      <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: colors.primaryLight }}>
        <Icon size={20} color={colors.primary} strokeWidth={2} />
      </View>
      <View className="flex-1 ml-3">
        <Text className="text-[10px] font-bold text-textSecondary uppercase tracking-wide mb-0.5">
          {label}
        </Text>
        <Text className="text-[14px] font-bold text-textPrimary" numberOfLines={1}>
          {value || "—"}
        </Text>
      </View>
      <ChevronRight size={18} color={colors.textSecondary} strokeWidth={2} />
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
    <View className="flex-row border border-border rounded-xl overflow-hidden mb-3 mt-1">
      {options.map((opt) => {
        const isActive = value === opt.value;
        return (
          <TouchableOpacity
            key={opt.value}
            onPress={() => onChange(opt.value)}
            activeOpacity={0.8}
            className={`flex-1 py-2.5 items-center border-r border-border last:border-r-0`}
            style={{
              backgroundColor: isActive ? colors.primaryLight : colors.surface,
              borderBottomWidth: isActive ? 2 : 0,
              borderBottomColor: colors.primary,
            }}
          >
            <Text
              className={`text-[13px] font-bold ${
                isActive ? "text-primary" : "text-textSecondary"
              }`}
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
  const { user, profile, logout } = useAuthStore();
  const { language, setLanguage } = useLanguageStore();
  const router = useRouter();

  if (!profile) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
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
      <View className="flex-row items-center px-4 py-3 bg-surface border-b border-border">
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={8}
          className="w-10 items-start justify-center"
        >
          <ArrowLeft size={24} color={colors.textPrimary} strokeWidth={2} />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-[18px] font-extrabold text-textPrimary">
          Profile & Settings
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Avatar ── */}
        <View className="items-center py-4 mb-4">
          <View className="w-20 h-20 rounded-full bg-success items-center justify-center mb-3 border-4 border-successLight shadow-sm">
            <Text className="text-[28px] font-black text-surface tracking-tight">
              {getInitials(profile.business_name)}
            </Text>
          </View>
          <Text className="text-[20px] font-black text-textPrimary">
            {profile.business_name || "Your Business"}
          </Text>
          {!!email && <Text className="text-[14px] font-semibold text-textSecondary mt-1">{email}</Text>}
          
          <TouchableOpacity
            onPress={() => router.push("/(main)/profile/edit" as never)}
            activeOpacity={0.8}
            className="mt-4 py-2 px-8 rounded-full border-2 border-primary"
          >
            <Text className="text-[14px] font-bold text-primary">Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* ── Business Details ── */}
        <SectionCard title="BUSINESS DETAILS">
          <DetailRow Icon={Store} label="NAME" value={profile.business_name} />
          <DetailRow Icon={Receipt} label="GSTIN" value={profile.gstin} />
          <DetailRow Icon={Hash} label="PREFIX" value={profile.bill_number_prefix ?? "INV"} />
          <DetailRow Icon={Smartphone} label="UPI ID" value={profile.upi_id} last />
        </SectionCard>

        {/* ── Inventory & Suppliers ── */}
        <SectionCard title="INVENTORY & SUPPLIERS">
          <DetailRow 
            Icon={Package} 
            label="CATALOG" 
            value="Products & Items" 
            onPress={() => router.push("/(main)/products" as never)} 
          />
          <DetailRow 
            Icon={Truck} 
            label="PARTNERS" 
            value="Suppliers & Vendors" 
            last 
            onPress={() => router.push("/(main)/suppliers" as never)} 
          />
        </SectionCard>

        {/* ── Business Tools ── */}
        <SectionCard title="BUSINESS TOOLS">
          <DetailRow 
            Icon={Download} 
            label="DATA" 
            value="Export Business Data" 
            onPress={() => router.push("/(main)/export" as never)} 
          />
          <DetailRow 
            Icon={BarChart2} 
            label="ANALYTICS" 
            value="Reports & Trends" 
            onPress={() => router.push("/(main)/reports" as never)} 
          />
          <DetailRow 
            Icon={Settings} 
            label="ACCOUNT" 
            value="General Settings" 
            last 
            onPress={() => Alert.alert("Settings", "Advanced settings coming soon.")} 
          />
        </SectionCard>

        {/* ── Bank Account ── */}
        <SectionCard title="BANK ACCOUNT">
          <DetailRow Icon={Building2} label="BANK NAME" value={profile.bank_name} />
          <DetailRow Icon={CreditCard} label="ACC NO" value={maskAccount(profile.account_number)} />
          <DetailRow Icon={Info} label="IFSC" value={profile.ifsc_code} last />
        </SectionCard>

        {/* ── App Preferences ── */}
        <SectionCard title="APP PREFERENCES">
          <View className="flex-row items-center justify-between py-2 mb-2">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: colors.primaryLight }}>
                <Languages size={20} color={colors.primary} strokeWidth={2} />
              </View>
              <Text className="text-[15px] font-bold text-textPrimary">Language</Text>
            </View>
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => setLanguage("en")}
                activeOpacity={0.8}
                className={`py-2 px-4 rounded-xl border ${
                  language === "en" ? "bg-primary border-primary" : "bg-background border-border"
                }`}
              >
                <Text className={`text-[13px] font-extrabold ${language === "en" ? "text-surface" : "text-textSecondary"}`}>
                  EN
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setLanguage("hi")}
                activeOpacity={0.8}
                className={`py-2 px-3 rounded-xl border ${
                  language === "hi" ? "bg-primary border-primary" : "bg-background border-border"
                }`}
              >
                <Text className={`text-[13px] font-extrabold ${language === "hi" ? "text-surface" : "text-textSecondary"}`}>
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
            onPress={() => Alert.alert("Help & Support", "Contact us at support@kredbook.in")} 
          />
          <DetailRow 
            Icon={Info} 
            label="ABOUT" 
            value="KredBook v1.0.0" 
            last 
            onPress={() => Alert.alert("About KredBook", "KredBook v1.0.0\nBuilt for Indian kirana stores and small businesses.")} 
          />
        </SectionCard>

        {/* ── Sign Out ── */}
        <View className="bg-surface rounded-2xl shadow-sm border border-border mt-2 mb-4">
          <TouchableOpacity
            onPress={handleSignOut}
            activeOpacity={0.8}
            className="flex-row items-center justify-center py-4 gap-2"
          >
            <LogOut size={20} color={colors.danger} strokeWidth={2.5} />
            <Text className="text-[16px] font-extrabold text-danger">Sign Out</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-center text-[12px] font-semibold text-textSecondary mt-2 mb-4 opacity-50">
          KredBook Systems • v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
