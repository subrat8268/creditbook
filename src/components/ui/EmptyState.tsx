import { useEffect, useMemo, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Easing, Text, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import Button from "@/src/components/ui/Button";
import { useLanguageStore } from "@/src/store/languageStore";
import { useTheme } from "@/src/utils/ThemeProvider";

export interface EmptyStateProps {
  illustration: "ledger" | "person" | "clipboard" | "search";
  headingEn: string;
  headingHi: string;
  bodyEn: string;
  bodyHi: string;
  ctaLabel?: string;
  onCta?: () => void;
  style?: StyleProp<ViewStyle>;
}

function Illustration({
  kind,
  stroke,
  muted,
}: {
  kind: EmptyStateProps["illustration"];
  stroke: string;
  muted: string;
}) {
  const common = { stroke, strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

  switch (kind) {
    case "ledger":
      return (
        <Svg width={140} height={110} viewBox="0 0 140 110" fill="none">
          <Path {...common} d="M18 26c10-10 28-10 38 0v66c-10-10-28-10-38 0V26z" />
          <Path {...common} d="M122 26c-10-10-28-10-38 0v66c10-10 28-10 38 0V26z" />
          <Path {...common} d="M56 30h28" />
          <Path {...common} d="M56 44h28" />
          <Path {...common} d="M56 58h20" />
          <Circle cx="70" cy="84" r="10" stroke={muted} strokeWidth={2} />
          <Path {...common} d="M66 84h8" />
        </Svg>
      );
    case "person":
      return (
        <Svg width={140} height={110} viewBox="0 0 140 110" fill="none">
          <Circle cx="56" cy="42" r="16" stroke={stroke} strokeWidth={2} />
          <Path {...common} d="M24 96c4-18 18-28 32-28s28 10 32 28" />
          <Rect x="90" y="34" width="34" height="34" rx="10" stroke={muted} strokeWidth={2} />
          <Path {...common} d="M107 42v18" />
          <Path {...common} d="M98 51h18" />
        </Svg>
      );
    case "clipboard":
      return (
        <Svg width={140} height={110} viewBox="0 0 140 110" fill="none">
          <Rect x="36" y="20" width="68" height="80" rx="16" stroke={stroke} strokeWidth={2} />
          <Rect x="54" y="14" width="32" height="16" rx="8" stroke={muted} strokeWidth={2} />
          <Path {...common} d="M50 48h40" />
          <Path {...common} d="M50 62h34" />
          <Path {...common} d="M50 76h28" />
        </Svg>
      );
    case "search":
      return (
        <Svg width={140} height={110} viewBox="0 0 140 110" fill="none">
          <Circle cx="62" cy="48" r="20" stroke={stroke} strokeWidth={2} />
          <Path {...common} d="M78 64l18 18" />
          <Path {...common} d="M48 48h28" />
          <Path {...common} d="M54 40h16" />
          <Circle cx="104" cy="86" r="10" stroke={muted} strokeWidth={2} />
          <Path {...common} d="M100 86h8" />
        </Svg>
      );
  }
}

export default function EmptyState({
  illustration,
  headingEn,
  headingHi,
  bodyEn,
  bodyHi,
  ctaLabel,
  onCta,
  style,
}: EmptyStateProps) {
  const { colors, spacing } = useTheme();
  const language = useLanguageStore((s) => s.language);

  const heading = language === "hi" ? headingHi : headingEn;
  const body = language === "hi" ? bodyHi : bodyEn;

  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((v) => {
        if (mounted) setReduceMotion(Boolean(v));
      })
      .catch(() => {
        // Ignore; default to animated.
      });
    return () => {
      mounted = false;
    };
  }, []);

  const floatY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduceMotion) return;

    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, {
          toValue: -6,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatY, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    anim.start();
    return () => anim.stop();
  }, [floatY, reduceMotion]);

  const ctaEnabled = Boolean(ctaLabel && onCta);

  const containerStyle = useMemo<StyleProp<ViewStyle>>(
    () => [
      {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: spacing.xl,
      },
      style,
    ],
    [spacing.xl, style],
  );

  return (
    <View style={containerStyle}>
      <Animated.View style={{ transform: [{ translateY: floatY }] }}>
        <Illustration
          kind={illustration}
          stroke={colors.textPrimary}
          muted={colors.textMuted}
        />
      </Animated.View>

      <Text
        selectable
        style={{
          marginTop: spacing.lg,
          fontSize: 18,
          fontWeight: "600",
          color: colors.textPrimary,
          textAlign: "center",
        }}
      >
        {heading}
      </Text>

      <Text
        selectable
        style={{
          marginTop: 6,
          fontSize: 14,
          color: colors.textMuted,
          textAlign: "center",
          lineHeight: 20,
        }}
      >
        {body}
      </Text>

      {ctaEnabled ? (
        <View style={{ marginTop: spacing.xl, alignSelf: "stretch" }}>
          <Button title={ctaLabel!} onPress={onCta!} />
        </View>
      ) : null}
    </View>
  );
}
