import { X } from "lucide-react-native";
import {
    ActivityIndicator,
    FlatList,
    Modal,
    SafeAreaView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import SearchBar from "./ui/SearchBar";

interface Item {
  id: string;
  name: string;
}

interface SearchablePickerModalProps<T extends Item> {
  visible: boolean;
  onClose: () => void;
  onSelect: (item: T) => void;
  title: string;
  items: T[];
  search: string;
  setSearch: (search: string) => void;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  onEndReached: () => void;
}

export default function SearchablePickerModal<T extends Item>({
  visible,
  onClose,
  onSelect,
  title,
  items,
  search,
  setSearch,
  isLoading,
  isFetchingNextPage,
  onEndReached,
}: SearchablePickerModalProps<T>) {
  const handleSelectItem = (item: T) => {
    onSelect(item);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200 bg-white">
          <Text className="text-xl font-inter-bold">{title}</Text>
          <TouchableOpacity onPress={onClose}>
            <X size={26} color={colors.neutral[700]} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <View className="p-4">
          <SearchBar
            value={search}
            onChangeText={setSearch}
            placeholder={`Search ${title.toLowerCase()}...`}
          />
        </View>

        {isLoading && !items.length ? (
          <ActivityIndicator size="large" className="mt-8" />
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.5}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleSelectItem(item)}
                className="p-4 border-b border-gray-200"
              >
                <Text className="text-base font-inter-medium">{item.name}</Text>
              </TouchableOpacity>
            )}
            ListFooterComponent={
              isFetchingNextPage ? <ActivityIndicator className="my-4" /> : null
            }
            ListEmptyComponent={
              <View className="items-center mt-10">
                <Text className="text-neutral-500">No items found.</Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}
