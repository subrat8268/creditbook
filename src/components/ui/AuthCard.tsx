import { colors } from "@/src/utils/theme";
import { ReactNode } from "react";
import { View } from "react-native";

type Props = {
  children: ReactNode;
};

/** White rounded card with drop shadow — wraps auth form content */
export default function AuthCard({ children }: Props) {
  return (
    <View 
      className="bg-surface rounded-2xl px-5 pt-6 pb-7"
      style={{
        shadowColor: colors.textPrimary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
        elevation: 8,
      }}
    >
      {children}
    </View>
  );
}
