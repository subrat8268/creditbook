import { Package, Search, X } from "lucide-react-native";
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
import FloatingActionButton from "@/src/components/ui/FloatingActionButton";
import { useInfiniteScroll } from "@/src/hooks/useInfiniteScroll";
import {
    useAddProduct,
    useDeleteProduct,
    useProducts,
    useUpdateProduct,
} from "@/src/hooks/useProducts";
import { useAuthStore } from "@/src/store/authStore";
import { colors, spacing, typography } from "@/src/utils/theme";

// ── Category chips ────────────────────────────────────────
// "keyword" is sent as the search query when chip is selected.
// Add more categories here as the catalog grows.
const CATEGORIES = [
  { label: "All", keyword: "" },
  { label: "Rice & Grains", keyword: "rice" },
  { label: "Oils", keyword: "oil" },
  { label: "Dairy", keyword: "butter" },
  { label: "Dal", keyword: "dal" },
  { label: "Drinks", keyword: "cola" },
];

export default function ProductsScreen() {
  const { profile } = useAuthStore();
  const vendorId = profile?.id;

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [searchVisible, setSearchVisible] = useState(false);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Combine the free-text search and category keyword
  const effectiveSearch = search || activeCategory;

  const {
    data: products,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useProducts(vendorId, effectiveSearch);

  const addProductMutation = useAddProduct(vendorId!);
  const updateProductMutation = useUpdateProduct(vendorId!);
  const deleteProductMutation = useDeleteProduct(vendorId!);

  const totalCount = useMemo(() => (products ?? []).length, [products]);

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

  const handleSelectCategory = (keyword: string) => {
    setActiveCategory(keyword);
    setSearch(""); // clear free-text when picking a chip
    setSearchVisible(false); // hide search bar
  };

  const handleToggleSearch = () => {
    setSearchVisible((v) => {
      if (v) setSearch(""); // clear on hide
      return !v;
    });
  };

  const PRODUCT_ITEM_H = 70;

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

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top", "left", "right"]}
    >
      {/* ── Header ── */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: spacing.screenPadding,
          paddingBottom: spacing.sm,
          paddingTop: 4,
          backgroundColor: colors.background,
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
          }}
        >
          <Text style={{ ...typography.screenTitle }}>Products</Text>
          {totalCount > 0 && (
            <View
              style={{
                backgroundColor: colors.paid.bg,
                borderRadius: 20,
                paddingHorizontal: 10,
                paddingVertical: 3,
              }}
            >
              <Text
                style={{
                  color: colors.primary,
                  fontSize: 13,
                  fontWeight: "700",
                }}
              >
                {totalCount}
              </Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          onPress={handleToggleSearch}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Search size={22} color={colors.textSecondary} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* ── Search bar — always visible ── */}
      <View
        style={{
          paddingHorizontal: spacing.screenPadding,
          paddingBottom: spacing.sm,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.surface,
            borderRadius: 50,
            borderWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: 16,
            paddingVertical: 11,
            gap: 8,
          }}
        >
          <Search size={16} color={colors.textSecondary} strokeWidth={2} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search products to add in bill..."
            placeholderTextColor={colors.textSecondary}
            style={{ flex: 1, fontSize: 14, color: colors.textPrimary }}
          />
          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearch("")}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <X size={14} color={colors.textSecondary} strokeWidth={2} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Category chips — always visible ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing.screenPadding,
          paddingBottom: spacing.sm,
          gap: spacing.sm,
        }}
      >
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.keyword;
          return (
            <TouchableOpacity
              key={cat.label}
              onPress={() => handleSelectCategory(cat.keyword)}
              activeOpacity={0.75}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 50,
                backgroundColor: isActive ? colors.primary : colors.surface,
                borderWidth: 1,
                borderColor: isActive ? colors.primary : colors.border,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: isActive ? "700" : "500",
                  color: isActive ? colors.surface : colors.textSecondary,
                }}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ── List ── */}
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
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingBottom: 100,
        }}
        ListEmptyComponent={
          !isLoading && !error ? (
            <View style={{ alignItems: "center", marginTop: 60 }}>
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: colors.background,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <Package
                  size={36}
                  color={colors.textSecondary}
                  strokeWidth={1.2}
                />
              </View>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: colors.textPrimary,
                  marginBottom: 6,
                }}
              >
                No products found
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: colors.textSecondary,
                  textAlign: "center",
                  paddingHorizontal: 40,
                }}
              >
                Add products to see them in search when creating a bill
              </Text>
            </View>
          ) : null
        }
      />

      {/* ── FAB ── */}
      <FloatingActionButton
        onPress={() => {
          setEditingProduct(null);
          setIsBottomSheetOpen(true);
        }}
      />

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
