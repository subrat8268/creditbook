import { useEffect, useRef } from "react";
import { Animated, View } from "react-native";

type Status = "Paid" | "Pending" | "Partially Paid";

type StatusDotProps = {
  status: Status;
};

const DOT_COLOR: Record<Status, string> = {
  Paid: "#22C55E",
  Pending: "#F59E0B",
  "Partially Paid": "#E74C3C",
};

export default function StatusDot({ status }: StatusDotProps) {
  const dotColor = DOT_COLOR[status];

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
      ]),
    );

    loop.start();

    return () => loop.stop(); // cleanup on unmount/status change
  }, [status, scale, opacity]);

  return (
    <View className="w-5 h-5 items-center justify-center">
      {/* Pulsing background only if not Paid */}
      {status !== "Paid" && (
        <Animated.View
          className="absolute w-3 h-3 rounded-full"
          style={{
            backgroundColor: dotColor,
            transform: [{ scale }],
            opacity,
          }}
        />
      )}
      {/* Static dot */}
      <View
        className="w-2.5 h-2.5 rounded-full"
        style={{ backgroundColor: dotColor }}
      />
    </View>
  );
}
