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

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),

  fetchProfile: async () => {
    const { user } = get();
    if (!user) return;

    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from("profiles") // ✅ two type arguments
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
                  (1000 * 60 * 60 * 24)
              )
            )
          : 0;

        set({
          profile: {
            ...data,
            isSubscribed,
            daysRemaining,
          },
        });
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    } finally {
      set({ loading: false });
    }
  },

  logout: () => set({ user: null, profile: null }),
}));
