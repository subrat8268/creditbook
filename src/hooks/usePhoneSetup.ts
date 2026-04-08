import { useState } from "react";
import { supabase } from "../services/supabase";
import { useAuthStore } from "../store/authStore";
import { findLedgersByPhone, LedgerInfo } from "../utils/accessToken";

/**
 * Hook for phone setup functionality
 * - Validates phone number format
 * - Saves phone to profile
 * - Discovers existing ledgers by phone
 * - Auto-links ledgers after phone is saved
 */
export function usePhoneSetup() {
  const { user, profile, setProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [discoveredLedgers, setDiscoveredLedgers] = useState<LedgerInfo[]>([]);

  /**
   * Validates phone number format
   * Accepts formats: +919876543210, 9876543210, +91 9876543210
   */
  const validatePhone = (phone: string): { valid: boolean; error?: string } => {
    // Remove spaces and hyphens
    const cleaned = phone.replace(/[\s-]/g, "");

    // Must have at least 10 digits
    if (cleaned.length < 10) {
      return { valid: false, error: "Phone number must be at least 10 digits" };
    }

    // Check if starts with + (international format)
    if (cleaned.startsWith("+")) {
      // Must be +[country code][number] format, e.g., +919876543210
      const withoutPlus = cleaned.substring(1);
      if (!/^\d+$/.test(withoutPlus)) {
        return {
          valid: false,
          error: "Invalid phone format. Use +[country][number]",
        };
      }
      return { valid: true };
    }

    // Check if all digits (no country code)
    if (!/^\d+$/.test(cleaned)) {
      return {
        valid: false,
        error: "Phone number should contain only digits",
      };
    }

    return { valid: true };
  };

  /**
   * Normalizes phone number to international format
   * If no country code, defaults to +91 (India)
   */
  const normalizePhone = (phone: string): string => {
    const cleaned = phone.replace(/[\s-]/g, "");

    // Already has country code
    if (cleaned.startsWith("+")) {
      return cleaned;
    }

    // Add +91 for Indian numbers (10 digits)
    if (cleaned.length === 10) {
      return `+91${cleaned}`;
    }

    // If longer than 10 digits, assume country code is included
    // (e.g., 919876543210 -> +919876543210)
    return `+${cleaned}`;
  };

  /**
   * Saves phone number to profile and discovers existing ledgers
   */
  const savePhone = async (
    phone: string,
  ): Promise<{ success: boolean; ledgers?: LedgerInfo[] }> => {
    if (!user || !profile) {
      setError("User not authenticated");
      return { success: false };
    }

    setLoading(true);
    setError(null);
    setDiscoveredLedgers([]);

    try {
      // Validate phone
      const validation = validatePhone(phone);
      if (!validation.valid) {
        setError(validation.error || "Invalid phone number");
        return { success: false };
      }

      // Normalize phone to international format
      const normalizedPhone = normalizePhone(phone);

      // Save phone to profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ phone: normalizedPhone })
        .eq("user_id", user.id);

      if (updateError) {
        if (updateError.code === "23505") {
          // Unique constraint violation
          setError("This phone number is already registered");
        } else {
          setError(updateError.message);
        }
        return { success: false };
      }

      // Update local profile state
      setProfile({ ...profile, phone: normalizedPhone });

      // Discover existing ledgers with this phone number
      const ledgers = await findLedgersByPhone(normalizedPhone);
      setDiscoveredLedgers(ledgers);

      return { success: true, ledgers };
    } catch (err: any) {
      console.error("Failed to save phone:", err);
      setError(err.message || "Failed to save phone number");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    discoveredLedgers,
    validatePhone,
    normalizePhone,
    savePhone,
    setError,
  };
}
