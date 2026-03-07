import { Text, View } from "react-native";

interface Props {
  current: 1 | 2 | 3 | 4;
}

const STEPS = ["Role", "Phone", "Business", "Ready"];

export default function OnboardingProgress({ current }: Props) {
  return (
    <View className="flex-row items-center justify-center gap-1">
      {STEPS.map((label, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;
        return (
          <View key={step} className="flex-row items-center">
            {/* Circle */}
            <View
              className={`w-8 h-8 rounded-full items-center justify-center
                ${done ? "bg-primary" : active ? "bg-primary" : "bg-neutral-200"}`}
            >
              <Text
                className={`text-xs font-inter-bold
                  ${done || active ? "text-white" : "text-neutral-500"}`}
              >
                {done ? "✓" : String(step)}
              </Text>
            </View>
            {/* Label */}
            <Text
              className={`ml-1 text-xs font-inter-medium
                ${active ? "text-primary" : done ? "text-neutral-500" : "text-neutral-400"}`}
            >
              {label}
            </Text>
            {/* Connector */}
            {step < 4 && (
              <View
                className={`mx-2 h-0.5 w-6 rounded-full
                  ${done ? "bg-primary" : "bg-neutral-200"}`}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}
