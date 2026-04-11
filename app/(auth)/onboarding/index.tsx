// Phone number onboarding is Phase 7 (Supabase Phone Auth / OTP).
// This route exists only so /(auth)/onboarding resolves without a 404.
// All navigation sends users directly to /(auth)/onboarding/role.
import { Redirect } from "expo-router";

export default function OnboardingIndex() {
  return <Redirect href="/(auth)/onboarding/business" />;
}
