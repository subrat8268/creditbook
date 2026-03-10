import { secureStorage } from "@/src/lib/secureStorage";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: secureStorage, // JWT persisted in the OS secure enclave / Keychain
    autoRefreshToken: true, // silently refresh before expiry
    persistSession: true, // survive Metro hot-reloads
    detectSessionInUrl: false, // not a web browser
  },
});
