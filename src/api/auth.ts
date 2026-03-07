import { supabase } from "@/src/services/supabase";
import { LoginValues } from "../types/auth";

export async function loginApi(values: LoginValues) {
  const { data, error } = await supabase.auth.signInWithPassword(values);
  if (error) throw new Error(error.message);
  return data.user;
}

export async function signUpApi(values: { email: string; password: string }) {
  // Create the auth user — the handle_new_user DB trigger automatically
  // creates the matching profiles row (SECURITY DEFINER, bypasses RLS).
  const { data, error } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
  });
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("Sign-up failed — no user returned.");

  // Fallback: if the trigger didn't run (migration not applied yet),
  // include name: '' to satisfy any NOT NULL constraint on the live DB.
  await supabase
    .from("profiles")
    .upsert(
      { user_id: data.user.id, name: "" },
      { onConflict: "user_id", ignoreDuplicates: true },
    );

  return data.user;
}

export async function resetPasswordApi(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw new Error(error.message);
}

export async function logoutApi() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
  return true;
}
