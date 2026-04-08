import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getDashboardData, getNetPositionReport } from "../api/dashboard";
import { syncOverdueReminders } from "../lib/notifications";
import { usePreferencesStore } from "../store/preferencesStore";

export function useDashboard(vendorId?: string) {
  const queryClient = useQueryClient();
  const remindersEnabled = usePreferencesStore(
    (s) => s.overdueRemindersEnabled,
  );
  const reminderHour = usePreferencesStore((s) => s.overdueReminderHour);
  const reminderMinute = usePreferencesStore((s) => s.overdueReminderMinute);

  const query = useQuery({
    queryKey: ["dashboard", vendorId],
    queryFn: async () => {
      if (!vendorId) return null;
      return await getDashboardData(vendorId);
    },
    enabled: !!vendorId,
    staleTime: 30_000,
  });

  const refreshDashboard = () => {
    if (vendorId)
      queryClient.invalidateQueries({ queryKey: ["dashboard", vendorId] });
  };

  useEffect(() => {
    if (!vendorId) return;
    const overdue = query.data?.overdueCustomersList ?? [];
    syncOverdueReminders(
      overdue.map((customer: any) => ({
        customerId: customer.id,
        customerName: customer.name,
        balance: customer.balance,
        daysSince: customer.daysSince,
      })),
      {
        enabled: remindersEnabled,
        hour: reminderHour,
        minute: reminderMinute,
      },
    );
  }, [
    vendorId,
    remindersEnabled,
    reminderHour,
    reminderMinute,
    query.data?.overdueCustomersList,
  ]);

  return {
    ...query,
    totalReceivables: query.data?.outstandingAmount ?? 0,
    netPosition: query.data?.netPosition ?? 0,
    toReceive: query.data?.customersOweMe ?? 0,
    toGive: query.data?.iOweSuppliers ?? 0,
    weekDelta: query.data?.weekDelta ?? 0,
    weekDeltaPct: query.data?.weekDeltaPct ?? 0,
    activeBuyers: query.data?.activeBuyers ?? 0,
    activeSuppliers: query.data?.activeSuppliers ?? 0,
    overduePayments: query.data?.overduePayments ?? 0,
    overdueSuppliers: query.data?.overdueSuppliersList ?? [],
    overdueCustomers: query.data?.overdueCustomersList?.slice(0, 3) ?? [],
    overdueCustomersAll: query.data?.overdueCustomersList ?? [],
    overdueTotalCount: query.data?.overdueCustomers ?? 0,
    recentActivity: query.data?.recentActivity ?? [],
    refreshDashboard,
  };
}

export function useNetPositionReport(vendorId?: string, rangeDays = 30) {
  return useQuery({
    queryKey: ["netPositionReport", vendorId, rangeDays],
    queryFn: async () => {
      if (!vendorId) return null;
      return getNetPositionReport(vendorId, rangeDays);
    },
    enabled: !!vendorId,
    staleTime: 60_000,
  });
}
