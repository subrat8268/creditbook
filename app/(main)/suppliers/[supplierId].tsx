import EmptyState from "@/src/components/feedback/EmptyState";
import Loader from "@/src/components/feedback/Loader";
import RecordDeliveryModal from "@/src/components/suppliers/RecordDeliveryModal";
import RecordPaymentMadeModal from "@/src/components/suppliers/RecordPaymentMadeModal";
import {
    useRecordDelivery,
    useRecordPaymentMade,
    useSupplierDetail,
} from "@/src/hooks/useSuppliers";
import { useAuthStore } from "@/src/store/authStore";
import { SupplierTimelineEntry } from "@/src/types/supplier";
import { formatRelativeActivity } from "@/src/utils/helper";
import { colors } from "@/src/utils/theme";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
    ArrowLeft,
    ArrowUpRight,
    Building2,
    Calendar,
    CirclePlus,
    Copy,
    Package,
    Pencil,
    Phone,
    Truck,
} from "lucide-react-native";
import { useState } from "react";
import {
    Alert,
    FlatList,
    Linking,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatINR(n: number) {
  return (
    "₹" +
    n.toLocaleString("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
  );
}

function formatDate(iso?: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getDateLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round(
    (today.getTime() - target.getTime()) / 86_400_000,
  );
  if (diffDays === 0) return "TODAY";
  if (diffDays === 1) return "YESTERDAY";
  return d
    .toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
    .toUpperCase();
}

function maskAccount(n?: string): string {
  if (!n) return "";
  if (n.length <= 4) return n;
  return `****${n.slice(-4)}`;
}

// ─── Gradient hero colours ────────────────────────────────────────────────────
const HERO_GRADIENT: [string, string] = ["#BE2D5C", "#E8427D"];

// ─── Timeline row ─────────────────────────────────────────────────────────────
function TimelineRow({ entry }: { entry: SupplierTimelineEntry }) {
  const isDelivery = entry.type === "delivery";
  const borderColor = isDelivery
    ? colors.warning.DEFAULT
    : colors.success.DEFAULT;
  const iconBg = isDelivery ? colors.warning.light : colors.success.bg;
  const iconColor = isDelivery
    ? colors.warning.DEFAULT
    : colors.success.DEFAULT;
  const amountColor = isDelivery
    ? colors.danger.DEFAULT
    : colors.success.DEFAULT;

  const d = entry.delivery;
  const itemCount = d?.items?.length ?? 0;
  const loadingCharge = Number(d?.loading_charge ?? 0);
  const amount = isDelivery
    ? Number(d?.total_amount ?? 0)
    : (entry.paymentAmount ?? 0);

  const title = isDelivery
    ? `Delivery #D-${String(entry.deliveryNumber ?? 0).padStart(3, "0")}`
    : "Payment Made";

  const subtitle = isDelivery
    ? [
        itemCount > 0 ? `${itemCount} item${itemCount !== 1 ? "s" : ""}` : null,
        loadingCharge > 0
          ? `₹${loadingCharge.toLocaleString("en-IN")} loading`
          : null,
      ]
        .filter(Boolean)
        .join(" · ")
    : [entry.paymentMode, entry.paymentNotes].filter(Boolean).join(" · ");

  const amountText = isDelivery ? formatINR(amount) : `−${formatINR(amount)}`;

  return (
    <View
      className="bg-white rounded-[14px] px-3.5 py-3.5 mb-[10px] border-l-4"
      style={{
        borderLeftColor: borderColor,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
      }}
    >
      <View className="flex-row items-center">
        {/* Icon */}
        <View
          className="w-[38px] h-[38px] rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: iconBg }}
        >
          {isDelivery ? (
            <Package size={18} color={iconColor} strokeWidth={2} />
          ) : (
            <CirclePlus size={18} color={iconColor} strokeWidth={2} />
          )}
        </View>

        {/* Text */}
        <View className="flex-1">
          <Text className="text-sm font-bold text-textDark">{title}</Text>
          {subtitle ? (
            <Text className="text-xs text-textMuted mt-px">{subtitle}</Text>
          ) : null}
        </View>

        {/* Amount + Running balance */}
        <View className="items-end">
          <Text
            className="text-[15px] font-bold"
            style={{ color: amountColor }}
          >
            {amountText}
          </Text>
          <Text
            className="text-xs mt-[2px]"
            style={{ color: colors.neutral[500] }}
          >
            Bal: {formatINR(entry.runningBalance)}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SupplierDetailScreen() {
  const { supplierId } = useLocalSearchParams<{ supplierId: string }>();
  const profile = useAuthStore((s) => s.profile);
  const router = useRouter();

  const { data: supplier, isLoading, isError } = useSupplierDetail(supplierId);
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const recordDelivery = useRecordDelivery(profile?.id ?? "", supplierId ?? "");
  const recordPayment = useRecordPaymentMade(
    profile?.id ?? "",
    supplierId ?? "",
  );

  if (isLoading) return <Loader />;
  if (isError || !supplier) return <EmptyState message="Supplier not found" />;

  const timeline = supplier.timeline ?? [];

  // ── Group by date label ───────────────────────────────────────────────────
  const grouped: { label: string; data: SupplierTimelineEntry[] }[] = [];
  for (const entry of timeline) {
    const label = getDateLabel(entry.date);
    const last = grouped[grouped.length - 1];
    if (last && last.label === label) {
      last.data.push(entry);
    } else {
      grouped.push({ label, data: [entry] });
    }
  }
  const flatItems: (SupplierTimelineEntry | { _sectionHeader: string })[] =
    grouped.flatMap((g) => [{ _sectionHeader: g.label }, ...g.data]);

  // ── Header component (above timeline) ────────────────────────────────────
  const renderHeader = () => (
    <View>
      {/* Hero gradient card */}
      <LinearGradient
        colors={HERO_GRADIENT}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="rounded-2xl px-5 py-5 mb-4"
      >
        <Text
          className="text-xs font-bold tracking-widest mb-2"
          style={{ color: "rgba(255,255,255,0.75)" }}
        >
          I OWE THIS SUPPLIER
        </Text>
        <Text
          className="font-bold mb-3"
          style={{ fontSize: 42, color: "#FFFFFF", lineHeight: 46 }}
        >
          {formatINR(supplier.totalOwed)}
        </Text>
        {supplier.lastDeliveryAt && (
          <View className="flex-row items-center gap-[6px]">
            <Calendar
              size={13}
              color="rgba(255,255,255,0.75)"
              strokeWidth={2}
            />
            <Text
              className="text-xs"
              style={{ color: "rgba(255,255,255,0.8)" }}
            >
              Last delivery: {formatDate(supplier.lastDeliveryAt)}
            </Text>
          </View>
        )}
      </LinearGradient>

      {/* Bank details card */}
      {supplier.bank_name ? (
        <View
          className="bg-white rounded-2xl px-4 py-4 mb-4 border"
          style={{ borderColor: colors.neutral[200] }}
        >
          <View className="flex-row items-center justify-between mb-3">
            <Text
              className="text-[15px] font-bold"
              style={{ color: colors.neutral[900] }}
            >
              Bank Details
            </Text>
            {supplier.upi ? (
              <TouchableOpacity
                onPress={() => {
                  Alert.alert("UPI ID Copied", supplier.upi ?? "");
                }}
                className="flex-row items-center gap-1"
              >
                <Copy
                  size={13}
                  color={colors.primary.DEFAULT}
                  strokeWidth={2.5}
                />
                <Text
                  className="text-[13px] font-bold"
                  style={{ color: colors.primary.DEFAULT }}
                >
                  Copy UPI
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Bank icon + name row */}
          <View className="flex-row items-center gap-3 mb-2">
            <View
              className="w-9 h-9 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.info.bg }}
            >
              <Building2
                size={18}
                color={colors.info.DEFAULT}
                strokeWidth={1.8}
              />
            </View>
            <View>
              <Text
                className="text-[14px] font-semibold"
                style={{ color: colors.neutral[900] }}
              >
                {supplier.bank_name}
                {supplier.account_number
                  ? ` — ${maskAccount(supplier.account_number)}`
                  : ""}
              </Text>
              {supplier.ifsc_code ? (
                <Text
                  className="text-xs mt-px"
                  style={{ color: colors.neutral[500] }}
                >
                  IFSC: {supplier.ifsc_code}
                </Text>
              ) : null}
              {supplier.upi ? (
                <Text
                  className="text-xs mt-px"
                  style={{ color: colors.neutral[500] }}
                >
                  UPI: {supplier.upi}
                </Text>
              ) : null}
            </View>
          </View>
        </View>
      ) : null}

      {/* Action strip */}
      <View className="flex-row gap-3 mb-5">
        <TouchableOpacity
          onPress={() => setDeliveryModalOpen(true)}
          activeOpacity={0.8}
          className="flex-1 bg-white rounded-2xl py-4 items-center gap-2 border"
          style={{ borderColor: colors.neutral[200] }}
        >
          <View
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: colors.warning.light }}
          >
            <Truck size={20} color={colors.warning.DEFAULT} strokeWidth={2} />
          </View>
          <Text
            className="text-[13px] font-bold"
            style={{ color: colors.neutral[700] }}
          >
            Record Delivery
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setPaymentModalOpen(true)}
          activeOpacity={0.8}
          className="flex-1 bg-white rounded-2xl py-4 items-center gap-2 border"
          style={{ borderColor: colors.neutral[200] }}
        >
          <View
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: colors.success.bg }}
          >
            <ArrowUpRight
              size={20}
              color={colors.success.DEFAULT}
              strokeWidth={2}
            />
          </View>
          <Text
            className="text-[13px] font-bold"
            style={{ color: colors.neutral[700] }}
          >
            Pay Supplier
          </Text>
        </TouchableOpacity>
      </View>

      {/* Section heading */}
      {timeline.length > 0 && (
        <Text
          className="text-[17px] font-bold mb-3"
          style={{ color: colors.neutral[900] }}
        >
          Delivery History
        </Text>
      )}
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView
        edges={["top", "left", "right"]}
        className="flex-1"
        style={{ backgroundColor: colors.neutral.bg }}
      >
        {/* ── Custom header ── */}
        <View
          className="flex-row items-center px-4 py-3 bg-white border-b"
          style={{ borderBottomColor: colors.neutral[200] }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-1 mr-2"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <ArrowLeft size={22} color={colors.neutral[900]} strokeWidth={2} />
          </TouchableOpacity>

          <View className="flex-1">
            <Text
              className="font-bold text-[17px]"
              style={{ color: colors.neutral[900] }}
              numberOfLines={1}
            >
              {supplier.name}
            </Text>
            <Text
              className="text-xs mt-px"
              style={{ color: colors.neutral[500] }}
            >
              Last delivery: {formatRelativeActivity(supplier.lastDeliveryAt)}
            </Text>
          </View>

          <View className="flex-row items-center gap-3">
            {supplier.phone ? (
              <TouchableOpacity
                onPress={() => Linking.openURL(`tel:${supplier.phone}`)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Phone
                  size={20}
                  color={colors.primary.DEFAULT}
                  strokeWidth={2}
                />
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Pencil size={18} color={colors.neutral[500]} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Timeline list ── */}
        <FlatList
          data={flatItems}
          keyExtractor={(item, idx) =>
            "_sectionHeader" in item
              ? `hdr-${item._sectionHeader}-${idx}`
              : item.id
          }
          ListHeaderComponent={renderHeader}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 100,
          }}
          ListEmptyComponent={
            <EmptyState message="No deliveries recorded yet" />
          }
          renderItem={({ item }) => {
            if ("_sectionHeader" in item) {
              return (
                <Text
                  className="text-xs font-bold tracking-wider mb-2 mt-1"
                  style={{ color: colors.neutral[500] }}
                >
                  {item._sectionHeader}
                </Text>
              );
            }
            return <TimelineRow entry={item} />;
          }}
        />

        {/* Record Delivery Modal */}
        <RecordDeliveryModal
          visible={deliveryModalOpen}
          onClose={() => setDeliveryModalOpen(false)}
          loading={recordDelivery.isPending}
          supplierName={supplier.name}
          onSubmit={async (data) => {
            await recordDelivery.mutateAsync(data);
            setDeliveryModalOpen(false);
            Alert.alert("Success", "Delivery recorded successfully.");
          }}
        />

        {/* Record Payment Made Modal */}
        <RecordPaymentMadeModal
          visible={paymentModalOpen}
          balanceOwed={supplier.totalOwed}
          onClose={() => setPaymentModalOpen(false)}
          loading={recordPayment.isPending}
          onSubmit={async (data) => {
            await recordPayment.mutateAsync(data);
            setPaymentModalOpen(false);
            Alert.alert("Success", "Payment recorded successfully.");
          }}
        />
      </SafeAreaView>
    </>
  );
}
