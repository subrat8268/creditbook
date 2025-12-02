import { create } from "zustand";

interface OrderState {
  updatingOrderIds: string[];
  addUpdatingOrderId: (id: string) => void;
  removeUpdatingOrderId: (id: string) => void;
  resetUpdatingOrderIds: () => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  updatingOrderIds: [],

  addUpdatingOrderId: (id: string) =>
    set((state) => ({
      updatingOrderIds: [...state.updatingOrderIds, id],
    })),

  removeUpdatingOrderId: (id: string) =>
    set((state) => ({
      updatingOrderIds: state.updatingOrderIds.filter((i) => i !== id),
    })),

  resetUpdatingOrderIds: () => set({ updatingOrderIds: [] }),
}));
