import { colors } from "@/src/utils/theme";
import { ChevronDown, Sliders, SortAsc } from "lucide-react-native";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

interface FilterBarProps {
  filters: string[];
  selectedFilter: string;
  onSelectFilter: (filter: string) => void;
  sortBy: string;
  openSortSheet: () => void;
  openFilterSheet: () => void;
}

const getChipStyle = (isActive: boolean) =>
  isActive ? "bg-primary border-primary" : "bg-search border-default";

const getTextStyle = (isActive: boolean) =>
  isActive
    ? "text-white font-inter-semibold"
    : "text-textPrimary font-inter-medium";

export function FilterBar({
  filters,
  selectedFilter,
  onSelectFilter,
  sortBy,
  openSortSheet,
  openFilterSheet,
}: FilterBarProps) {
  return (
    <View className="bg-white pb-3">
      {/* Filter chips row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 10, gap: 8 }}
        className="mb-1"
      >
        {filters.map((f) => {
          const isActive = selectedFilter === f;
          return (
            <TouchableOpacity
              key={f}
              onPress={() => onSelectFilter(f)}
              activeOpacity={0.75}
              className={`px-3 py-1.5 rounded-full border ${getChipStyle(isActive)}`}
            >
              <Text className={`text-sm ${getTextStyle(isActive)}`}>{f}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Filter + Sort controls */}
      <View className="flex-row items-center justify-between">
        {/* Filter Button */}
        <TouchableOpacity
          onPress={openFilterSheet}
          activeOpacity={0.8}
          className="flex-row items-center px-3 py-1.5 bg-search border border-default rounded-full"
        >
          <Sliders size={16} color={colors.neutral[600]} />
          <Text className="ml-1 text-sm text-textPrimary font-inter-medium">
            Filter
          </Text>
          <ChevronDown size={14} color={colors.neutral[500]} className="ml-1" />
        </TouchableOpacity>

        {/* Sort Button */}
        <TouchableOpacity
          onPress={openSortSheet}
          activeOpacity={0.8}
          className="flex-row items-center px-3 py-1.5 bg-search border border-default rounded-full"
        >
          <SortAsc size={16} color={colors.neutral[600]} />
          <Text className="ml-1 text-sm text-textPrimary font-inter-medium capitalize">
            {sortBy}
          </Text>
          <ChevronDown size={14} color={colors.neutral[500]} className="ml-1" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
