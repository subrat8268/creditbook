import * as Sentry from '@sentry/react-native';

export const initSentry = () => {
  if (!__DEV__) {
    Sentry.init({
      dsn: process.env.EXPO_PUBLIC_SENTRY_DSN || "",
      tracesSampleRate: 1.0,
      _experiments: {
        profilesSampleRate: 1.0,
      },
    });
  }
};

export const wrap = Sentry.wrap;
