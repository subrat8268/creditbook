import { supabase } from "@/src/services/supabase";
import { LoginValues } from "../types/auth";

export async function loginApi(values: LoginValues) {
  const { data, error } = await supabase.auth.signInWithPassword(values);
  if (error) throw new Error(error.message);
  return data.user;
}

export async function signUpApi(values: { email: string; password: string }) {
  // 1. Create the auth user
  const { data, error } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
  });
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("Sign-up failed — no user returned.");

  // 2. Insert a matching profile row so the onboarding flow can update it
  const { error: profileError } = await supabase.from("profiles").insert([
    {
      user_id: data.user.id,
      onboarding_complete: false,
    },
  ]);
  // Ignore duplicate-key errors (e.g. if a trigger already created the row)
  if (profileError && !profileError.message.includes("duplicate")) {
    throw new Error(profileError.message);
  }

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
