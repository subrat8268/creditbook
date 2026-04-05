import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getDashboardData, getNetPositionReport } from "../api/dashboard";

export function useDashboard(vendorId?: string) {
  const queryClient = useQueryClient();

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

  return {
    ...query,
    totalReceivables: query.data?.outstandingAmount ?? 0,
    overdueCustomers: query.data?.overdueCustomersList.slice(0, 3) ?? [],
    recentActivity: query.data?.recentActivity ?? [],
    refreshDashboard,
  };
}

export function useNetPositionReport(vendorId?: string) {
  return useQuery({
    queryKey: ["netPositionReport", vendorId],
    queryFn: async () => {
      if (!vendorId) return null;
      return getNetPositionReport(vendorId);
    },
    enabled: !!vendorId,
    staleTime: 60_000,
  });
}
