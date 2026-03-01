import { create } from "zustand";
import { Supplier } from "../types/supplier";

interface SuppliersState {
  suppliers: Supplier[];
  setSuppliers: (suppliers: Supplier[]) => void;
  addSupplier: (supplier: Supplier) => void;
}

export const useSuppliersStore = create<SuppliersState>((set) => ({
  suppliers: [],
  setSuppliers: (suppliers) => set({ suppliers }),
  addSupplier: (supplier) =>
    set((state) => ({ suppliers: [supplier, ...state.suppliers] })),
}));
