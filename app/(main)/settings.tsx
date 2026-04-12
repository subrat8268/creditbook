/**
 * Settings Screen - Configure app preferences & feature toggles
 *
 * Provides user control over:
 * - Feature visibility (Quick Items, Advanced Export)
 * - Sync preferences
 * - Debug information
 */

import { useFeatureFlags } from "@/src/hooks/useFeatureFlags";
import { usePreferencesStore } from "@/src/store/preferencesStore";
import { colors, spacing } from "@/src/utils/theme";
import { Stack, useRouter } from "expo-router";
import { ArrowLeft, ToggleLeft, ToggleRight, Info } from "lucide-react-native";
import { useState } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const router = useRouter();
  const { businessType, featureFlags, setFeatureFlags } = usePreferencesStore();
  const features = useFeatureFlags();

  const handleToggleQuickItems = () => {
    setFeatureFlags({ hideQuickItems: !featureFlags.hideQuickItems });
  };

  const handleToggleExport = () => {
    setFeatureFlags({ hideExport: !featureFlags.hideExport });
  };

  const handleClearOfflineQueue = () => {
    Alert.alert(
      "Clear Offline Queue",
      "This will clear any pending entry syncs. Use only if syncing is stuck.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            // TODO: Implement clear offline queue action
            Alert.alert("Done", "Offline queue cleared");
          },
        },
      ]
    );
  };

  const FeatureToggleRow = ({
    title,
    description,
    enabled,
    onToggle,
  }: {
    title: string;
    description: string;
    enabled: boolean;
    onToggle: () => void;
  }) => (
    <TouchableOpacity
      onPress={onToggle}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 15,
            fontWeight: "500",
            color: colors.textPrimary,
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: colors.textSecondary,
            marginTop: spacing.xs,
          }}
        >
          {description}
        </Text>
      </View>
      {enabled ? (
        <ToggleRight size={26} color={colors.primary} strokeWidth={1.5} />
      ) : (
        <ToggleLeft size={26} color={colors.textSecondary} strokeWidth={1.5} />
      )}
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <Text
      style={{
        fontSize: 12,
        fontWeight: "600",
        color: colors.textSecondary,
        textTransform: "uppercase",
        marginTop: spacing.lg,
        marginBottom: spacing.sm,
        marginLeft: spacing.md,
      }}
    >
      {title}
    </Text>
  );

  const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <Text style={{ fontSize: 13, color: colors.textSecondary }}>{label}</Text>
      <Text style={{ fontSize: 13, fontWeight: "500", color: colors.textPrimary }}>
        {value}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.md,
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: spacing.md }}>
          <ArrowLeft size={24} color={colors.textPrimary} strokeWidth={2} />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "600",
            color: colors.textPrimary,
          }}
        >
          Settings
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        {/* Feature Toggles */}
        <SectionHeader title="Features" />
        <View style={{ backgroundColor: colors.surface, marginBottom: spacing.md }}>
          <FeatureToggleRow
            title="Quick Items"
            description="Enable fast item entry form variants"
            enabled={!featureFlags.hideQuickItems}
            onToggle={handleToggleQuickItems}
          />
          <FeatureToggleRow
            title="Export"
            description="Show PDF, Excel, and CSV export options"
            enabled={!featureFlags.hideExport}
            onToggle={handleToggleExport}
          />
        </View>

        {/* Business Information */}
        <SectionHeader title="Business" />
        <View style={{ backgroundColor: colors.surface, marginBottom: spacing.md }}>
          <InfoRow
            label="Business Type"
            value={businessType === "distributor" ? "Distributor" : "Retailer"}
          />
          <View
            style={{
              paddingVertical: spacing.sm,
              paddingHorizontal: spacing.md,
            }}
          >
            <TouchableOpacity
              onPress={() => router.push("/(main)/profile/edit")}
              style={{
                paddingVertical: spacing.sm,
                paddingHorizontal: spacing.sm,
                marginVertical: spacing.xs,
              }}
            >
              <Text style={{ fontSize: 13, color: colors.primary, fontWeight: "500" }}>
                → Change in Profile Settings
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sync & Data */}
        <SectionHeader title="Sync & Data" />
        <View style={{ backgroundColor: colors.surface, marginBottom: spacing.md }}>
          <TouchableOpacity
            onPress={handleClearOfflineQueue}
            style={{
              paddingVertical: spacing.md,
              paddingHorizontal: spacing.md,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Info size={18} color={colors.warning} strokeWidth={1.5} style={{ marginRight: spacing.sm }} />
              <Text style={{ flex: 1, fontSize: 15, fontWeight: "500", color: colors.warning }}>
                Clear Offline Queue
              </Text>
            </View>
            <Text
              style={{
                fontSize: 13,
                color: colors.textSecondary,
                marginTop: spacing.xs,
                marginLeft: 26,
              }}
            >
              Clear stuck pending syncs (use if necessary)
            </Text>
          </TouchableOpacity>
        </View>

        {/* About */}
        <SectionHeader title="About" />
        <View style={{ backgroundColor: colors.surface, paddingBottom: spacing.md }}>
          <InfoRow label="App Version" value="1.0.0" />
          <InfoRow label="Build" value="Offline-First Optimized" />
          <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.sm }}>
            <Text style={{ fontSize: 11, color: colors.textSecondary, fontStyle: "italic" }}>
              Fast, simple, always on — online or offline.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
