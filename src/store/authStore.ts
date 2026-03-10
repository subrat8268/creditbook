import { create } from "zustand";
import { supabase } from "../services/supabase";
import { Profile, User } from "../types/auth";

type AuthState = {
  user: User | null;
  profile: Profile | null;
  loading: boolean; // track loading profile
  isRecoveryMode: boolean; // true while the user is on the set-new-password screen
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setRecoveryMode: (v: boolean) => void;
  fetchProfile: () => Promise<void>;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set, get) => {
  // Private concurrency gate — tracks whether a fetchProfile network call is
  // currently in-progress. Kept separate from the public `loading` state so
  // setUser can write { user, loading: true } in a single atomic set() without
  // the in-flight guard inside fetchProfile treating it as a concurrent call
  // and deadlocking.
  let _fetchInProgress = false;

  return {
    user: null,
    profile: null,
    loading: false,
    isRecoveryMode: false,

    setRecoveryMode: (v) => set({ isRecoveryMode: v }),

    setUser: (user) => {
      if (user) {
        // Single atomic write — user + loading:true together so no render ever
        // observes the dangerous (user=truthy, profile=null, loading=false) state.
        set({ user, loading: true });
        get().fetchProfile();
      } else {
        set({ user: null, profile: null, loading: false });
      }
    },

    setProfile: (profile) => set({ profile }),

    fetchProfile: async () => {
      const { user } = get();
      if (!user) return;

      if (_fetchInProgress) {
        // A fetch is already in-flight (e.g. setUser called twice by
        // initSession + onAuthStateChange). Wait for the loading flag to clear
        // (it is always set false in the finally block) so callers who
        // `await fetchProfile()` receive up-to-date profile state.
        await new Promise<void>((resolve) => {
          // Safety: re-check in case fetch completed between snapshot + subscribe
          if (!useAuthStore.getState().loading) {
            resolve();
            return;
          }
          const unsub = useAuthStore.subscribe((s) => {
            if (!s.loading) {
              unsub();
              resolve();
            }
          });
        });
        return;
      }

      _fetchInProgress = true;
      // loading may already be true (set atomically by setUser above); set it
      // anyway so direct callers (e.g. AuthProfileErrorScreen Retry button) also
      // show a loader.
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
        _fetchInProgress = false;
        set({ loading: false });
      }
    },

    logout: () => set({ user: null, profile: null }),
  };
});
