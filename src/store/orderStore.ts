import { create } from "zustand";

export interface DraftOrderItem {
  id: string; // frontend-only unique identifier
  product_id: string | null;
  product_name: string;
  variant_id?: string | null;
  variant_name?: string | null;
  price: number;
  quantity: number;
}

interface OrderState {
  // Existing state for ongoing updates
  updatingOrderIds: string[];
  addUpdatingOrderId: (id: string) => void;
  removeUpdatingOrderId: (id: string) => void;
  resetUpdatingOrderIds: () => void;

  // ── Draft Bill Engine State ──
  selectedCustomerId: string | null;
  items: DraftOrderItem[];
  gstPercent: number;
  loadingCharge: number;

  // Actions
  setCustomer: (id: string | null) => void;
  addItem: (item: Omit<DraftOrderItem, "id">) => void;
  setItems: (items: DraftOrderItem[]) => void;
  updateItemQuantity: (id: string, quantity: number) => void;
  updateItemRate: (id: string, rate: number) => void;
  removeItem: (id: string) => void;
  setGst: (percent: number) => void;
  setLoadingCharge: (charge: number) => void;
  clearOrder: () => void;

  // Computed Getters
  getSubtotal: () => number;
  getTaxAmount: () => number;
  getGrandTotal: () => number;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  // Existing implementation
  updatingOrderIds: [],
  addUpdatingOrderId: (id: string) =>
    set((state) => ({ updatingOrderIds: [...state.updatingOrderIds, id] })),
  removeUpdatingOrderId: (id: string) =>
    set((state) => ({
      updatingOrderIds: state.updatingOrderIds.filter((i) => i !== id),
    })),
  resetUpdatingOrderIds: () => set({ updatingOrderIds: [] }),

  // ── Draft Bill Initial State ──
  selectedCustomerId: null,
  items: [],
  gstPercent: 0,
  loadingCharge: 0,

  // Actions
  setCustomer: (id) => set({ selectedCustomerId: id }),
  
  addItem: (item) =>
    set((state) => ({
      items: [
        ...state.items,
        { ...item, id: Math.random().toString(36).substring(2, 9) },
      ],
    })),

  setItems: (items) => set({ items }),

  updateItemQuantity: (id, quantity) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
      ),
    })),

  updateItemRate: (id, price) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, price: Math.max(0, price) } : item
      ),
    })),

  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),

  setGst: (percent) => set({ gstPercent: Math.max(0, percent) }),
  
  setLoadingCharge: (charge) => set({ loadingCharge: Math.max(0, charge) }),

  clearOrder: () =>
    set({
      selectedCustomerId: null,
      items: [],
      gstPercent: 0,
      loadingCharge: 0,
    }),

  // ── Computed Getters ──
  getSubtotal: () => {
    return get().items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  },

  getTaxAmount: () => {
    const subtotal = get().getSubtotal();
    return (subtotal * get().gstPercent) / 100;
  },

  getGrandTotal: () => {
    const subtotal = get().getSubtotal();
    const tax = (subtotal * get().gstPercent) / 100;
    return subtotal + tax + get().loadingCharge;
  },
}));
