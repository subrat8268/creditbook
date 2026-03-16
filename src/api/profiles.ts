import { toApiError } from "../lib/supabaseQuery";
import { supabase } from "../services/supabase";
import { Profile } from "../types/auth";

export const getProfile = async (user_id: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user_id)
    .maybeSingle();

  if (error) throw toApiError(error);
  return data;
};
