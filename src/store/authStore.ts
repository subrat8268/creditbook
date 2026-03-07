import { create } from "zustand";
import { supabase } from "../services/supabase";
import { Profile, User } from "../types/auth";

type AuthState = {
  user: User | null;
  profile: Profile | null;
  loading: boolean; // track loading profile
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  fetchProfile: () => Promise<void>;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: false,

  setUser: (user) => {
    if (user) {
      // Set loading=true synchronously before the next render so _layout
      // never sees (user=set, profile=null, loading=false) even for one frame.
      set({ user, loading: true });
      // fetchProfile reads user from get() — must be set first.
      get().fetchProfile();
    } else {
      set({ user: null, profile: null, loading: false });
    }
  },

  setProfile: (profile) => set({ profile }),

  fetchProfile: async () => {
    const { user } = get();
    if (!user) return;

    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
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
        // No profile row found — create a minimal one so the app can proceed.
        // Include name: '' to satisfy any NOT NULL constraint on the live DB.
        const { data: created, error: upsertErr } = await supabase
          .from("profiles")
          .upsert({ user_id: user.id, name: "" }, { onConflict: "user_id" })
          .select()
          .single();
        if (!upsertErr && created) {
          set({
            profile: { ...created, isSubscribed: false, daysRemaining: 0 },
          });
        } else {
          console.error("Could not create profile row:", upsertErr?.message);
        }
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    } finally {
      set({ loading: false });
    }
  },

  logout: () => set({ user: null, profile: null }),
}));
