import { supabase } from "@/src/services/supabase";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { LoginValues } from "../types/auth";

export async function loginApi(values: LoginValues) {
  const { data, error } = await supabase.auth.signInWithPassword(values);
  if (error) throw new Error(error.message);
  return data.user;
}

export async function signUpApi(values: {
  email: string;
  password: string;
  fullName: string;
}) {
  // Create the auth user — the handle_new_user DB trigger automatically
  // creates the matching profiles row (SECURITY DEFINER, bypasses RLS).
  const { data, error } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
    options: { data: { full_name: values.fullName } },
  });
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("Sign-up failed — no user returned.");

  // Fallback: if the trigger didn't run (migration not applied yet),
  // upsert with the provided name to satisfy any NOT NULL constraint.
  await supabase
    .from("profiles")
    .upsert(
      { user_id: data.user.id, name: values.fullName },
      { onConflict: "user_id", ignoreDuplicates: true },
    );

  return data.user;
}

export async function signInWithGoogleApi() {
  const redirectUrl = Linking.createURL("/");

  // Step 1 — get the Google OAuth URL from Supabase
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectUrl,
      skipBrowserRedirect: true, // we open the browser ourselves
    },
  });
  if (error) throw new Error(error.message);
  if (!data.url) throw new Error("Could not start Google sign-in.");

  // Step 2 — open the Google consent screen in an in-app browser
  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

  if (result.type === "cancel" || result.type === "dismiss") {
    throw new Error("Google sign-in was cancelled.");
  }
  if (result.type !== "success") {
    throw new Error("Google sign-in failed.");
  }

  // Step 3 — exchange the auth code / tokens returned in the redirect URL
  const parsed = Linking.parse(result.url);
  const params = (parsed.queryParams ?? {}) as Record<string, string>;

  if (params.code) {
    // PKCE flow (default for Supabase v2)
    const { data: sd, error: se } = await supabase.auth.exchangeCodeForSession(
      params.code,
    );
    if (se) throw new Error(se.message);
    return sd.user;
  }

  // Implicit flow fallback — tokens in URL fragment
  const fragment = result.url.split("#")[1] ?? "";
  const hp = Object.fromEntries(new URLSearchParams(fragment));
  if (hp.access_token && hp.refresh_token) {
    const { data: sd, error: se } = await supabase.auth.setSession({
      access_token: hp.access_token,
      refresh_token: hp.refresh_token,
    });
    if (se) throw new Error(se.message);
    return sd.user;
  }

  throw new Error("No authentication tokens received from Google.");
}

export async function resetPasswordApi(email: string) {
  // redirectTo must match an entry in Supabase Dashboard → Auth → URL Configuration
  // → Redirect URLs (e.g. "exp://" or a custom scheme like "creditbook://").
  // Without this the recovery link opens a browser page instead of the app.
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: Linking.createURL("/"),
  });
  if (error) throw new Error(error.message);
}

export async function logoutApi() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
  return true;
}
