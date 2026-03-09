import { colors } from "@/src/utils/theme";
import { Text, TouchableOpacity } from "react-native";
import GoogleLogo from "./GoogleLogo";

type Props = {
  onPress: () => void;
  isPending?: boolean;
  disabled?: boolean;
};

/** "Continue with Google" button — shared across all auth screens */
export default function GoogleButton({ onPress, isPending, disabled }: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      disabled={disabled || isPending}
      className="flex-row items-center justify-center rounded-2xl h-14 gap-3"
      style={{
        borderWidth: 1,
        borderColor: colors.neutral[200],
        backgroundColor: colors.white,
        opacity: isPending ? 0.6 : 1,
      }}
    >
      <GoogleLogo size={22} />
      <Text className="text-textDark font-semibold text-[15px]">
        {isPending ? "Signing in…" : "Continue with Google"}
      </Text>
    </TouchableOpacity>
  );
}
