import { useProducts } from "@/src/hooks/useProducts";
import { useCallback, useState } from "react";
import { Keyboard, Text, TouchableOpacity, View } from "react-native";
import BottomSheetPicker from "../picker/BottomSheetPicker";

interface Variant {
  id: string;
  name: string;
  price: number;
  image?: string;
}

interface Product {
  id: string;
  name: string;
  base_price: number;
  image?: string;
  variants: Variant[];
}

interface ProductPickerProps {
  visible: boolean;
  onClose: () => void;
  vendorId: string;
  addToCart: (
    id: string,
    name: string,
    price: number,
    variantId?: string,
    variantName?: string,
  ) => void;
  setVariantSelection: (product: Product | null) => void;
}

export default function ProductPicker({
  visible,
  onClose,
  vendorId,
  addToCart,
  setVariantSelection,
}: ProductPickerProps) {
  const [search, setSearch] = useState("");
  const {
    data: products,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useProducts(vendorId, search);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const mappedProducts = products.map((p) => ({
    ...p,
    variants: p.variants.map((v, i) => ({
      ...v,
      id: `${p.id}-variant-${i}`,
      name: v.variant_name,
    })),
  }));

  const handleSelectProduct = (item: Product) => {
    Keyboard.dismiss(); // 🔑 dismiss keyboard
    if (item.variants && item.variants.length > 0) {
      setVariantSelection(item);
    } else {
      addToCart(item.id, item.name, item.base_price);
    }
    onClose();
  };

  return (
    <BottomSheetPicker
      visible={visible}
      onClose={onClose}
      title="Select Product"
      items={mappedProducts}
      isLoading={isLoading}
      isFetchingNextPage={isFetchingNextPage}
      onEndReached={handleEndReached}
      search={search}
      setSearch={setSearch}
      keyExtractor={(item) => item.id}
      renderItem={(item) => (
        <TouchableOpacity
          onPress={() => handleSelectProduct(item)}
          activeOpacity={0.9}
          className="p-4 mb-3 bg-white border border-gray-200 rounded-2xl shadow-sm"
        >
          <View className="flex-row justify-between">
            <Text className="text-gray-900 font-medium">{item.name}</Text>
            <Text className="text-gray-700">₹{item.base_price}</Text>
          </View>
          {item.variants?.length > 0 && (
            <Text className="text-xs text-gray-500 mt-1">
              {item.variants.length} variants
            </Text>
          )}
        </TouchableOpacity>
      )}
    />
  );
}
