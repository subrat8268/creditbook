import { useAuthStore } from "@/src/store/authStore";
import { usePreferencesStore } from "@/src/store/preferencesStore";

export interface FeatureFlagsResult {
  // Business type: what the user operates as
  businessType: "seller" | "distributor";

  // Supplier management: visible only for distributors
  canSeeSuppliers: boolean;

  // Quick items: optional toggle (default hidden), visible if enabled
  canSeeQuickItems: boolean;

  // CSV/PDF export: optional toggle (default visible)
  canExport: boolean;

  // Sync visibility: always visible (built in Phase 2)
  canSeeSyncStatus: boolean;
}

/**
 * Derive feature availability from auth profile + preferences
 *
 * Business logic:
 * - Sellers: Hide suppliers, products, wholesale
 * - Distributors: Show suppliers, can see wholesale
 * - Explicit toggles override defaults (featureFlags in preferencesStore)
 */
export function useFeatureFlags(): FeatureFlagsResult {
  const profile = useAuthStore((state) => state.profile);
  const businessType = usePreferencesStore((state) => state.businessType);
  const featureFlags = usePreferencesStore((state) => state.featureFlags);

  // Determine if user is a distributor based on profile OR preferences
  const isDist =
    profile?.dashboard_mode === "distributor" ||
    profile?.dashboard_mode === "both" ||
    businessType === "distributor";

  return {
    businessType: isDist ? "distributor" : "seller",

    // Suppliers visible only for distributors (unless explicitly hidden)
    canSeeSuppliers: isDist && !featureFlags.hideSuppliers,

    // Quick items: hidden by default, opt-in toggle
    canSeeQuickItems: !featureFlags.hideQuickItems,

    // Export: visible by default, can be hidden
    canExport: !featureFlags.hideExport,

    // Sync status always visible (part of Phase 2 trust layer)
    canSeeSyncStatus: true,
  };
}
