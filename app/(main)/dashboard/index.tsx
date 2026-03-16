import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, StatusBar, View } from "react-native";
import NewCustomerModal from "@/src/components/customers/NewCustomerModal";
import DashboardActionBar from "@/src/components/dashboard/DashboardActionBar";
import DashboardHeader from "@/src/components/dashboard/DashboardHeader";
import DashboardHeroCard from "@/src/components/dashboard/DashboardHeroCard";
import DashboardRecentActivity from "@/src/components/dashboard/DashboardRecentActivity";
import DashboardStatCards from "@/src/components/dashboard/DashboardStatCards";
import EmptyState from "@/src/components/feedback/EmptyState";
import Loader from "@/src/components/feedback/Loader";
import { useAddCustomer } from "@/src/hooks/useCustomer";
import { useDashboard } from "@/src/hooks/useDashboard";
import { useAuthStore } from "@/src/store/authStore";

// ─────────────── Main Screen ────────────
export default function DashboardScreen() {
  const { profile } = useAuthStore();
  const router = useRouter();
  const { data, isLoading, isError } = useDashboard(profile?.id);

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const addCustomerMutation = useAddCustomer(profile?.id ?? "");

  const handleAddCustomer = async (values: {
    name: string;
    phone: string;
    address?: string;
    openingBalance?: number;
  }) => {
    try {
      await addCustomerMutation.mutateAsync(values);
      setIsCustomerModalOpen(false);
    } catch (err: any) {
      console.error("Failed to add customer:", err);
    }
  };

  if (!profile || isLoading) return <Loader />;
  if (isError || !data)
    return <EmptyState message="Failed to load dashboard data" />;

  const mode = profile.dashboard_mode ?? "seller";
  const isBothMode = mode === "both";
  const isSellerMode = mode === "seller";
  const isDistributor = mode === "distributor";

  const heroAmount = isSellerMode ? data.customersOweMe : data.iOweSuppliers;
  // Label is written as the customer reads it, not in abstract financial terms
  const heroLabel = isSellerMode ? "CUSTOMERS OWE YOU" : "YOU OWE SUPPLIERS";

  const businessName = profile.business_name ?? profile.name ?? "My Business";
  const roleLabel =
    mode === "distributor"
      ? "CreditBook Distributor"
      : mode === "both"
        ? "CreditBook Business"
        : "CreditBook Seller";

  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle="dark-content" backgroundColor="#F6F7F9" />

      <DashboardHeader
        variant={isBothMode ? "both" : "default"}
        overdueCount={data.overdueCustomers}
        onPressSettings={() => router.push("/(main)/profile")}
      />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {isBothMode ? (
          <>
            <DashboardHeroCard
              variant="seller"
              label="CUSTOMERS OWE ME"
              amount={data.customersOweMe}
              onPrimaryAction={() => router.push("/(main)/reports" as any)}
              onSecondaryAction={() => {
                // TODO(v3.6): WhatsApp bulk reminder
              }}
            />
            <DashboardHeroCard
              variant="distributor"
              label="I OWE SUPPLIERS"
              amount={data.iOweSuppliers}
              subInfo={`${data.activeSuppliers} active supplier${data.activeSuppliers !== 1 ? "s" : ""}`}
              onPrimaryAction={() => router.push("/(main)/reports" as any)}
              onSecondaryAction={() => {
                // TODO(Phase 7): Record Delivery sheet
              }}
            />
            <DashboardHeroCard
              variant="net"
              label="NET POSITION"
              amount={data.netPosition}
            />
          </>
        ) : (
          <DashboardHeroCard
            variant={isDistributor ? "distributor" : "seller"}
            label={heroLabel}
            amount={heroAmount}
            subInfo={
              isDistributor
                ? `${data.activeSuppliers} active supplier${data.activeSuppliers !== 1 ? "s" : ""}`
                : undefined
            }
            onPrimaryAction={() => router.push("/(main)/reports" as any)}
            onSecondaryAction={() => {
              // TODO(v3.6): distributor → RecordDeliverySheet; seller → WhatsApp bulk reminder
            }}
          />
        )}

        {/* ActionBar only shown in "both" mode — seller/distributor use embedded buttons */}
        {isBothMode && (
          <DashboardActionBar
            onViewReport={() => router.push("/(main)/reports" as any)}
          />
        )}

        <DashboardStatCards
          mode={isBothMode ? "both" : isDistributor ? "distributor" : "seller"}
          primaryCount={
            isDistributor ? data.activeSuppliers : data.activeBuyers
          }
          overdueCount={
            isDistributor ? data.overduePayments : data.overdueCustomers
          }
          activeSuppliers={data.activeSuppliers}
          overdueSuppliers={data.overduePayments}
        />

        <DashboardRecentActivity
          items={data.recentActivity}
          onViewAll={() =>
            router.push(
              isDistributor
                ? ("/(main)/suppliers" as any)
                : ("/(main)/orders" as any),
            )
          }
        />
      </ScrollView>

      <Pressable
        className="absolute items-center justify-center bg-primary rounded-full"
        style={{
          bottom: 96,
          right: 24,
          width: 58,
          height: 58,
          shadowColor: "#22C55E",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.4,
          shadowRadius: 12,
          elevation: 8,
        }}
        onPress={() => router.push("/(main)/orders/create" as any)}
      >
        <Plus size={26} color="#FFFFFF" strokeWidth={2.5} />
      </Pressable>

      <NewCustomerModal
        visible={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSubmit={handleAddCustomer}
        loading={addCustomerMutation.isPending}
        errorMessage={addCustomerMutation.error?.message}
      />
    </View>
  );
}
