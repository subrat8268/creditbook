import { Banknote, Download, Receipt, Store, Users } from "lucide-react-native";
import { ComponentType, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import {
    fetchCustomersForExport,
    fetchOrdersForExport,
    fetchPaymentsForExport,
    fetchSupplierPurchasesForExport,
} from "../api/export";
import ScreenWrapper from "../components/ScreenWrapper";
import { useAuthStore } from "../store/authStore";
import { shareCsv, toCsv } from "../utils/exportCsv";

type ExportType = "orders" | "payments" | "customers" | "suppliers";

export default function ExportScreen() {
  const { profile } = useAuthStore();
  const { t } = useTranslation();

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState<ExportType | null>(null);

  const vendorId = profile?.id ?? "";

  // Basic YYYY-MM-DD validation
  const isValidDate = (d: string) => !d || /^\d{4}-\d{2}-\d{2}$/.test(d);

  const handleExport = async (type: ExportType) => {
    if (!isValidDate(fromDate) || !isValidDate(toDate)) {
      Alert.alert(t("export.invalidDate"), t("export.invalidDateDesc"));
      return;
    }

    setLoading(type);
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
          filename = `orders_${today}.csv`;
          break;
        }
        case "payments": {
          const rows = await fetchPaymentsForExport(vendorId, from, to);
          csv = toCsv(rows);
          filename = `payments_received_${today}.csv`;
          break;
        }
        case "customers": {
          const rows = await fetchCustomersForExport(vendorId);
          csv = toCsv(rows);
          filename = `customer_balances_${today}.csv`;
          break;
        }
        case "suppliers": {
          const rows = await fetchSupplierPurchasesForExport(
            vendorId,
            from,
            to,
          );
          csv = toCsv(rows);
          filename = `supplier_purchases_${today}.csv`;
          break;
        }
      }

      if (!csv) {
        Alert.alert(t("export.noData"), t("export.noDataDesc"));
        return;
      }

      await shareCsv(csv, filename);
    } catch (err: any) {
      Alert.alert(t("common.error"), err?.message ?? t("common.error"));
    } finally {
      setLoading(null);
    }
  };

  const buttons: {
    type: ExportType;
    label: string;
    desc: string;
    Icon: ComponentType<{ size: number; color: string; strokeWidth?: number }>;
    color: string;
    bg: string;
    hasDateFilter: boolean;
  }[] = [
    {
      type: "orders",
      label: t("export.orders"),
      desc: t("export.ordersDesc"),
      Icon: Receipt,
      color: "#16a34a",
      bg: "#f0fdf4",
      hasDateFilter: true,
    },
    {
      type: "payments",
      label: t("export.payments"),
      desc: t("export.paymentsDesc"),
      Icon: Banknote,
      color: "#2563eb",
      bg: "#eff6ff",
      hasDateFilter: true,
    },
    {
      type: "customers",
      label: t("export.customers"),
      desc: t("export.customersDesc"),
      Icon: Users,
      color: "#7c3aed",
      bg: "#f5f3ff",
      hasDateFilter: false,
    },
    {
      type: "suppliers",
      label: t("export.suppliers"),
      desc: t("export.suppliersDesc"),
      Icon: Store,
      color: "#dc2626",
      bg: "#fef2f2",
      hasDateFilter: true,
    },
  ];

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text className="text-2xl font-bold text-gray-900 mb-1">
          {t("export.title")}
        </Text>
        <Text className="text-sm text-gray-500 mb-6">
          {t("export.subtitle")}
        </Text>

        {/* Date Range Filter */}
        <View className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-6">
          <Text className="font-semibold text-gray-800 mb-3">
            {t("export.dateRange")}
          </Text>
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="text-xs text-gray-500 mb-1">
                {t("export.from")}
              </Text>
              <TextInput
                className="bg-white border border-gray-200 rounded-xl p-3 text-gray-900"
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9ca3af"
                value={fromDate}
                onChangeText={setFromDate}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>
            <View className="flex-1">
              <Text className="text-xs text-gray-500 mb-1">
                {t("export.to")}
              </Text>
              <TextInput
                className="bg-white border border-gray-200 rounded-xl p-3 text-gray-900"
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9ca3af"
                value={toDate}
                onChangeText={setToDate}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>
          </View>
          <Text className="text-xs text-gray-400 mt-2">
            {t("export.dateHint")}
          </Text>
        </View>

        {/* Export Buttons */}
        <Text className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">
          {t("export.selectReport")}
        </Text>

        <View className="gap-y-3">
          {buttons.map((btn) => (
            <TouchableOpacity
              key={btn.type}
              onPress={() => handleExport(btn.type)}
              disabled={loading !== null}
              activeOpacity={0.75}
              style={{ backgroundColor: btn.bg }}
              className="rounded-2xl border border-gray-100 p-4 flex-row items-center"
            >
              {/* Icon */}
              <View
                className="w-11 h-11 rounded-xl items-center justify-center mr-4"
                style={{ backgroundColor: btn.color + "20" }}
              >
                <btn.Icon size={22} color={btn.color} strokeWidth={1.8} />
              </View>

              {/* Text */}
              <View className="flex-1">
                <Text className="font-semibold text-gray-900 text-base">
                  {btn.label}
                </Text>
                <Text className="text-xs text-gray-500 mt-0.5">
                  {btn.desc}
                  {btn.hasDateFilter && (fromDate || toDate)
                    ? ` · ${t("export.filtered")}`
                    : ""}
                </Text>
              </View>

              {/* Action / Loader */}
              {loading === btn.type ? (
                <ActivityIndicator color={btn.color} size="small" />
              ) : (
                <Download size={20} color={btn.color} strokeWidth={1.8} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <Text className="text-xs text-center text-gray-400 mt-8 mb-4">
          {t("export.footer")}
        </Text>
      </ScrollView>
    </ScreenWrapper>
  );
}
