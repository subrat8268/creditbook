import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getDashboardData, getNetPositionReport } from "../api/dashboard";

// Hook to fetch dashboard data for a vendor
export function useDashboard(vendorId?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["dashboard", vendorId],
    queryFn: async () => {
      if (!vendorId) return null;
      const data = await getDashboardData(vendorId);
      return data;
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
