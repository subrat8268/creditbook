import { User as SupabaseUser } from "@supabase/supabase-js";

export type User = SupabaseUser;

export interface Profile {
  id: string;
  user_id: string;
  name: string | null;
  phone: string | null;
  role: string | null;
  created_at: string;

  //Business details
  business_name?: string | null;
  business_address?: string | null;
  gstin?: string | null;
  upi_id?: string | null;

  // Bank details (mandatory for Indian billing)
  bank_name?: string | null;
  account_number?: string | null;
  ifsc_code?: string | null;

  // Bill settings
  bill_number_prefix?: string | null;

  // Dashboard mode: controls which financial view is shown
  dashboard_mode?: "seller" | "distributor" | "both" | null;

  // Onboarding: false until user completes the 3-step setup flow
  onboarding_complete?: boolean | null;

  //Images
  avatar_url?: string | null;
  business_logo_url?: string | null;

  // Subscription details
  subscription_plan: string | null;
  subscription_expiry: string | null;
  isSubscribed?: boolean;
  daysRemaining?: number;
}

export interface AuthState {
  user: User | null;
  session: any | null;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
}

export interface LoginValues {
  email: string;
  password: string;
}
