import { CircleOff } from "lucide-react-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface EmptyStateProps {
  /** Legacy single-line message (falls back to subtitle when no title is set) */
  message?: string;
  /** Bold headline, e.g. "No customers yet" */
  title?: string;
  /** Softer supporting text */
  description?: string;
  /** CTA button label */
  cta?: string;
  onCta?: () => void;
}

export default function EmptyState({
  message,
  title,
  description,
  cta,
  onCta,
}: EmptyStateProps) {
  const heading = title ?? message ?? "Nothing here yet";
  const sub = title ? (description ?? message) : undefined;

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <CircleOff size={36} color="#9CA3AF" strokeWidth={1.5} />
      </View>
      <Text style={styles.heading}>{heading}</Text>
      {sub ? <Text style={styles.sub}>{sub}</Text> : null}
      {cta && onCta ? (
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={onCta}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaText}>{cta}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  heading: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1C1C1E",
    textAlign: "center",
    marginBottom: 6,
  },
  sub: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  ctaBtn: {
    backgroundColor: "#22C55E",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  ctaText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});
