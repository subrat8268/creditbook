export interface Customer {
  id: string;
  name: string;
  phone: string;
  vendor_id: string;
  address?: string;
  created_at: string;
  isOverdue?: boolean;
  outstandingBalance?: number;
}

export interface Transaction {
  id: string;
  type: "bill" | "payment";
  created_at: string;
  amount: number;
  runningBalance: number;
  // Bill fields
  billNumber?: string;
  status?: "Paid" | "Pending" | "Partially Paid";
  // Payment fields
  paymentMode?: string;
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
  lastActiveAt?: string | null;
  // oldest pending order id (for recording payments)
  pendingOrderId?: string | null;
  pendingOrderBalance?: number;
  orders: {
    id: string;
    created_at: string;
    amount: number;
    status: "Paid" | "Pending" | "Partially Paid";
  }[];
  transactions: Transaction[];
}
