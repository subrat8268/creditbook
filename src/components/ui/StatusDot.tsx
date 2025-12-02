import { useEffect, useRef } from "react";
import { Animated, View } from "react-native";

type Status = "Paid" | "Pending" | "Partially Paid";

type StatusDotProps = {
  status: Status;
};

export default function StatusDot({ status }: StatusDotProps) {
  const colors: Record<Status, string> = {
    Paid: "bg-green-500",
    Pending: "bg-yellow-500",
    "Partially Paid": "bg-red-500",
  };

  const color = colors[status];

  // Animations
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (status === "Paid") {
      // Reset to default state when paid (no animation)
      scale.setValue(1);
      opacity.setValue(1);
      return;
    }

    // Start pulsing loop for Pending or Partially Paid
    const loop = Animated.loop(
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();

    return () => loop.stop(); // cleanup on unmount/status change
  }, [status, scale, opacity]);

  return (
    <View className="w-5 h-5 items-center justify-center">
      {/* Pulsing background only if not Paid */}
      {status !== "Paid" && (
        <Animated.View
          className={`absolute w-3 h-3 rounded-full ${color}`}
          style={{
            transform: [{ scale }],
            opacity,
          }}
        />
      )}
      {/* Static dot */}
      <View className={`w-2.5 h-2.5 rounded-full ${color}`} />
    </View>
  );
}
