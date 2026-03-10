import { Package } from "lucide-react-native";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, Text, View } from "react-native";

import NewProductModal, {
  type ProductSubmitValues,
} from "../components/products/NewProductModal";
import ProductActionsModal from "../components/products/ProductActionsModal";
import ProductCard from "../components/products/ProductCard";
import ScreenWrapper from "../components/ScreenWrapper";
import FloatingActionButton from "../components/ui/FloatingActionButton";
import SearchBar from "../components/ui/SearchBar";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import {
  useAddProduct,
  useDeleteProduct,
  useProducts,
  useUpdateProduct,
} from "../hooks/useProducts";
import { useAuthStore } from "../store/authStore";
import { colors } from "../utils/theme";

export default function ProductsScreen() {
  const { profile } = useAuthStore();
  const vendorId = profile?.id;
  const { t } = useTranslation();

  const [search, setSearch] = useState("");
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  const {
    data: products,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useProducts(vendorId, search);

  const addProductMutation = useAddProduct(vendorId!);
  const updateProductMutation = useUpdateProduct(vendorId!);
  const deleteProductMutation = useDeleteProduct(vendorId!);

  const handleAddProduct = async (values: ProductSubmitValues) => {
    try {
      await addProductMutation.mutateAsync({
        name: values.name,
        base_price: values.variants.length > 0 ? values.variants[0].price : 0,
        image_url: null,
        variants: values.variants as any,
      });
      setIsBottomSheetOpen(false);
    } catch (err: any) {
      console.error("Failed to add product:", err.message);
      alert("Failed to add product. Please try again.");
    }
  };

  const handleEditProduct = async (values: ProductSubmitValues) => {
    if (!editingProduct) return;
    try {
      await updateProductMutation.mutateAsync({
        id: editingProduct.id,
        values: {
          name: values.name,
          base_price: values.variants.length > 0 ? values.variants[0].price : 0,
          image_url: null,
          variants: values.variants as any,
        },
      });
      setEditingProduct(null);
      setIsBottomSheetOpen(false);
    } catch (err: any) {
      console.error("Failed to update product:", err.message);
      alert("Failed to update product. Please try again.");
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;
    try {
      await deleteProductMutation.mutateAsync(selectedProduct.id);
      setIsActionsOpen(false);
      setSelectedProduct(null);
    } catch (err: any) {
      console.error("Failed to delete product:", err.message);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const onLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleEndReached = useInfiniteScroll(onLoadMore, [
    hasNextPage,
    isFetchingNextPage,
  ]);

  const handleOptionsPress = (product: any) => {
    setSelectedProduct(product);
    setIsActionsOpen(true);
  };

  const PRODUCT_ITEM_H = 72;

  const renderProductItem = useCallback(
    ({ item }: { item: any }) => (
      <ProductCard
        name={item.name}
        basePrice={item.base_price}
        variants={item.variants}
        onOptionsPress={() => handleOptionsPress(item)}
      />
    ),
     
    [],
  );

  const handleEditPress = () => {
    if (!selectedProduct) return;
    setEditingProduct(selectedProduct);
    setIsActionsOpen(false);
    setIsBottomSheetOpen(true);
  };

  return (
    <ScreenWrapper>
      <View className="mb-4">
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder={t("products.search")}
        />
      </View>
      <FlatList
        data={products ?? []}
        keyExtractor={(item) => item.id}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onEndReached={handleEndReached}
        renderItem={renderProductItem}
        removeClippedSubviews={true}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        getItemLayout={(_, i) => ({
          length: PRODUCT_ITEM_H,
          offset: PRODUCT_ITEM_H * i,
          index: i,
        })}
        contentContainerStyle={{ paddingBottom: 80 }}
        ListEmptyComponent={
          !isLoading && !error ? (
            <View className="items-center mt-10">
              <Package
                size={40}
                color={colors.neutral[400]}
                strokeWidth={1.2}
              />
              <Text className="text-neutral-500 mt-2">No products found</Text>
            </View>
          ) : null
        }
      />

      <FloatingActionButton
        onPress={() => {
          setEditingProduct(null);
          setIsBottomSheetOpen(true);
        }}
      />

      <NewProductModal
        title={editingProduct ? "Edit" : "Add"}
        visible={isBottomSheetOpen}
        onClose={() => {
          setIsBottomSheetOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={editingProduct ? handleEditProduct : handleAddProduct}
        initialValues={
          editingProduct
            ? {
                name: editingProduct.name,
                variants: editingProduct.variants ?? [],
              }
            : undefined
        }
      />

      <ProductActionsModal
        visible={isActionsOpen}
        onClose={() => setIsActionsOpen(false)}
        onEdit={handleEditPress}
        onDelete={handleDeleteProduct}
      />
    </ScreenWrapper>
  );
}
