import { Package, Search, X, Plus } from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import NewProductModal, {
  type ProductSubmitValues,
} from "@/src/components/products/NewProductModal";
import ProductActionsModal from "@/src/components/products/ProductActionsModal";
import ProductCard from "@/src/components/products/ProductCard";
import ConfirmModal from "@/src/components/ui/ConfirmModal";
import { useInfiniteScroll } from "@/src/hooks/useInfiniteScroll";
import {
  useAddProduct,
  useDeleteProduct,
  useProductCategories,
  useProducts,
  useUpdateProduct,
} from "@/src/hooks/useProducts";
import { useAuthStore } from "@/src/store/authStore";
import { useRouter } from "expo-router";

export default function ProductsScreen() {
  const { profile } = useAuthStore();
  const vendorId = profile?.id;
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    data: products,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useProducts(vendorId, search);

  const { data: categoryList = [] } = useProductCategories(vendorId);

  const filteredProducts = useMemo(() => {
    if (!activeCategory) return products ?? [];
    return (products ?? []).filter(
      (p) => (p.category ?? "").toLowerCase() === activeCategory.toLowerCase(),
    );
  }, [products, activeCategory]);

  const totalCount = useMemo(() => filteredProducts.length, [filteredProducts]);

  const addProductMutation = useAddProduct(vendorId!);
  const updateProductMutation = useUpdateProduct(vendorId!);
  const deleteProductMutation = useDeleteProduct(vendorId!);

  // ── Handlers ────────────────────────────────────────────
  const handleAddProduct = async (values: ProductSubmitValues) => {
    try {
      await addProductMutation.mutateAsync({
        name: values.name,
        base_price: values.base_price,
        category: values.category || "General",
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
          base_price: values.base_price,
          category: values.category || "General",
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
      setShowDeleteConfirm(false);
      setSelectedProduct(null);
    } catch (err: any) {
      console.error("Failed to delete product:", err.message);
    }
  };

  const handleRequestDelete = () => {
    setIsActionsOpen(false);
    setTimeout(() => setShowDeleteConfirm(true), 300);
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

  const handleEditPress = () => {
    if (!selectedProduct) return;
    setEditingProduct(selectedProduct);
    setIsActionsOpen(false);
    setIsBottomSheetOpen(true);
  };

  const handleSelectCategory = (value: string) => {
    setActiveCategory(value);
  };

  const renderProductItem = useCallback(
    ({ item }: { item: any }) => (
      <ProductCard
        name={item.name}
        basePrice={item.base_price}
        variants={item.variants}
        onPress={() =>
          router.push({
            pathname: "/(main)/products/[productId]",
            params: {
              productId: item.id,
              productData: JSON.stringify(item),
            },
          } as any)
        }
        onOptionsPress={() => handleOptionsPress(item)}
      />
    ),
    [router],
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "left", "right"]}>
      {/* ── Header ── */}
      <View className="flex-row items-center px-5 pb-3">
        <View className="flex-1 flex-row items-center gap-3">
          <Text className="text-[28px] font-black text-textPrimary tracking-tight">Products</Text>
          {totalCount > 0 && (
            <View className="bg-successLight rounded-full px-3 py-1">
              <Text className="text-[13px] font-extrabold text-success">{totalCount}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={() => setSearch("")} hitSlop={10} className="w-10 h-10 items-end justify-center">
          <Search size={24} className="text-textSecondary" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* ── Search bar ── */}
      <View className="px-5 pb-4">
        <View className="flex-row items-center bg-surface rounded-full border border-border px-4 py-3 shadow-sm">
          <Search size={18} className="text-textSecondary mr-2" strokeWidth={2.5} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search products to add in bill..."
            placeholderTextColor="#9ca3af"
            className="flex-1 text-[15px] font-semibold text-textPrimary"
            style={{ padding: 0 }}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")} hitSlop={10}>
              <X size={16} className="text-textSecondary" strokeWidth={2.5} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Category chips ── */}
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16, gap: 10 }}
        >
          {[
            { label: "All", value: "" },
            ...categoryList.map((c) => ({ label: c, value: c })),
          ].map((cat) => {
            const isActive = activeCategory === cat.value;
            return (
              <TouchableOpacity
                key={cat.value || "__all__"}
                onPress={() => handleSelectCategory(cat.value)}
                activeOpacity={0.8}
                className={`px-4 py-2 rounded-full border ${
                  isActive ? "bg-primary border-primary" : "bg-surface border-border"
                } shadow-sm`}
              >
                <Text
                  className={`text-[14px] ${
                    isActive ? "font-extrabold text-surface" : "font-semibold text-textSecondary"
                  }`}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── List ── */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onEndReached={handleEndReached}
        renderItem={renderProductItem}
        removeClippedSubviews={true}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
        ListEmptyComponent={
          !isLoading && !error ? (
            <View className="items-center justify-center mt-12 bg-surface rounded-3xl p-8 border border-border shadow-sm">
              <View className="w-20 h-20 rounded-full bg-background items-center justify-center mb-4 border border-border">
                <Package size={40} className="text-textSecondary opacity-50" strokeWidth={1.5} />
              </View>
              <Text className="text-[18px] font-black text-textPrimary mb-1">
                No products found
              </Text>
              <Text className="text-[14px] font-semibold text-textSecondary text-center px-4">
                Add products to your catalog to instantly search and invoice them in your bills.
              </Text>
            </View>
          ) : null
        }
      />

      {/* ── FAB ── */}
      <TouchableOpacity
        onPress={() => {
          setEditingProduct(null);
          setIsBottomSheetOpen(true);
        }}
        activeOpacity={0.8}
        className="absolute bottom-6 right-6 w-16 h-16 rounded-full bg-success items-center justify-center shadow-lg elevation-xl"
        style={{
          shadowColor: "#16A34A", 
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 10,
          elevation: 10,
        }}
      >
        <Plus size={30} className="text-surface" strokeWidth={2.5} />
      </TouchableOpacity>

      {/* ── Modals ── */}
      <NewProductModal
        title={editingProduct ? "Edit" : "Add"}
        visible={isBottomSheetOpen}
        onClose={() => {
          setIsBottomSheetOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={editingProduct ? handleEditProduct : handleAddProduct}
        onDelete={editingProduct ? handleRequestDelete : undefined}
        initialValues={
          editingProduct
            ? {
                name: editingProduct.name,
                base_price: editingProduct.base_price,
                variants: editingProduct.variants ?? [],
              }
            : undefined
        }
      />

      <ProductActionsModal
        visible={isActionsOpen}
        onClose={() => setIsActionsOpen(false)}
        onEdit={handleEditPress}
        onDelete={handleRequestDelete}
      />

      <ConfirmModal
        visible={showDeleteConfirm}
        title="Delete Product?"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDeleteProduct}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setSelectedProduct(null);
        }}
        loading={deleteProductMutation.isPending}
      />
    </SafeAreaView>
  );
}
