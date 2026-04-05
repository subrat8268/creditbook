import { create } from "zustand";
import { supabase } from "../services/supabase";
import { Profile, User } from "../types/auth";

type AuthState = {
  user: User | null;
  profile: Profile | null;
  isInitialized: boolean; // True once we've done the first session check
  isFetchingProfile: boolean; // Replaces ambiguous 'loading'
  isRecoveryMode: boolean;
  setAuth: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setRecoveryMode: (v: boolean) => void;
  fetchProfile: (userId: string) => Promise<void>;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isInitialized: false,
  isFetchingProfile: false,
  isRecoveryMode: false,

  setRecoveryMode: (v) => set({ isRecoveryMode: v }),

  setProfile: (profile) => set({ profile }),

  setAuth: (user) => {
    const currentUser = get().user;
    set({ user, isInitialized: true });

    // Only fetch if we have a user AND (it's a new login OR we lack a profile)
    if (user && (!get().profile || user.id !== currentUser?.id)) {
      get().fetchProfile(user.id);
    } else if (!user) {
      // Clear profile if user logs out
      set({ profile: null, isFetchingProfile: false });
    }
  },

  fetchProfile: async (userId) => {
    // Simple boolean gate — no locking promises needed
    if (get().isFetchingProfile) return;

    set({ isFetchingProfile: true });
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const today = new Date();
        const isSubscribed =
          data.subscription_expiry &&
          new Date(data.subscription_expiry) >= today;
        const daysRemaining = data.subscription_expiry
          ? Math.max(
              0,
              Math.ceil(
                (new Date(data.subscription_expiry).getTime() -
                  today.getTime()) /
                  (1000 * 60 * 60 * 24),
              ),
            )
          : 0;
        set({ profile: { ...data, isSubscribed, daysRemaining } });
      } else {
        // Deterministic upsert: If the DB trigger missed it, we create it here natively.
        const { data: created, error: upsertErr } = await supabase
          .from("profiles")
          .upsert(
            { user_id: userId, name: "", onboarding_complete: false },
            { onConflict: "user_id" },
          )
          .select()
          .single();

        if (!upsertErr && created) {
          set({
            profile: { ...created, isSubscribed: false, daysRemaining: 0 },
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    } finally {
      set({ isFetchingProfile: false });
    }
  },

  logout: () =>
    set({
      user: null,
      profile: null,
      isFetchingProfile: false,
      isRecoveryMode: false,
    }),
}));
