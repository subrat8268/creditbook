import { supabase } from "@/src/services/supabase";
import { LoginValues } from "../types/auth";

export async function loginApi(values: LoginValues) {
  const { data, error } = await supabase.auth.signInWithPassword(values);
  if (error) throw new Error(error.message);
  return data.user;
}

export async function logoutApi() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
  return true;
}
