import { ChevronRight } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";
import { Supplier } from "../../types/supplier";
import { colors } from "../../utils/theme";

const AVATAR_COLORS = [
  colors.danger.DEFAULT,   // #E74C3C  red
  colors.warning.DEFAULT,  // #F39C12  amber/orange
  colors.primary.DEFAULT,  // #22C55E  green
  colors.info.DEFAULT,     // #4F9CFF  blue
  "#9B59B6",               // purple
  "#E91E8C",               // pink
  "#00BCD4",               // teal
  "#FF5722",               // deep orange
] as const;

function getAvatarColor(name: string): string {
  const sum = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

type Props = {
  supplier: Supplier;
  onPress?: () => void;
};

export default function SupplierCard({ supplier, onPress }: Props) {
  const balance = supplier.balanceOwed ?? 0;
  const avatarColor = getAvatarColor(supplier.name);
  const initials = getInitials(supplier.name);

  const balanceBadge =
    balance > 0
      ? { bg: colors.danger.light, text: colors.danger.DEFAULT, label: "PENDING" }
      : { bg: colors.success.light, text: colors.success.text, label: "PAID" };

  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between bg-white border border-neutral-300 py-4 px-4 rounded-xl mb-3 shadow-sm"
    >
      <View className="flex-row items-center flex-1">
        {/* Initials avatar — consistent with CustomerCard pattern */}
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: avatarColor,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 16 }}>
            {initials}
          </Text>
        </View>

        <View className="flex-1">
          <Text className="font-inter-semibold text-neutral-900">
            {supplier.name}
          </Text>
          {supplier.phone ? (
            <Text className="text-neutral-500 text-sm font-inter">
              {supplier.phone}
            </Text>
          ) : null}
          {supplier.basket_mark ? (
            <Text className="text-neutral-400 text-xs font-inter">
              Mark: {supplier.basket_mark}
            </Text>
          ) : null}
        </View>
      </View>

      <View className="items-end gap-1">
        <View
          style={{ backgroundColor: balanceBadge.bg }}
          className="px-2 py-1 rounded-lg"
        >
          {balance > 0 && (
            <Text
              className="font-inter-semibold text-sm"
              style={{ color: balanceBadge.text }}
            >
              ₹{balance.toLocaleString("en-IN")}
            </Text>
          )}
          <Text
            className="text-xs font-inter text-right"
            style={{ color: balanceBadge.text }}
          >
            {balance > 0 ? "You owe" : balanceBadge.label}
          </Text>
        </View>
        <ChevronRight size={16} color={colors.neutral[400]} strokeWidth={2} />
      </View>
    </TouchableOpacity>
  );
}
