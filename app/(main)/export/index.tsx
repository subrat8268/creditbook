import { Stack, useRouter } from "expo-router";
import { ArrowLeft, Download, Info } from "lucide-react-native";
import { useState } from "react";
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

import { fetchOrdersForExport } from "@/src/api/export";
import { useAuthStore } from "@/src/store/authStore";
import { shareCsv, toCsv } from "@/src/utils/exportCsv";
import { colors, spacing, typography } from "@/src/utils/theme";

// ─── Types ────────────────────────────────────────────────────────────────────

type DatePreset = "all";

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ExportScreen() {
  const { profile } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const vendorId = profile?.id ?? "";

  // ── Export handler ──────────────────────────────────────────────────────────

  const handleBackup = async () => {
    setLoading(true);
    try {
      const rows = await fetchOrdersForExport(vendorId);
      const csv = toCsv(rows as unknown as Record<string, unknown>[]);

      if (!csv) {
        Alert.alert("No data", "You have no entries to export.");
        return;
      }

      const today = new Date().toISOString().substring(0, 10);
      const filename = `creditbook_backup_${today}.csv`;
      await shareCsv(csv, filename);
    } catch (err: any) {
      Alert.alert("Export failed", err?.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.backBtn}
        >
          <ArrowLeft size={22} color={colors.textPrimary} strokeWidth={1.75} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Backup &amp; Download</Text>
          <Text style={styles.headerSubtitle}>Export all your entries</Text>
        </View>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Backup Card ── */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>DOWNLOAD</Text>

          <TouchableOpacity
            onPress={handleBackup}
            disabled={loading}
            activeOpacity={0.75}
            style={[
              styles.backupButton,
              loading && styles.backupButtonDisabled,
            ]}
          >
            <Download size={20} color={colors.surface} strokeWidth={1.8} />
            {loading ? (
              <ActivityIndicator size="small" color={colors.surface} />
            ) : (
              <Text style={styles.backupButtonText}>Download CSV Backup</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.helpText}>
            Exports all your entries (bills, customers, payments). Open in Excel
            or Google Sheets.
          </Text>
        </View>

        {/* ── Info Banner ── */}
        <View style={styles.infoBanner}>
          <Info
            size={16}
            color={colors.fab}
            strokeWidth={1.8}
            style={styles.infoIcon}
          />
          <Text style={styles.infoText}>
            Your data is never shared. Files are saved only to your device.
          </Text>
        </View>
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

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 36,
    alignItems: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: typography.cardTitle.fontSize,
    fontWeight: typography.cardTitle.fontWeight,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: {
    padding: spacing.screenPadding,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },

  // Card
  card: {
    backgroundColor: colors.surface,
    borderRadius: spacing.cardRadius,
    padding: spacing.cardPadding,
    shadowColor: colors.textPrimary,
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionLabel: {
    fontSize: typography.overline.fontSize,
    fontWeight: typography.overline.fontWeight,
    color: colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 14,
  },

  // Date inputs
  dateRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    marginBottom: 14,
  },
  dateInputWrapper: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 6,
    fontWeight: "500",
  },

  // Backup button
  backupButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  backupButtonDisabled: {
    opacity: 0.6,
  },
  backupButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.surface,
  },
  helpText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 12,
    lineHeight: 18,
  },

  // Info banner
  infoBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.primaryBlueBg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  infoIcon: { marginTop: 1 },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: colors.fab,
    lineHeight: 18,
  },
});
