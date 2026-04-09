export interface Supplier {
  id: string;
  vendor_id: string;
  name: string;
  phone?: string;
  address?: string;
  basket_mark?: string;
  bank_name?: string;
  account_number?: string;
  ifsc_code?: string;
  created_at: string;
  upi?: string; // UPI handle for Copy UPI (mapped from upi_id)
  balanceOwed?: number; // computed on fetch
  lastDeliveryAt?: string; // ISO date of most recent delivery, computed on fetch
}

export interface SupplierDeliveryItem {
  id?: string;
  delivery_id?: string;
  vendor_id?: string;
  item_name: string;
  quantity: number;
  rate: number;
  subtotal?: number;
}

export interface SupplierDelivery {
  id: string;
  vendor_id: string;
  supplier_id: string;
  delivery_date: string;
  loading_charge: number;
  advance_paid: number;
  total_amount: number;
  notes?: string;
  created_at: string;
  items?: SupplierDeliveryItem[];
}

export interface SupplierDetail extends Supplier {
  deliveries: SupplierDelivery[];
  timeline: SupplierTimelineEntry[];
  totalOwed: number;
}

export interface SupplierPaymentMade {
  id: string;
  amount: number;
  payment_mode: string;
  notes?: string;
  created_at: string;
}

export type SupplierEventType = "delivery" | "payment";

export interface SupplierTimelineEntry {
  id: string;
  type: SupplierEventType;
  date: string; // ISO string — delivery_date or created_at
  runningBalance: number; // balance owed AFTER this entry
  deliveryNumber?: number; // sequential delivery count (1-based, oldest first)
  // delivery-specific
  delivery?: SupplierDelivery;
  // payment-specific
  paymentAmount?: number;
  paymentMode?: string;
  paymentNotes?: string;
}
