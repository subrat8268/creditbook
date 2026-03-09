import { ReactNode } from "react";
import { View } from "react-native";

type Props = {
  children: ReactNode;
};

/** White rounded card with drop shadow — wraps auth form content */
export default function AuthCard({ children }: Props) {
  return (
    <View className="bg-white rounded-2xl px-5 pt-6 pb-7">{children}</View>
  );
}
