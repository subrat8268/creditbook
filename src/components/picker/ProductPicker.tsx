import { useProducts } from "@/src/hooks/useProducts";
import { colors } from "@/src/utils/theme";
import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetFlatList,
    BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import { ArrowLeft, Check, Plus } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Keyboard, Text, TouchableOpacity, View } from "react-native";
import EmptyState from "../feedback/EmptyState";
import Loader from "../feedback/Loader";
import SearchBar from "../ui/SearchBar";

interface Variant {
  id: string;
  variant_name: string;
  price: number;
}

interface MappedProduct {
  id: string;
  name: string;
  base_price: number | null;
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
}

export default function ProductPicker({
  visible,
  onClose,
  vendorId,
  addToCart,
}: ProductPickerProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  // Non-null = variant sub-view is active for this product.
  const [activeProduct, setActiveProduct] = useState<MappedProduct | null>(
    null,
  );
  // Key of the last-added item for the "Added!" flash (1.2 s).
  const [lastAddedKey, setLastAddedKey] = useState<string | null>(null);

  const {
    data: products,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useProducts(vendorId, search);

  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["80%", "95%"], []);

  useEffect(() => {
    if (visible) sheetRef.current?.expand();
    else sheetRef.current?.close();
  }, [visible]);

  // Reset sub-state when sheet closes so next open is clean.
  useEffect(() => {
    if (!visible) {
      setActiveProduct(null);
      setSearch("");
      setLastAddedKey(null);
    }
  }, [visible]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    [],
  );

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const flashAdded = (key: string) => {
    setLastAddedKey(key);
    setTimeout(
      () => setLastAddedKey((prev) => (prev === key ? null : prev)),
      1200,
    );
  };

  const handleSelectProduct = (item: MappedProduct) => {
    Keyboard.dismiss();
    if (item.variants && item.variants.length > 0) {
      // Switch to variant sub-view — do NOT close the sheet.
      setActiveProduct(item);
    } else if (item.base_price !== null) {
      addToCart(item.id, item.name, item.base_price);
      flashAdded(item.id);
    }
  };

  const handleSelectVariant = (variant: Variant) => {
    if (!activeProduct) return;
    addToCart(
      activeProduct.id,
      activeProduct.name,
      variant.price,
      variant.id,
      variant.variant_name,
    );
    flashAdded(`${activeProduct.id}-${variant.id}`);
  };

  const productItems: MappedProduct[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    base_price: p.base_price,
    variants: p.variants ?? [],
  }));

  // Base row (if base_price set) + variant rows for the active product.
  const variantItems = useMemo(() => {
    if (!activeProduct) return [] as Variant[];
    const base: Variant[] =
      activeProduct.base_price !== null
        ? [
            {
              id: "base",
              variant_name: "Base",
              price: activeProduct.base_price,
            },
          ]
        : [];
    return [...base, ...activeProduct.variants];
  }, [activeProduct]);

  const isVariantView = activeProduct !== null;

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      onClose={onClose}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      handleIndicatorStyle={{ backgroundColor: colors.border, width: 40 }}
      backgroundStyle={{ borderTopLeftRadius: 28, borderTopRightRadius: 28 }}
    >
      {/* ── Header ───────────────────────────────────────────── */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          backgroundColor: colors.surface,
          gap: 8,
        }}
      >
        {/* Back arrow in variant sub-view */}
        {isVariantView && (
          <TouchableOpacity onPress={() => setActiveProduct(null)} hitSlop={8}>
            <ArrowLeft size={20} color={colors.textPrimary} strokeWidth={2.2} />
          </TouchableOpacity>
        )}

        <Text
          style={{
            flex: 1,
            fontSize: 17,
            fontWeight: "700",
            color: colors.textPrimary,
          }}
          numberOfLines={1}
        >
          {isVariantView ? activeProduct.name : "Select Product"}
        </Text>

        {isVariantView && (
          <Text style={{ fontSize: 12, color: colors.textSecondary }}>
            Select variant
          </Text>
        )}

        {/* Done — explicit close so user can bulk-add without closing per item */}
        <TouchableOpacity
          onPress={() => {
            Keyboard.dismiss();
            onClose();
          }}
          style={{
            paddingHorizontal: 14,
            paddingVertical: 6,
            borderRadius: 20,
            backgroundColor: colors.primary,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>
            Done
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Search bar (product view only) ───────────────────── */}
      {!isVariantView && (
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 10,
            backgroundColor: colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <SearchBar
            value={search}
            onChangeText={setSearch}
            placeholder="Search products..."
          />
        </View>
      )}

      {/* ── Content ──────────────────────────────────────────── */}
      {isLoading ? (
        <BottomSheetView style={{ flex: 1 }}>
          <Loader message="Loading products..." />
        </BottomSheetView>
      ) : isVariantView ? (
        // ── Variant list ───────────────────────────────────
        <BottomSheetFlatList
          data={variantItems}
          keyExtractor={(v) => v.id}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: 24,
          }}
          renderItem={({ item: v }) => {
            const key = `${activeProduct!.id}-${v.id}`;
            const added = lastAddedKey === key;
            return (
              <TouchableOpacity
                onPress={() => handleSelectVariant(v)}
                activeOpacity={0.85}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 16,
                  marginBottom: 10,
                  borderRadius: 16,
                  backgroundColor: added ? colors.paid.bg : colors.surface,
                  borderWidth: 1.5,
                  borderColor: added ? colors.primary : colors.border,
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "600",
                    color: colors.textPrimary,
                    flex: 1,
                  }}
                >
                  {v.variant_name}
                </Text>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                  <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                    ₹{v.price.toLocaleString("en-IN")}
                  </Text>
                  {added && (
                    <View
                      style={{
                        backgroundColor: colors.primary,
                        borderRadius: 12,
                        padding: 3,
                      }}
                    >
                      <Check size={12} color="#fff" strokeWidth={3} />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
        />
      ) : (
        // ── Product list ───────────────────────────────────
        <BottomSheetFlatList
          data={productItems}
          keyExtractor={(p) => p.id}
          keyboardShouldPersistTaps="handled"
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: 24,
          }}
          ListHeaderComponent={
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
                marginBottom: 12,
                padding: 14,
                borderRadius: 14,
                borderWidth: 1.5,
                borderStyle: "dashed",
                borderColor: colors.primary,
                backgroundColor: colors.successBg,
              }}
            >
              <Plus size={16} color={colors.primary} strokeWidth={2.5} />
              <Text
                style={{
                  color: colors.primary,
                  fontWeight: "700",
                  fontSize: 14,
                }}
              >
                Add New Product
              </Text>
            </TouchableOpacity>
          }
          ListFooterComponent={
            isFetchingNextPage ? <Loader message="Loading more..." /> : null
          }
          ListEmptyComponent={<EmptyState message="No products found" />}
          renderItem={({ item }) => {
            const added = lastAddedKey === item.id;
            return (
              <TouchableOpacity
                onPress={() => handleSelectProduct(item)}
                activeOpacity={0.9}
                style={{
                  padding: 16,
                  marginBottom: 10,
                  backgroundColor: added ? colors.paid.bg : colors.surface,
                  borderWidth: 1.5,
                  borderColor: added ? colors.primary : colors.border,
                  borderRadius: 16,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "600",
                      color: colors.textPrimary,
                      flex: 1,
                      marginRight: 8,
                    }}
                    numberOfLines={2}
                  >
                    {item.name}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    {item.base_price !== null && (
                      <Text
                        style={{ fontSize: 14, color: colors.textSecondary }}
                      >
                        ₹{item.base_price.toLocaleString("en-IN")}
                      </Text>
                    )}
                    {added ? (
                      <View
                        style={{
                          backgroundColor: colors.primary,
                          borderRadius: 12,
                          padding: 3,
                        }}
                      >
                        <Check size={12} color="#fff" strokeWidth={3} />
                      </View>
                    ) : item.variants.length > 0 ? (
                      <View
                        style={{
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                          borderRadius: 8,
                          backgroundColor: colors.background,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            color: colors.textSecondary,
                          }}
                        >
                          {item.variants.length} variants ›
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </BottomSheet>
  );
}
