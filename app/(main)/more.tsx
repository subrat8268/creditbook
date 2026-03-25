import { colors } from "@/src/utils/theme";
import BottomSheet from "@gorhom/bottom-sheet";
import { Href, useRouter } from "expo-router";
import {
    BarChart3,
    BookOpen,
    ChevronRight,
    Download,
    LucideIcon,
} from "lucide-react-native";
import { useCallback, useRef } from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle,
} from "react-native";

type MoreOption = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  route: Href;
};

const SECTION_1: MoreOption[] = [
  {
    id: "products",
    title: "Inventory Management",
    description: "Stock tracking & product ledgers",
    icon: BookOpen,
    color: colors.fab,
    route: "/products",
  },
];

const SECTION_2: MoreOption[] = [
  {
    id: "reports",
    title: "Advanced Reports",
    description: "Weekly insights & performance",
    icon: BarChart3,
    color: "#8B5CF6",
    route: "/reports",
  },
  {
    id: "export",
    title: "Data Export",
    description: "Download PDF, Excel or CSV files",
    icon: Download,
    color: "#F59E0B",
    route: "/export",
  },
];

function OptionCard({
  option,
  onPress,
}: {
  option: MoreOption;
  onPress: () => void;
}) {
  const IconComponent = option.icon;
  return (
    <TouchableOpacity
      className="flex-row items-center bg-background rounded-2xl px-4 py-4 border border-border"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        className="w-12 h-12 rounded-xl items-center justify-center mr-4"
        style={{ backgroundColor: option.color }}
      >
        <IconComponent size={24} color={colors.surface} strokeWidth={2} />
      </View>

      <View className="flex-1">
        <Text className="text-base font-semibold text-textDark mb-0.5">
          {option.title}
        </Text>
        <Text className="text-xs text-textSecondary">{option.description}</Text>
      </View>

      <ChevronRight size={20} color={colors.textSecondary} strokeWidth={1.5} />
    </TouchableOpacity>
  );
}

export default function MoreScreen() {
  const router = useRouter();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = ["95%"];

  const handleOptionPress = useCallback(
    (route: Href) => {
      bottomSheetRef.current?.close();
      setTimeout(() => {
        router.push(route);
      }, 300);
    },
    [router],
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose
        handleIndicatorStyle={styles.handle}
        backgroundStyle={styles.sheetBackground}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={styles.sheetContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Section 1 — Business Details */}
          <View className="mb-6">
            <Text className="text-xs font-bold uppercase text-textSecondary mb-3 tracking-widest">
              Business Details
            </Text>
            <View className="gap-3">
              {SECTION_1.map((option) => (
                <OptionCard
                  key={option.id}
                  option={option}
                  onPress={() => handleOptionPress(option.route)}
                />
              ))}
            </View>
          </View>

          {/* Section 2 — Analysis & Tools */}
          <View className="mb-6">
            <Text className="text-xs font-bold uppercase text-textSecondary mb-3 tracking-widest">
              Analysis &amp; Tools
            </Text>
            <View className="gap-3">
              {SECTION_2.map((option) => (
                <OptionCard
                  key={option.id}
                  option={option}
                  onPress={() => handleOptionPress(option.route)}
                />
              ))}
            </View>
          </View>
        </ScrollView>
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create<{
  sheetBackground: ViewStyle;
  handle: ViewStyle;
  sheetContent: ViewStyle;
}>({
  sheetBackground: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handle: {
    backgroundColor: colors.border,
    width: 40,
    height: 4,
  },
  sheetContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
});
