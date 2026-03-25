import { colors } from "@/src/utils/theme";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function Loader({ message }: { message?: string }) {
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
        <Text className="mt-3 text-neutral-500">{displayText}</Text>
      ) : null}
    </View>
  );
}
