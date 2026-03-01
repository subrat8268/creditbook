import * as Sentry from "@sentry/react-native";

/**
 * Call once at app startup (before the root component renders).
 * DSN is loaded from EXPO_PUBLIC_SENTRY_DSN in your .env file.
 * If the variable is missing the call is a no-op so the app still
 * works in dev without a Sentry project.
 */
export function initSentry() {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    // Enable performance tracing — set a lower value in production (0.2 = 20%)
    tracesSampleRate: __DEV__ ? 1.0 : 0.2,
    // Capture replays for 10 % of sessions — disable until you actually need it
    // replaysSessionSampleRate: 0.1,
    debug: __DEV__,
    environment: __DEV__ ? "development" : "production",
  });
}

export { Sentry };
