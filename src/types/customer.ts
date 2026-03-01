export interface Customer {
  id: string;
  name: string;
  phone: string;
  vendor_id: string;
  address?: string;
  created_at: string;
  isOverdue?: boolean;
}

export interface CustomerDetail {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  outstandingBalance: number;
  isOverdue: boolean;
  daysSinceLastOrder: number;
  orders: {
    id: string;
    created_at: string;
    amount: number;
    status: "Paid" | "Pending" | "Partially Paid";
  }[];
}
