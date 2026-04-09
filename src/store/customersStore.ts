import { create } from "zustand";
import { Person } from "../types/customer";

type CustomersState = {
  customers: Person[];
  setCustomers: (customers: Person[]) => void;
  addCustomer: (customer: Person) => void;
  resetCustomers: () => void;
};

export const useCustomersStore = create<CustomersState>((set) => ({
  customers: [],
  setCustomers: (customers) => set({ customers }),
  addCustomer: (customer) =>
    set((state) => ({ customers: [customer, ...state.customers] })),
  resetCustomers: () => set({ customers: [] }),
}));
