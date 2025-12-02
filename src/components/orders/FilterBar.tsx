import { ChevronDown, Sliders, SortAsc } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";

interface FilterBarProps {
  filters: string[];
  selectedFilter: string;
  onSelectFilter: (filter: string) => void;
  sortBy: string;
  openSortSheet: () => void;
  openFilterSheet: () => void;
}

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
      <View className="flex-row items-center justify-between">
        {/* Filter Button */}
        <TouchableOpacity
          onPress={openFilterSheet}
          activeOpacity={0.8}
          className="flex-row items-center px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-full"
        >
          <Sliders size={16} color="#4B5563" />
          <Text className="ml-1 text-sm text-gray-700 font-medium">
            {selectedFilter || "Filter"}
          </Text>
          <ChevronDown size={14} color="#6B7280" className="ml-1" />
        </TouchableOpacity>

        {/* Sort Button */}
        <TouchableOpacity
          onPress={openSortSheet}
          activeOpacity={0.8}
          className="flex-row items-center px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-full"
        >
          <SortAsc size={16} color="#4B5563" />
          <Text className="ml-1 text-sm text-gray-700 font-medium capitalize">
            {sortBy}
          </Text>
          <ChevronDown size={14} color="#6B7280" className="ml-1" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
