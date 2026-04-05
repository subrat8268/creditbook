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
  Zap
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
  { id: 1, initials: "MS", name: "Mohit Sharma", amount: 45200, bg: "#FFEDD5", color: "#F97316" },
  { id: 2, initials: "AT", name: "Anil Traders", amount: 32150, bg: "#DBEAFE", color: "#3B82F6" },
  { id: 3, initials: "KS", name: "Karan Store", amount: 18900, bg: "#F3E8FF", color: "#A855F7" },
];

const TOP_SUPPLIERS = [
  { id: 1, initials: "MD", name: "Metro Distributors", amount: 22000, bg: "#FFEDD5", color: "#F97316" },
  { id: 2, initials: "PF", name: "Patel Foods", amount: 15400, bg: "#D1FAE5", color: "#10B981" },
  { id: 3, initials: "RS", name: "Ravi Supplies", amount: 12800, bg: "#DBEAFE", color: "#3B82F6" },
];

export default function NetPositionScreen() {
  const router = useRouter();
  const { profile } = useAuthStore();
  const { data, isLoading } = useDashboard(profile?.id);

  if (isLoading || !data) return <Loader />;

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View
        className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100"
        style={{ paddingTop: 50 }} // safe area roughly
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
          <Text style={{ fontSize: 44, fontWeight: "800", color: "#FFF", marginBottom: 8 }}>
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
        <View className="bg-white rounded-[20px] p-5 mb-6 border border-slate-100 shadow-sm">
          <Text style={{ fontSize: 11, fontWeight: "700", color: "#64748B", letterSpacing: 1, marginBottom: 16 }}>
            BREAKDOWN
          </Text>

          <View className="flex-row justify-between mb-4">
            <Text style={{ fontSize: 15, color: "#475569", fontWeight: "500" }}>Total Receivables</Text>
            <Text style={{ fontSize: 15, color: "#16A34A", fontWeight: "700" }}>+{formatINR(data.customersOweMe)}</Text>
          </View>
          <View className="flex-row justify-between mb-4 pb-4 border-b border-gray-100">
            <Text style={{ fontSize: 15, color: "#475569", fontWeight: "500" }}>Total Payables</Text>
            <Text style={{ fontSize: 15, color: "#DC2626", fontWeight: "700" }}>-{formatINR(data.iOweSuppliers)}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text style={{ fontSize: 16, color: "#1E293B", fontWeight: "700" }}>Net Balance</Text>
            <Text style={{ fontSize: 18, color: "#1E293B", fontWeight: "800" }}>{formatINR(data.netPosition)}</Text>
          </View>
        </View>

        {/* Trend Mock */}
        <Text style={{ fontSize: 11, fontWeight: "700", color: "#64748B", letterSpacing: 1, marginBottom: 12 }}>
          CASH FLOW TREND (LAST 6 MONTHS)
        </Text>
        <View className="bg-white rounded-[20px] p-5 mb-6 border border-slate-100 shadow-sm">
           <View className="flex-row justify-between h-40 items-end mb-4">
             {TREND_DATA.map((t, i) => (
                <View key={i} className="items-center w-10">
                  <View className="w-full bg-[#E2E8F0] rounded-sm overflow-hidden" style={{ height: "100%" }}>
                     <View style={{ height: `${(t.in / 150) * 100}%`, backgroundColor: "#4ADE80", position: 'absolute', bottom: `${(t.out / 150) * 100}%`, width: '100%' }} />
                     <View style={{ height: `${(t.out / 150) * 100}%`, backgroundColor: "#F87171", position: 'absolute', bottom: 0, width: '100%', borderTopWidth: 1, borderColor: '#fff' }} />
                  </View>
                  <Text style={{ fontSize: 10, marginTop: 8, color: "#94A3B8" }}>{t.month}</Text>
                </View>
             ))}
           </View>
           <View className="flex-row justify-center gap-6">
             <View className="flex-row items-center gap-2">
               <View className="w-2 h-2 rounded-full bg-[#4ADE80]" />
               <Text style={{ fontSize: 11, color: "#64748B" }}>Inflow</Text>
             </View>
             <View className="flex-row items-center gap-2">
               <View className="w-2 h-2 rounded-full bg-[#F87171]" />
               <Text style={{ fontSize: 11, color: "#64748B" }}>Outflow</Text>
             </View>
           </View>
        </View>

        {/* Top Customers Owed */}
        <Text style={{ fontSize: 11, fontWeight: "700", color: "#64748B", letterSpacing: 1, marginBottom: 12 }}>
          TOP CUSTOMERS OWED
        </Text>
        <View className="bg-white rounded-[20px] mb-6 border border-slate-100 shadow-sm overflow-hidden">
          {TOP_CUSTOMERS.map((c, i) => (
            <View key={c.id} className={`flex-row items-center justify-between p-4 ${i !== TOP_CUSTOMERS.length - 1 ? 'border-b border-gray-50' : ''}`}>
               <View className="flex-row items-center gap-3">
                 <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: c.bg }}>
                   <Text style={{ color: c.color, fontWeight: "700", fontSize: 14 }}>{c.initials}</Text>
                 </View>
                 <Text style={{ fontSize: 15, fontWeight: "600", color: "#1E293B" }}>{c.name}</Text>
               </View>
               <Text style={{ fontSize: 15, fontWeight: "700", color: "#16A34A" }}>{formatINR(c.amount)}</Text>
            </View>
          ))}
        </View>

        {/* Top Suppliers Owed */}
        <Text style={{ fontSize: 11, fontWeight: "700", color: "#64748B", letterSpacing: 1, marginBottom: 12 }}>
          TOP SUPPLIERS OWED
        </Text>
        <View className="bg-white rounded-[20px] mb-6 border border-slate-100 shadow-sm overflow-hidden">
          {TOP_SUPPLIERS.map((s, i) => (
            <View key={s.id} className={`flex-row items-center justify-between p-4 ${i !== TOP_SUPPLIERS.length - 1 ? 'border-b border-gray-50' : ''}`}>
               <View className="flex-row items-center gap-3">
                 <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: s.bg }}>
                   <Text style={{ color: s.color, fontWeight: "700", fontSize: 14 }}>{s.initials}</Text>
                 </View>
                 <Text style={{ fontSize: 15, fontWeight: "600", color: "#1E293B" }}>{s.name}</Text>
               </View>
               <Text style={{ fontSize: 15, fontWeight: "700", color: "#DC2626" }}>{formatINR(s.amount)}</Text>
            </View>
          ))}
        </View>

        {/* Quick Insights */}
        <Text style={{ fontSize: 11, fontWeight: "700", color: "#64748B", letterSpacing: 1, marginBottom: 12 }}>
          QUICK INSIGHTS
        </Text>
        <View className="gap-3 mb-6">
          <View className="flex-row items-center gap-2 bg-[#FEF2F2] p-3 rounded-xl border border-[#FEE2E2]">
            <AlertTriangle size={16} color="#DC2626" />
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#DC2626" }}>High collection risk: {data.overdueCustomers} customers</Text>
          </View>
          <View className="flex-row items-center gap-2 bg-[#FFFBEB] p-3 rounded-xl border border-[#FEF3C7]">
            <Clock size={16} color="#D97706" />
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#D97706" }}>Upcoming payables: {formatINR(data.iOweSuppliers / 2)} this week</Text>
          </View>
          <View className="flex-row items-center gap-2 bg-[#FFF7ED] p-3 rounded-xl border border-[#FFEDD5]">
            <Zap size={16} color="#EA580C" />
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#EA580C" }}>Cash flow optimized</Text>
          </View>
        </View>

      </ScrollView>

      {/* Floating Action Bar */}
      <View className="absolute bottom-5 left-5 right-5">
         <TouchableOpacity 
           className="flex-row justify-center items-center gap-2 py-4 rounded-2xl" 
           style={{ backgroundColor: "#0F172A" }}
         >
           <Download size={18} color="#FFF" />
           <Text style={{ fontSize: 15, fontWeight: "600", color: "#FFF" }}>Download PDF Report</Text>
         </TouchableOpacity>
      </View>
    </View>
  );
}
