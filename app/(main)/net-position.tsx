import { formatINR } from "@/src/utils/dashboardUi";
import { colors, gradients } from "@/src/utils/theme";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Calendar,
  Download,
  AlertTriangle,
  Clock,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
} from "lucide-react-native";
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuthStore } from "@/src/store/authStore";
import { useNetPositionReport } from "@/src/hooks/useDashboard";
import Loader from "@/src/components/feedback/Loader";
import { useMemo } from "react";

export default function NetPositionScreen() {
  const router = useRouter();
  const { profile } = useAuthStore();
  const { data, isLoading, refetch, isRefetching } = useNetPositionReport(
    profile?.id,
  );

  const cashFlowMax = useMemo(() => {
    if (!data?.cashFlow?.length) return 1;
    return Math.max(
      1,
      ...data.cashFlow.map((m) => Math.max(m.inflow, m.outflow, 1)),
    );
  }, [data?.cashFlow]);

  const hasSurplus = (data?.netBalance ?? 0) >= 0;
  const TrendIcon = hasSurplus ? ArrowUpRight : ArrowDownRight;
  const trendColor = hasSurplus ? "#A7F3D0" : "#FCA5A5";
  const trendLabel = hasSurplus
    ? "Cash surplus available"
    : "Cash deficit — settle payables";

  if (isLoading || !data) return <Loader />;

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View
        className="flex-row items-center justify-between px-5 py-4 border-b border-border"
        style={{ paddingTop: 50, backgroundColor: colors.surface }} 
      >
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()} className="p-1">
            <ArrowLeft size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: "700", color: colors.textPrimary }}>
            Net Position
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          className="flex-row items-center gap-1 px-3 py-1.5 rounded-full border"
          style={{ borderColor: colors.border, backgroundColor: colors.background }}
          onPress={() => refetch()}
        >
          <Calendar size={16} color={colors.textPrimary} strokeWidth={2.2} />
          <Text style={{ fontSize: 13, fontWeight: "600", color: colors.textPrimary }}>
            Last 30 days
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Net Position Gradient Hero */}
        <LinearGradient
          colors={[gradients.netPosition, gradients.netPosition]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="rounded-[24px] p-6 mb-6"
        >
          <View
            style={{ position: "absolute", top: 18, right: 18 }}
            className="w-12 h-12 rounded-2xl items-center justify-center"
          >
            <View
              style={{
                backgroundColor: "rgba(255,255,255,0.18)",
                borderColor: "rgba(255,255,255,0.3)",
                borderWidth: 1,
              }}
              className="w-12 h-12 rounded-2xl items-center justify-center"
            >
              <Wallet size={24} color={colors.surface} strokeWidth={2.2} />
            </View>
          </View>
          <Text style={{ fontSize: 12, fontWeight: "600", color: "rgba(255,255,255,0.7)", letterSpacing: 1, marginBottom: 8 }}>
            YOUR NET POSITION
          </Text>
          <Text style={{ fontSize: 44, fontWeight: "800", color: colors.surface, marginBottom: 8 }}>
            {formatINR(data.netBalance)}
          </Text>
          <View className="flex-row items-center gap-2">
            <TrendIcon size={14} color={trendColor} />
            <Text style={{ fontSize: 14, color: trendColor, fontWeight: "500" }}>
              {trendLabel}
            </Text>
          </View>
          <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 6 }}>
            Includes receivables and supplier payables for the last 30 days.
          </Text>
        </LinearGradient>

        {/* Breakdown Card */}
        <View className="bg-surface rounded-[20px] p-5 mb-6 border border-borderLight shadow-sm">
          <Text style={{ fontSize: 11, fontWeight: "700", color: colors.textMuted, letterSpacing: 1, marginBottom: 16 }}>
            BREAKDOWN
          </Text>

          <View className="flex-row justify-between mb-4">
            <Text style={{ fontSize: 15, color: colors.textSecondary, fontWeight: "500" }}>Total Receivables</Text>
            <Text style={{ fontSize: 15, color: colors.primary, fontWeight: "700" }}>+{formatINR(data.totalReceivables)}</Text>
          </View>
          <View className="flex-row justify-between mb-4 pb-4 border-b border-borderLight">
            <Text style={{ fontSize: 15, color: colors.textSecondary, fontWeight: "500" }}>Total Payables</Text>
            <Text style={{ fontSize: 15, color: colors.danger, fontWeight: "700" }}>-{formatINR(data.totalPayables)}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text style={{ fontSize: 16, color: colors.textPrimary, fontWeight: "700" }}>Net Balance</Text>
            <Text style={{ fontSize: 18, color: colors.textPrimary, fontWeight: "800" }}>{formatINR(data.netBalance)}</Text>
          </View>
        </View>

        {/* Trend Mock */}
        <Text style={{ fontSize: 11, fontWeight: "700", color: colors.textMuted, letterSpacing: 1, marginBottom: 12 }}>
          CASH FLOW TREND (LAST 6 MONTHS)
        </Text>
        <View className="bg-surface rounded-[20px] p-5 mb-6 border border-borderLight shadow-sm">
          <View className="flex-row justify-between items-end mb-4" style={{ height: 160 }}>
            {data.cashFlow.map((month, i) => {
              const inflowHeight = (month.inflow / cashFlowMax) * 100;
              const outflowHeight = (month.outflow / cashFlowMax) * 100;
              return (
                <View key={`${month.label}-${i}`} className="items-center" style={{ width: 32 }}>
                  <View className="w-full rounded-md overflow-hidden" style={{ flex: 1, backgroundColor: colors.background }}>
                    <View
                      style={{
                        position: "absolute",
                        bottom: `${outflowHeight}%`,
                        height: `${inflowHeight}%`,
                        width: "100%",
                        backgroundColor: colors.primary,
                      }}
                    />
                    <View
                      style={{
                        position: "absolute",
                        bottom: 0,
                        height: `${outflowHeight}%`,
                        width: "100%",
                        backgroundColor: colors.danger,
                      }}
                    />
                  </View>
                  <Text style={{ fontSize: 10, marginTop: 8, color: colors.textSecondary }}>{month.label}</Text>
                </View>
              );
            })}
          </View>
           <View className="flex-row justify-center gap-6">
             <View className="flex-row items-center gap-2">
               <View className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.primary }} />
               <Text style={{ fontSize: 11, color: colors.textSecondary }}>Inflow</Text>
             </View>
             <View className="flex-row items-center gap-2">
               <View className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.danger }} />
               <Text style={{ fontSize: 11, color: colors.textSecondary }}>Outflow</Text>
             </View>
           </View>
        </View>

        {/* Top Customers Owed */}
        <Text style={{ fontSize: 11, fontWeight: "700", color: colors.textMuted, letterSpacing: 1, marginBottom: 12 }}>
          TOP CUSTOMERS OWED
        </Text>
        <View className="bg-surface rounded-[20px] mb-6 border border-borderLight shadow-sm overflow-hidden">
          {data.topCustomers.map((c, i) => (
            <View key={c.id} className={`flex-row items-center justify-between p-4 ${i !== data.topCustomers.length - 1 ? 'border-b border-borderLight' : ''}`}>
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: colors.avatarPalette[i % colors.avatarPalette.length] + '22' }}>
                   <Text style={{ color: colors.avatarPalette[i % colors.avatarPalette.length], fontWeight: "700", fontSize: 14 }}>{c.initials}</Text>
                  </View>
                  <Text style={{ fontSize: 15, fontWeight: "600", color: colors.textPrimary }}>{c.name}</Text>
                </View>
                <Text style={{ fontSize: 15, fontWeight: "700", color: colors.primary }}>{formatINR(c.balance)}</Text>
            </View>
          ))}
        </View>

        {/* Top Suppliers Owed */}
        <Text style={{ fontSize: 11, fontWeight: "700", color: colors.textMuted, letterSpacing: 1, marginBottom: 12 }}>
          TOP SUPPLIERS OWED
        </Text>
        <View className="bg-surface rounded-[20px] mb-6 border border-borderLight shadow-sm overflow-hidden">
          {data.topSuppliers.map((s, i) => (
            <View key={s.id} className={`flex-row items-center justify-between p-4 ${i !== data.topSuppliers.length - 1 ? 'border-b border-borderLight' : ''}`}>
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: colors.supplierAvatarBg[i % colors.supplierAvatarBg.length] }}>
                    <Text style={{ color: colors.supplierAvatarText[i % colors.supplierAvatarText.length], fontWeight: "700", fontSize: 14 }}>{s.initials}</Text>
                  </View>
                  <Text style={{ fontSize: 15, fontWeight: "600", color: colors.textPrimary }}>{s.name}</Text>
                </View>
                <Text style={{ fontSize: 15, fontWeight: "700", color: colors.danger }}>{formatINR(s.amountOwed)}</Text>
            </View>
          ))}
        </View>

        {/* Quick Insights */}
        <Text style={{ fontSize: 11, fontWeight: "700", color: colors.textMuted, letterSpacing: 1, marginBottom: 12 }}>
          QUICK INSIGHTS
        </Text>
        <View className="gap-3 mb-6">
          <View className="flex-row items-center gap-2 bg-danger-bg p-3 rounded-xl border border-danger-light">
            <AlertTriangle size={16} color={colors.danger} />
            <Text style={{ fontSize: 13, fontWeight: "600", color: colors.danger }}>High collection risk: {data.overdueCount} customers</Text>
          </View>
          <View className="flex-row items-center gap-2" style={{ backgroundColor: colors.warningBg, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: colors.warningBadgeBg }}>
            <Clock size={16} color={colors.warning} />
            <Text style={{ fontSize: 13, fontWeight: "600", color: colors.warning }}>Upcoming payables: {formatINR(data.upcomingPayables)} this week</Text>
          </View>
          <View className="flex-row items-center gap-2" style={{ backgroundColor: colors.orange.bg, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: colors.orange.border }}>
            <Zap size={16} color={colors.orange.text} />
            <Text style={{ fontSize: 13, fontWeight: "600", color: colors.orange.text }}>Cash flow optimized</Text>
          </View>
        </View>

      </ScrollView>

      {/* Floating Action Bar */}
      <View className="absolute bottom-5 left-5 right-5">
         <TouchableOpacity 
           className="flex-row justify-center items-center gap-2 py-4 rounded-2xl" 
           style={{ backgroundColor: colors.textPrimary }}
         >
           <Download size={18} color={colors.surface} />
           <Text style={{ fontSize: 15, fontWeight: "600", color: colors.surface }}>Download PDF Report</Text>
         </TouchableOpacity>
      </View>
    </View>
  );
}
