import { create } from "zustand";
import { Customer } from "../types/customer";

type CustomersState = {
  customers: Customer[];
  setCustomers: (customers: Customer[]) => void;
  addCustomer: (customer: Customer) => void;
  resetCustomers: () => void;
};

export const useCustomersStore = create<CustomersState>((set) => ({
  customers: [],
  setCustomers: (customers) => set({ customers }),
  addCustomer: (customer) =>
    set((state) => ({ customers: [customer, ...state.customers] })),
  resetCustomers: () => set({ customers: [] }),
}));
