import { CircleOff } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";

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
    <View className="flex-1 items-center justify-center px-8 py-12">
      {/* Icon circle — neutral.100 background */}
      <View
        className="w-[72px] h-[72px] rounded-full items-center justify-center mb-4"
        style={{ backgroundColor: "#F6F7FB" }}
      >
        <CircleOff size={36} color="#9CA3AF" strokeWidth={1.5} />
      </View>

      <Text
        className="text-[17px] font-bold text-center mb-1.5"
        style={{ color: "#1C1C1E" }}
      >
        {heading}
      </Text>

      {sub ? (
        <Text
          className="text-[14px] text-center leading-5 mb-5"
          style={{ color: "#8E8E93" }}
        >
          {sub}
        </Text>
      ) : null}

      {cta && onCta ? (
        <TouchableOpacity
          className="mt-2 rounded-xl bg-primary items-center justify-center"
          style={{ height: 52, paddingHorizontal: 32 }}
          onPress={onCta}
          activeOpacity={0.8}
        >
          <Text className="text-white text-[14px] font-bold">{cta}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
