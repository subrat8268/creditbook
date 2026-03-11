import { Stack, useRouter } from "expo-router";
import {
    ArrowLeft,
    CalendarDays,
    FileText,
    Info,
    Receipt,
    Truck,
    Users,
} from "lucide-react-native";
import { ComponentType, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
    fetchCustomersForExport,
    fetchOrdersForExport,
    fetchPaymentsForExport,
    fetchSupplierPurchasesForExport,
} from "../api/export";
import { useAuthStore } from "../store/authStore";
import { shareCsv, toCsv } from "../utils/exportCsv";
import { colors } from "../utils/theme";

// ─── Types ────────────────────────────────────────────────────────────────────

type ExportType = "orders" | "payments" | "customers" | "suppliers";
type DatePreset = "all" | "month";

// ─── ExportRow sub-component ──────────────────────────────────────────────────

interface ExportRowProps {
  Icon: ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  label: string;
  desc: string;
  pillColor: string;
  pillBg: string;
  iconColor: string;
  iconBg: string;
  loading: boolean;
  disabled: boolean;
  onPress: () => void;
}

function ExportRow({
  Icon,
  label,
  desc,
  pillColor,
  pillBg,
  iconColor,
  iconBg,
  loading,
  disabled,
  onPress,
}: ExportRowProps) {
  return (
    <View style={styles.exportRow}>
      <View style={[styles.exportRowIcon, { backgroundColor: iconBg }]}>
        <Icon size={20} color={iconColor} strokeWidth={1.8} />
      </View>

      <View style={styles.exportRowText}>
        <Text style={styles.exportRowLabel}>{label}</Text>
        <Text style={styles.exportRowDesc} numberOfLines={1}>
          {desc}
        </Text>
      </View>

      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.75}
        style={[styles.exportPill, { backgroundColor: pillBg }]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={pillColor} />
        ) : (
          <Text style={[styles.exportPillText, { color: pillColor }]}>
            Export CSV
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

// ─── DateInput sub-component ──────────────────────────────────────────────────

interface DateInputProps {
  label: string;
  value: string;
  placeholder: string;
  onChangeText: (v: string) => void;
}

function DateInput({
  label,
  value,
  placeholder,
  onChangeText,
}: DateInputProps) {
  return (
    <View style={styles.dateInputWrapper}>
      <Text style={styles.dateLabel}>{label}</Text>
      <View style={styles.dateInputRow}>
        <TextInput
          style={styles.dateInput}
          placeholder={placeholder}
          placeholderTextColor={colors.neutral[400]}
          value={value}
          onChangeText={onChangeText}
          keyboardType="numeric"
          maxLength={10}
        />
        <CalendarDays
          size={16}
          color={colors.neutral[400]}
          strokeWidth={1.6}
          style={styles.calendarIcon}
        />
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ExportScreen() {
  const { profile } = useAuthStore();
  const router = useRouter();

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [datePreset, setDatePreset] = useState<DatePreset>("all");
  const [loadingKey, setLoadingKey] = useState<ExportType | null>(null);

  const vendorId = profile?.id ?? "";

  // ── Preset helpers ──────────────────────────────────────────────────────────

  const applyPreset = (preset: DatePreset) => {
    setDatePreset(preset);
    if (preset === "all") {
      setFromDate("");
      setToDate("");
    } else {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const pad = (n: number) => String(n).padStart(2, "0");
      const fmt = (d: Date) =>
        `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      setFromDate(fmt(firstDay));
      setToDate(fmt(now));
    }
  };

  const handleFromChange = (v: string) => {
    setFromDate(v);
    setDatePreset("all");
  };

  const handleToChange = (v: string) => {
    setToDate(v);
    setDatePreset("all");
  };

  // ── Export handler ──────────────────────────────────────────────────────────

  const isValidDate = (d: string) => !d || /^\d{4}-\d{2}-\d{2}$/.test(d);

  const handleExport = async (type: ExportType) => {
    if (!isValidDate(fromDate) || !isValidDate(toDate)) {
      Alert.alert("Invalid date", "Use YYYY-MM-DD format (e.g. 2024-01-15).");
      return;
    }

    setLoadingKey(type);
    try {
      const from = fromDate || undefined;
      const to = toDate || undefined;
      const today = new Date().toISOString().substring(0, 10);
      let csv = "";
      let filename = "";

      switch (type) {
        case "orders": {
          const rows = await fetchOrdersForExport(vendorId, from, to);
          csv = toCsv(rows);
          filename = `creditbook_orders_${today}.csv`;
          break;
        }
        case "payments": {
          const rows = await fetchPaymentsForExport(vendorId, from, to);
          csv = toCsv(rows);
          filename = `creditbook_payments_${today}.csv`;
          break;
        }
        case "customers": {
          const rows = await fetchCustomersForExport(vendorId);
          csv = toCsv(rows);
          filename = `creditbook_customer_balances_${today}.csv`;
          break;
        }
        case "suppliers": {
          const rows = await fetchSupplierPurchasesForExport(
            vendorId,
            from,
            to,
          );
          csv = toCsv(rows);
          filename = `creditbook_supplier_purchases_${today}.csv`;
          break;
        }
      }

      if (!csv) {
        Alert.alert(
          "No data",
          "There is no data to export for the selected range.",
        );
        return;
      }

      await shareCsv(csv, filename);
    } catch (err: any) {
      Alert.alert("Export failed", err?.message ?? "Something went wrong.");
    } finally {
      setLoadingKey(null);
    }
  };

  // ── Export row config ───────────────────────────────────────────────────────

  const exportRows: {
    type: ExportType;
    label: string;
    desc: string;
    Icon: ComponentType<{ size: number; color: string; strokeWidth?: number }>;
    pillColor: string;
    pillBg: string;
    iconColor: string;
    iconBg: string;
  }[] = [
    {
      type: "orders",
      label: "Orders & Bills",
      desc: "Invoice history with items",
      Icon: Receipt,
      pillColor: colors.white,
      pillBg: colors.primary.DEFAULT,
      iconColor: colors.primary.dark,
      iconBg: "#DCFCE7",
    },
    {
      type: "payments",
      label: "Payments Received",
      desc: "All customer payments",
      Icon: FileText,
      pillColor: colors.white,
      pillBg: colors.primary.DEFAULT,
      iconColor: colors.primary.dark,
      iconBg: "#DCFCE7",
    },
    {
      type: "customers",
      label: "Customer Balances",
      desc: "Outstanding balances per customer",
      Icon: Users,
      pillColor: colors.white,
      pillBg: colors.primary.DEFAULT,
      iconColor: colors.info.dark,
      iconBg: colors.info.bg,
    },
    {
      type: "suppliers",
      label: "Supplier Purchases",
      desc: "Deliveries and payments made",
      Icon: Truck,
      pillColor: colors.white,
      pillBg: colors.primary.DEFAULT,
      iconColor: colors.warning.dark,
      iconBg: colors.warning.bg,
    },
  ];

  const anyLoading = loadingKey !== null;

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
          <ArrowLeft size={22} color={colors.neutral[900]} strokeWidth={1.75} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Export Data</Text>
          <Text style={styles.headerSubtitle}>
            Download your business data as CSV files
          </Text>
        </View>
        {/* spacer to balance back button */}
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Date Filter Card ── */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>FILTER BY DATE (OPTIONAL)</Text>

          <View style={styles.dateRow}>
            <DateInput
              label="From"
              placeholder="Start date"
              value={fromDate}
              onChangeText={handleFromChange}
            />
            <View style={styles.dateSeparator} />
            <DateInput
              label="To"
              placeholder="End date"
              value={toDate}
              onChangeText={handleToChange}
            />
          </View>

          <View style={styles.chipRow}>
            <TouchableOpacity
              onPress={() => applyPreset("all")}
              activeOpacity={0.75}
              style={[
                styles.chip,
                datePreset === "all" ? styles.chipActive : styles.chipInactive,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  datePreset === "all"
                    ? styles.chipTextActive
                    : styles.chipTextInactive,
                ]}
              >
                All time
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => applyPreset("month")}
              activeOpacity={0.75}
              style={[
                styles.chip,
                datePreset === "month"
                  ? styles.chipActive
                  : styles.chipInactive,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  datePreset === "month"
                    ? styles.chipTextActive
                    : styles.chipTextInactive,
                ]}
              >
                This month
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Export Type Card ── */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>CHOOSE EXPORT TYPE</Text>

          {exportRows.map((row, index) => (
            <View key={row.type}>
              {index > 0 && <View style={styles.divider} />}
              <ExportRow
                Icon={row.Icon}
                label={row.label}
                desc={row.desc}
                pillColor={row.pillColor}
                pillBg={row.pillBg}
                iconColor={row.iconColor}
                iconBg={row.iconBg}
                loading={loadingKey === row.type}
                disabled={anyLoading}
                onPress={() => handleExport(row.type)}
              />
            </View>
          ))}
        </View>

        {/* ── Info Banner ── */}
        <View style={styles.infoBanner}>
          <Info
            size={16}
            color={colors.info.dark}
            strokeWidth={1.8}
            style={styles.infoIcon}
          />
          <Text style={styles.infoText}>
            Files are saved to your device and can be opened in Excel or Google
            Sheets
          </Text>
        </View>

        {/* ── Footer ── */}
        <Text style={styles.footer}>CreditBook Export</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.neutral.bg,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.neutral.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
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
    fontSize: 17,
    fontWeight: "700",
    color: colors.neutral[900],
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.neutral[500],
    marginTop: 1,
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },

  // Card
  card: {
    backgroundColor: colors.neutral.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.neutral[500],
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
    color: colors.neutral[500],
    marginBottom: 6,
    fontWeight: "500",
  },
  dateInputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: 10,
    backgroundColor: colors.neutral.bg,
    paddingHorizontal: 12,
    height: 44,
  },
  dateInput: {
    flex: 1,
    fontSize: 14,
    color: colors.neutral[900],
  },
  calendarIcon: { marginLeft: 4 },
  dateSeparator: { width: 1 },

  // Chips
  chipRow: {
    flexDirection: "row",
    gap: 8,
  },
  chip: {
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  chipActive: {
    backgroundColor: colors.primary.light,
    borderColor: colors.primary.DEFAULT,
  },
  chipInactive: {
    backgroundColor: colors.neutral.surface,
    borderColor: colors.neutral[300],
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  chipTextActive: {
    color: colors.primary.dark,
  },
  chipTextInactive: {
    color: colors.neutral[500],
  },

  // Export rows
  divider: {
    height: 1,
    backgroundColor: colors.neutral[200],
    marginVertical: 4,
  },
  exportRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  exportRowIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  exportRowText: {
    flex: 1,
  },
  exportRowLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.neutral[900],
  },
  exportRowDesc: {
    fontSize: 12,
    color: colors.neutral[500],
    marginTop: 2,
  },
  exportPill: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    minWidth: 90,
    alignItems: "center",
    justifyContent: "center",
  },
  exportPillText: {
    fontSize: 12,
    fontWeight: "700",
  },

  // Info banner
  infoBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.info.bg,
    borderWidth: 1,
    borderColor: colors.info.light,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  infoIcon: { marginTop: 1 },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: colors.info.dark,
    lineHeight: 18,
  },

  // Footer
  footer: {
    textAlign: "center",
    fontSize: 12,
    color: colors.neutral[400],
    marginTop: 4,
  },
});
