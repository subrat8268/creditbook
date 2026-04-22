import { colors } from "@/src/utils/theme";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

interface SkeletonProps {
  /** Width of the skeleton line */
  width?: number | `${number}%` | "auto";
  /** Height of the skeleton line */
  height?: number;
  /** Border radius (default: 8) */
  radius?: number;
  /** Optional className for additional styling */
  className?: string;
}

/**
 * Skeleton — shimmer loading placeholder.
 * 
 * Creates a pulsing animation to indicate loading state.
 * Use for: cards, list items, text placeholders.
 */
export default function Skeleton({
  width = "100%",
  height = 16,
  radius = 8,
  className,
}: SkeletonProps) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [shimmer]);

  const opacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      className={className}
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius: radius,
          opacity,
        },
      ]}
    />
  );
}

// ─── Skeleton Card (for list items) ───────────────────────────────────────────

interface SkeletonCardProps {
  /** Show avatar skeleton */
  showAvatar?: boolean;
  /** Show subtitle skeleton */
  showSubtitle?: boolean;
}

export function SkeletonCard({ showAvatar = true, showSubtitle = true }: SkeletonCardProps) {
  return (
    <View style={styles.card}>
      {showAvatar && (
        <Skeleton width={52} height={52} radius={26} className="mr-3.5" />
      )}
      <View style={styles.cardContent}>
        <Skeleton width="70%" height={16} className="mb-1" />
        {showSubtitle && <Skeleton width="50%" height={12} />}
      </View>
      <View style={styles.cardRight}>
        <Skeleton width={60} height={16} className="mb-1" />
        <Skeleton width={50} height={20} radius={10} />
      </View>
    </View>
  );
}

// ─── Skeleton List (for FlatList loading) ──────────────────────────────────────

interface SkeletonListProps {
  /** Number of skeleton cards to show */
  count?: number;
}

export function SkeletonList({ count = 5 }: SkeletonListProps) {
  return (
    <View className="p-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} showAvatar={i === 0} showSubtitle={i === 0} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.border,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardContent: {
    flex: 1,
    marginRight: 12,
  },
  cardRight: {
    alignItems: "flex-end",
  },
});
