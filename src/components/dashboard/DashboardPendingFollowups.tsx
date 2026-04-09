import { formatINR } from "@/src/utils/dashboardUi";
import { colors } from "@/src/utils/theme";
import { BellRing } from "lucide-react-native";
import { Linking, Text, TouchableOpacity, View } from "react-native";

type OverduePerson = {
  id: string;
  name: string;
  phone: string;
  balance: number;
  daysSince: number;
};

type Props = {
  people: OverduePerson[];
  onSeeAll?: () => void;
};

export default function DashboardPendingFollowups({
  people,
  onSeeAll,
}: Props) {
  const visible = people.slice(0, 2);

  const handleRemind = (person: OverduePerson) => {
    const message = encodeURIComponent(
      `Hi ${person.name}, you have an outstanding balance of ₹${person.balance.toLocaleString("en-IN")}. Please clear at your earliest convenience. Thank you!`,
    );
    const phone = person.phone.replace(/\D/g, "");
    Linking.openURL(`https://wa.me/91${phone}?text=${message}`).catch(() => {});
  };

  return (
    <View className="mb-5">
      {/* Section header */}
      <View className="flex-row justify-between items-center mb-3.5">
        <View className="flex-row items-center gap-2">
          <Text className="text-lg font-bold text-textDark">
            Pending Follow-ups
          </Text>
          <View
            className="px-2 py-0.5 rounded-full"
            style={{ backgroundColor: colors.dangerBg }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: "700",
                color: colors.danger,
              }}
            >
              {people.length}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={onSeeAll}>
          <Text className="text-sm font-semibold text-primary">See All</Text>
        </TouchableOpacity>
      </View>

      {/* People rows */}
      <View
        className="bg-surface rounded-2xl overflow-hidden"
        style={{
          shadowColor: colors.textPrimary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        {visible.map((person, index) => (
          <View
            key={person.id}
            className="flex-row items-center px-4 py-3.5"
            style={{
              borderBottomWidth: index < visible.length - 1 ? 1 : 0,
              borderBottomColor: colors.borderLight,
            }}
          >
            {/* Avatar */}
            <View
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: colors.dangerBg }}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "700",
                  color: colors.danger,
                }}
              >
                {person.name.charAt(0).toUpperCase()}
              </Text>
            </View>

            {/* Name + days */}
            <View className="flex-1">
              <Text
                className="text-sm font-semibold text-textDark"
                numberOfLines={1}
              >
                {person.name}
              </Text>
              <View className="flex-row items-center gap-1 mt-0.5">
                <View
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: colors.danger }}
                />
                <Text style={{ fontSize: 12, color: colors.danger }}>
                  {person.daysSince} days overdue
                </Text>
              </View>
            </View>

            {/* Balance + remind */}
            <View className="items-end gap-2">
              <Text
                className="text-sm font-bold"
                style={{ color: colors.danger }}
              >
                {formatINR(person.balance)}
              </Text>
              <TouchableOpacity
                className="flex-row items-center gap-1 px-2.5 py-1 rounded-full"
                style={{ backgroundColor: colors.successBg }}
                onPress={() => handleRemind(person)}
              >
                <BellRing size={12} color={colors.primary} strokeWidth={2.5} />
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "600",
                    color: colors.primary,
                  }}
                >
                  Remind
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
