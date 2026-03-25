import { useProducts } from "@/src/hooks/useProducts";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { useCallback, useState } from "react";
import { Keyboard, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../../utils/theme";
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
  base_price: number | null;
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
  const router = useRouter();
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
    variants: p.variants.map((v) => ({
      ...v,
      name: v.variant_name, // add display name without overwriting real UUID id
    })),
  }));

  const handleSelectProduct = (item: Product) => {
    Keyboard.dismiss(); // 🔑 dismiss keyboard
    if (item.variants && item.variants.length > 0) {
      setVariantSelection(item);
    } else if (item.base_price !== null) {
      addToCart(item.id, item.name, item.base_price);
    }
    onClose();
  };

  const addNewProductButton = (
    <TouchableOpacity
      onPress={() => {
        onClose();
        setTimeout(() => router.push("/(main)/products" as never), 350);
      }}
      activeOpacity={0.8}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        margin: 16,
        padding: 14,
        borderRadius: 14,
        borderWidth: 1.5,
        borderStyle: "dashed",
        borderColor: colors.primary.DEFAULT,
        backgroundColor: colors.success.bg,
      }}
    >
      <Plus size={16} color={colors.primary.DEFAULT} strokeWidth={2.5} />
      <Text
        style={{
          color: colors.primary.DEFAULT,
          fontWeight: "700",
          fontSize: 14,
        }}
      >
        Add New Product
      </Text>
    </TouchableOpacity>
  );

  return (
    <BottomSheetPicker
      visible={visible}
      onClose={onClose}
      title="Select Product"
      items={mappedProducts}
      headerExtra={addNewProductButton}
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
            <Text className="text-gray-700">
              {item.base_price !== null ? `₹${item.base_price}` : ""}
            </Text>
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
