import { formatINR } from "@/src/utils/dashboardUi";
import { colors, gradients, spacing, typography } from "@/src/utils/theme";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Calendar,
  ChevronRight,
  Download,
  AlertTriangle,
  Clock,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react-native";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useAuthStore } from "@/src/store/authStore";
import { useDashboard } from "@/src/hooks/useDashboard";
import Loader from "@/src/components/feedback/Loader";

// Mock data to match design where API doesn't provide it yet
const TREND_DATA = [
  { month: "Aug", in: 100, out: 40 },
  { month: "Sep", in: 110, out: 55 },
  { month: "Oct", in: 105, out: 65 },
  { month: "Nov", in: 120, out: 40 },
  { month: "Dec", in: 95, out: 60 },
  { month: "Jan", in: 124, out: 54 },
];

const TOP_CUSTOMERS = [
  { id: 1, initials: "MS", name: "Mohit Sharma", amount: 45200 },
  { id: 2, initials: "AT", name: "Anil Traders", amount: 32150 },
  { id: 3, initials: "KS", name: "Karan Store", amount: 18900 },
];

const TOP_SUPPLIERS = [
  { id: 1, initials: "MD", name: "Metro Distributors", amount: 22000 },
  { id: 2, initials: "PF", name: "Patel Foods", amount: 15400 },
  { id: 3, initials: "RS", name: "Ravi Supplies", amount: 12800 },
];

export default function NetPositionScreen() {
  const router = useRouter();
  const { profile } = useAuthStore();
  const { data, isLoading } = useDashboard(profile?.id);

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
        <TouchableOpacity className="p-1">
          <Calendar size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        {/* Net Position Gradient Hero */}
        <LinearGradient
          colors={[gradients.netPosition, gradients.netPosition]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="rounded-[24px] p-6 mb-6"
        >
          <Text style={{ fontSize: 12, fontWeight: "600", color: "rgba(255,255,255,0.7)", letterSpacing: 1, marginBottom: 8 }}>
            YOUR NET POSITION
          </Text>
          <Text style={{ fontSize: 44, fontWeight: "800", color: colors.surface, marginBottom: 8 }}>
            {formatINR(data.netPosition)}
          </Text>
          <View className="flex-row items-center gap-2">
            <ArrowUpRight size={14} color="#A7F3D0" />
            <Text style={{ fontSize: 14, color: "#A7F3D0", fontWeight: "500" }}>
              Cash surplus available
            </Text>
          </View>
        </LinearGradient>

        {/* Breakdown Card */}
        <View className="bg-surface rounded-[20px] p-5 mb-6 border border-borderLight shadow-sm">
          <Text style={{ fontSize: 11, fontWeight: "700", color: colors.textMuted, letterSpacing: 1, marginBottom: 16 }}>
            BREAKDOWN
          </Text>

          <View className="flex-row justify-between mb-4">
            <Text style={{ fontSize: 15, color: colors.textSecondary, fontWeight: "500" }}>Total Receivables</Text>
            <Text style={{ fontSize: 15, color: colors.primary, fontWeight: "700" }}>+{formatINR(data.customersOweMe)}</Text>
          </View>
          <View className="flex-row justify-between mb-4 pb-4 border-b border-borderLight">
            <Text style={{ fontSize: 15, color: colors.textSecondary, fontWeight: "500" }}>Total Payables</Text>
            <Text style={{ fontSize: 15, color: colors.danger, fontWeight: "700" }}>-{formatINR(data.iOweSuppliers)}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text style={{ fontSize: 16, color: colors.textPrimary, fontWeight: "700" }}>Net Balance</Text>
            <Text style={{ fontSize: 18, color: colors.textPrimary, fontWeight: "800" }}>{formatINR(data.netPosition)}</Text>
          </View>
        </View>

        {/* Trend Mock */}
        <Text style={{ fontSize: 11, fontWeight: "700", color: colors.textMuted, letterSpacing: 1, marginBottom: 12 }}>
          CASH FLOW TREND (LAST 6 MONTHS)
        </Text>
        <View className="bg-surface rounded-[20px] p-5 mb-6 border border-borderLight shadow-sm">
           <View className="flex-row justify-between h-40 items-end mb-4">
             {TREND_DATA.map((t, i) => (
                <View key={i} className="items-center w-10">
                  <View className="w-full bg-background rounded-sm overflow-hidden" style={{ height: "100%" }}>
                     <View style={{ height: `${(t.in / 150) * 100}%`, backgroundColor: colors.primary, position: 'absolute', bottom: `${(t.out / 150) * 100}%`, width: '100%' }} />
                     <View style={{ height: `${(t.out / 150) * 100}%`, backgroundColor: colors.danger, position: 'absolute', bottom: 0, width: '100%', borderTopWidth: 1, borderColor: colors.surface }} />
                  </View>
                  <Text style={{ fontSize: 10, marginTop: 8, color: colors.textSecondary }}>{t.month}</Text>
                </View>
             ))}
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
          {TOP_CUSTOMERS.map((c, i) => (
            <View key={c.id} className={`flex-row items-center justify-between p-4 ${i !== TOP_CUSTOMERS.length - 1 ? 'border-b border-borderLight' : ''}`}>
               <View className="flex-row items-center gap-3">
                 <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: colors.avatarPalette[i % colors.avatarPalette.length] + '22' }}>
                   <Text style={{ color: colors.avatarPalette[i % colors.avatarPalette.length], fontWeight: "700", fontSize: 14 }}>{c.initials}</Text>
                 </View>
                 <Text style={{ fontSize: 15, fontWeight: "600", color: colors.textPrimary }}>{c.name}</Text>
               </View>
               <Text style={{ fontSize: 15, fontWeight: "700", color: colors.primary }}>{formatINR(c.amount)}</Text>
            </View>
          ))}
        </View>

        {/* Top Suppliers Owed */}
        <Text style={{ fontSize: 11, fontWeight: "700", color: colors.textMuted, letterSpacing: 1, marginBottom: 12 }}>
          TOP SUPPLIERS OWED
        </Text>
        <View className="bg-surface rounded-[20px] mb-6 border border-borderLight shadow-sm overflow-hidden">
          {TOP_SUPPLIERS.map((s, i) => (
            <View key={s.id} className={`flex-row items-center justify-between p-4 ${i !== TOP_SUPPLIERS.length - 1 ? 'border-b border-borderLight' : ''}`}>
               <View className="flex-row items-center gap-3">
                 <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: colors.supplierAvatarBg[i % colors.supplierAvatarBg.length] }}>
                   <Text style={{ color: colors.supplierAvatarText[i % colors.supplierAvatarText.length], fontWeight: "700", fontSize: 14 }}>{s.initials}</Text>
                 </View>
                 <Text style={{ fontSize: 15, fontWeight: "600", color: colors.textPrimary }}>{s.name}</Text>
               </View>
               <Text style={{ fontSize: 15, fontWeight: "700", color: colors.danger }}>{formatINR(s.amount)}</Text>
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
            <Text style={{ fontSize: 13, fontWeight: "600", color: colors.danger }}>High collection risk: {data.overdueCustomers} customers</Text>
          </View>
          <View className="flex-row items-center gap-2" style={{ backgroundColor: colors.warningBg, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: colors.warningBadgeBg }}>
            <Clock size={16} color={colors.warning} />
            <Text style={{ fontSize: 13, fontWeight: "600", color: colors.warning }}>Upcoming payables: {formatINR(data.iOweSuppliers / 2)} this week</Text>
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
