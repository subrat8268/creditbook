import { useTheme } from "@/src/utils/ThemeProvider";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function Loader({ message }: { message?: string }) {
  const { colors } = useTheme();

  // Show a fallback hint after 2 s so users aren't left staring at a blank
  // spinner during slow profile fetches or network delays.
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowHint(true), 2000);
    return () => clearTimeout(t);
  }, []);

  const displayText = message ?? (showHint ? "Loading your profile…" : "");

  return (
    <View className="flex-1 items-center justify-center mt-6">
      <ActivityIndicator size="large" color={colors.primaryDark} />
      {displayText ? (
        <Text className="mt-3" style={{ color: colors.textSecondary }}>{displayText}</Text>
      ) : null}
    </View>
  );
}
