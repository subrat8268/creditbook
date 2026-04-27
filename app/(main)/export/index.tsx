import { Stack, useRouter } from "expo-router";
import { FileText, Download, AlertCircle } from "lucide-react-native";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import EmptyState from "@/src/components/feedback/EmptyState";
import Header from "@/src/components/layer2/Header";
import ScreenLayout from "@/src/components/layer2/ScreenLayout";
import CustomerPicker from "@/src/components/picker/CustomerPicker";
import DateRangePicker from "@/src/components/ui/DateRangePicker";
import { useTheme } from "@/src/utils/ThemeProvider";
import { fetchLedgerForExport } from "@/src/api/exportCustomer";
import { shareLedgerPdf } from "@/src/utils/exportLedgerPdf";
import { toCsv, shareCsv } from "@/src/utils/exportCsv";
import { useAuthStore } from "@/src/store/authStore";

export default function ExportScreen() {
  const { colors, spacing, typography } = useTheme();
  const { profile } = useAuthStore();
  const router = useRouter();

  const [customerPickerVisible, setCustomerPickerVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [dateRange, setDateRange] = useState<{ from?: string; to?: string }>({});
  const [loading, setLoading] = useState<"pdf" | "csv" | null>(null);

  const vendorId = profile?.id ?? "";

  const styles = StyleSheet.create({
    scroll: { flex: 1 },
    scrollContent: {
      padding: spacing.screenPadding,
      paddingBottom: spacing.xl,
      gap: spacing.md,
    },
    section: {
      backgroundColor: colors.surface,
      borderRadius: spacing.cardRadius,
      padding: spacing.cardPadding,
      marginBottom: spacing.md,
    },
    sectionLabel: {
      ...typography.overline,
      color: colors.textSecondary,
      marginBottom: spacing.sm,
    },
    selectBtn: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: spacing.md,
      paddingVertical: 14,
      backgroundColor: colors.background,
      gap: 8,
    },
    selectBtnText: {
      flex: 1,
      ...typography.body,
    },
    selectBtnPlaceholder: {
      flex: 1,
      ...typography.body,
      color: colors.textSecondary,
    },
    selectBtnArrow: {
      color: colors.textSecondary,
    },
    selectedCustomerName: {
      ...typography.body,
      fontWeight: "600",
      color: colors.textPrimary,
    },
    selectedCustomerPhone: {
      ...typography.caption,
      color: colors.textSecondary,
      marginTop: 2,
    },
    actionBtns: {
      flexDirection: "row",
      gap: spacing.sm,
    },
    actionBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 12,
    },
    actionBtnPdf: {
      backgroundColor: colors.primary,
    },
    actionBtnCsv: {
      backgroundColor: colors.surfaceAlt,
      borderWidth: 1,
      borderColor: colors.border,
    },
    actionBtnText: {
      fontSize: 14,
      fontWeight: "700",
    },
    actionBtnTextPdf: {
      color: colors.surface,
    },
    actionBtnTextCsv: {
      color: colors.textPrimary,
    },
    actionBtnDisabled: {
      opacity: 0.5,
    },
    emptyCard: {
      alignItems: "center",
      paddingVertical: spacing.xl,
    },
    emptyTitle: {
      ...typography.body,
      fontWeight: "600",
      color: colors.textPrimary,
      marginTop: spacing.md,
      marginBottom: 4,
    },
    emptySub: {
      ...typography.caption,
      color: colors.textSecondary,
    },
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
    infoText: {
      flex: 1,
      fontSize: 13,
      color: colors.fab,
      lineHeight: 18,
    },
  });

  const handleExportPdf = useCallback(async () => {
    if (!selectedCustomer) {
      Alert.alert("Select Customer", "Please choose a customer first.");
      return;
    }
    setLoading("pdf");
    try {
      const ledger = await fetchLedgerForExport(
        selectedCustomer.id,
        vendorId,
        dateRange.from,
        dateRange.to,
      );
      if (ledger.entries.length === 0) {
        Alert.alert("No Data", "No entries found for this customer in the selected period.");
        return;
      }
      await shareLedgerPdf(ledger);
    } catch (err: any) {
      Alert.alert("Export Failed", err?.message ?? "Something went wrong.");
    } finally {
      setLoading(null);
    }
  }, [selectedCustomer, vendorId, dateRange]);

  const handleExportCsv = useCallback(async () => {
    if (!selectedCustomer) {
      Alert.alert("Select Customer", "Please choose a customer first.");
      return;
    }
    setLoading("csv");
    try {
      const ledger = await fetchLedgerForExport(
        selectedCustomer.id,
        vendorId,
        dateRange.from,
        dateRange.to,
      );
      if (ledger.entries.length === 0) {
        Alert.alert("No Data", "No entries found for this customer in the selected period.");
        return;
      }
      const rows = ledger.entries.map((e) => ({
        date: e.date ? e.date.substring(0, 10) : "",
        description: e.description,
        amount: e.type === "bill" ? e.amount : -e.amount,
        status: e.status,
        balance_after: e.balance_after,
      }));
      const csv = toCsv(rows);
      const filename = `ledger_${selectedCustomer.name.replace(/\s+/g, "_")}_${new Date().toISOString().substring(0, 10)}.csv`;
      await shareCsv(csv, filename);
    } catch (err: any) {
      Alert.alert("Export Failed", err?.message ?? "Something went wrong.");
    } finally {
      setLoading(null);
    }
  }, [selectedCustomer, vendorId, dateRange]);

  return (
    <ScreenLayout>
      <Header
        title="Export"
        subtitle="Download customer ledger as PDF or CSV"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Customer selector */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>CUSTOMER</Text>
          <Pressable
            style={styles.selectBtn}
            onPress={() => setCustomerPickerVisible(true)}
          >
            <View style={{ flex: 1 }}>
              {selectedCustomer ? (
                <>
                  <Text style={styles.selectedCustomerName}>{selectedCustomer.name}</Text>
                  {selectedCustomer.phone ? (
                    <Text style={styles.selectedCustomerPhone}>{selectedCustomer.phone}</Text>
                  ) : null}
                </>
              ) : (
                <Text style={styles.selectBtnPlaceholder}>Select a customer...</Text>
              )}
            </View>
            <Text style={styles.selectBtnArrow}>›</Text>
          </Pressable>
        </View>

        {/* Date range */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DATE RANGE (OPTIONAL)</Text>
          <DateRangePicker
            visible={false}
            value={dateRange}
            onChange={setDateRange}
            onClose={() => {}}
          />
        </View>

        {/* Export options */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>FORMAT</Text>

          {!selectedCustomer ? (
            <View style={styles.emptyCard}>
              <AlertCircle size={32} color={colors.textSecondary} strokeWidth={1.5} />
              <Text style={styles.emptyTitle}>Select a customer to export</Text>
              <Text style={styles.emptySub}>
                Choose a customer above to generate their ledger
              </Text>
            </View>
          ) : (
            <View style={styles.actionBtns}>
              <TouchableOpacity
                style={[
                  styles.actionBtn,
                  styles.actionBtnPdf,
                  loading ? styles.actionBtnDisabled : null,
                ]}
                onPress={handleExportPdf}
                disabled={!!loading}
                activeOpacity={0.75}
              >
                {loading === "pdf" ? (
                  <ActivityIndicator size="small" color={colors.surface} />
                ) : (
                  <>
                    <FileText size={18} color={colors.surface} strokeWidth={1.8} />
                    <Text style={[styles.actionBtnText, styles.actionBtnTextPdf]}>PDF</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionBtn,
                  styles.actionBtnCsv,
                  loading ? styles.actionBtnDisabled : null,
                ]}
                onPress={handleExportCsv}
                disabled={!!loading}
                activeOpacity={0.75}
              >
                {loading === "csv" ? (
                  <ActivityIndicator size="small" color={colors.textPrimary} />
                ) : (
                  <>
                    <Download size={18} color={colors.textPrimary} strokeWidth={1.8} />
                    <Text style={[styles.actionBtnText, styles.actionBtnTextCsv]}>CSV</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Info banner */}
        <View style={styles.infoBanner}>
          <AlertCircle size={16} color={colors.fab} strokeWidth={1.8} />
          <Text style={styles.infoText}>
            Files are saved to your device only. No data leaves your phone.
          </Text>
        </View>
      </ScrollView>

      <CustomerPicker
        visible={customerPickerVisible}
        selectedPerson={selectedCustomer}
        setSelectedPerson={setSelectedCustomer}
        vendorId={vendorId}
        onClose={() => setCustomerPickerVisible(false)}
        variant="sheet"
      />
    </ScreenLayout>
  );
}