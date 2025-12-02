import { create } from "zustand";
import { DashboardData } from "../api/dashboard";

interface DashboardState extends DashboardData {
  setDashboardData: (data: DashboardData) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  totalRevenue: 0,
  outstandingAmount: 0,
  unpaidOrders: 0,
  partialOrders: 0,
  setDashboardData: (data) => set(data),
}));
