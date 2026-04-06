import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Keyboard, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetTextInput,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { ArrowLeft, Check, Plus, Search } from "lucide-react-native";
import { useProducts, useAddProduct } from "@/src/hooks/useProducts";
import Loader from "../feedback/Loader";

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
  const modalRef = useRef<BottomSheetModal>(null);
  const [search, setSearch] = useState("");
  const [activeProduct, setActiveProduct] = useState<MappedProduct | null>(null);
  const [lastAddedKey, setLastAddedKey] = useState<string | null>(null);

  const {
    data: products,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useProducts(vendorId, search);

  const addProductMutation = useAddProduct(vendorId);

  const snapPoints = useMemo(() => ["80%", "95%"], []);

  useEffect(() => {
    if (visible) {
      modalRef.current?.present();
    } else {
      modalRef.current?.dismiss();
      setActiveProduct(null);
      setSearch("");
      setLastAddedKey(null);
    }
  }, [visible]);

  const handleDismiss = useCallback(() => {
    onClose();
  }, [onClose]);

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
    setTimeout(() => {
      setLastAddedKey((prev) => (prev === key ? null : prev));
    }, 1200);
  };

  const handleSelectProduct = (item: MappedProduct) => {
    Keyboard.dismiss();
    if (item.variants && item.variants.length > 0) {
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

  const handleQuickAdd = async () => {
    if (!search.trim()) return;
    try {
      const name = search.trim();
      const newProduct = await addProductMutation.mutateAsync({
        name,
        base_price: 0,
        category: "General",
        image_url: null,
        variants: [], // Fix: variants is required by Product type
      });

      // Instantly add to cart
      addToCart(newProduct.id, newProduct.name, 0);
      setSearch(""); // clear search to show listing again
      flashAdded(newProduct.id);
    } catch (err) {
      console.error("Quick Add Failed:", err);
    }
  };

  const productItems: MappedProduct[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    base_price: p.base_price,
    variants: p.variants ?? [],
  }));

  const variantItems = useMemo(() => {
    if (!activeProduct) return [] as Variant[];
    const base: Variant[] =
      activeProduct.base_price !== null
        ? [{ id: "base", variant_name: "Base", price: activeProduct.base_price }]
        : [];
    return [...base, ...activeProduct.variants];
  }, [activeProduct]);

  const isVariantView = activeProduct !== null;

  return (
    <BottomSheetModal
      ref={modalRef}
      index={0}
      snapPoints={snapPoints}
      onDismiss={handleDismiss}
      backdropComponent={renderBackdrop}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      backgroundStyle={{ borderRadius: 28 }}
      handleIndicatorStyle={{ backgroundColor: "#D1D5DB", width: 40 }}
      enablePanDownToClose
    >
      <BottomSheetView className="flex-1 bg-background">
        
        {/* HEADER */}
        <View className="flex-row items-center px-4 py-3 bg-surface border-b border-border">
          {isVariantView && (
            <TouchableOpacity onPress={() => setActiveProduct(null)} hitSlop={8} className="mr-3">
              <ArrowLeft size={20} className="text-textPrimary" strokeWidth={2.2} />
            </TouchableOpacity>
          )}

          <View className="flex-1">
            <Text className="text-[17px] font-bold text-textPrimary" numberOfLines={1}>
              {isVariantView ? activeProduct.name : "Select Product"}
            </Text>
            {isVariantView && (
              <Text className="text-[12px] text-textSecondary mt-0.5">
                Select variant
              </Text>
            )}
          </View>

          <TouchableOpacity
            onPress={() => {
              Keyboard.dismiss();
              onClose();
            }}
            className="px-4 py-2 rounded-full bg-primary"
          >
            <Text className="text-surface font-bold text-[13px]">Done</Text>
          </TouchableOpacity>
        </View>

        {/* SEARCH BAR */}
        {!isVariantView && (
          <View className="px-4 py-3 bg-surface border-b border-border">
            <View className="flex-row items-center px-3 py-2.5 bg-background rounded-xl">
              <Search size={18} className="text-textSecondary" strokeWidth={2} />
              <BottomSheetTextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search or add products..."
                placeholderTextColor="#9CA3AF"
                style={{ flex: 1, marginLeft: 8, fontSize: 15, color: "#111827", padding: 0 }}
                autoCapitalize="words"
                returnKeyType="search"
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch("")} hitSlop={8}>
                  <Text className="text-textSecondary text-[13px] font-bold">Clear</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* CONTENT */}
        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <Loader message="Loading products..." />
          </View>
        ) : isVariantView ? (
          <BottomSheetFlatList<Variant>
            data={variantItems}
            keyExtractor={(v: Variant) => v.id}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40 }}
            renderItem={({ item: v }: { item: Variant }) => {
              const key = `${activeProduct.id}-${v.id}`;
              const added = lastAddedKey === key;
              return (
                <TouchableOpacity
                  onPress={() => handleSelectVariant(v)}
                  activeOpacity={0.8}
                  className={`flex-row items-center justify-between p-4 mb-3 rounded-2xl border-[1.5px] ${
                    added ? "bg-primaryLight border-primary" : "bg-surface border-border"
                  }`}
                >
                  <Text className="text-[15px] font-bold text-textPrimary flex-1">
                    {v.variant_name}
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <Text className="text-[14px] font-semibold text-textSecondary">
                      ₹{v.price.toLocaleString("en-IN")}
                    </Text>
                    {added && (
                      <View className="bg-primary rounded-full p-1 w-6 h-6 items-center justify-center">
                        <Check size={12} className="text-surface" strokeWidth={3} />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        ) : (
          <BottomSheetFlatList<MappedProduct>
            data={productItems}
            keyExtractor={(p: MappedProduct) => p.id}
            keyboardShouldPersistTaps="handled"
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40 }}
            ListFooterComponent={isFetchingNextPage ? <Loader message="Loading more..." /> : null}
            ListEmptyComponent={() => (
              <View className="mt-8">
                {search.trim().length > 0 ? (
                  <View className="items-center">
                    <Text className="text-[15px] text-textSecondary text-center mb-4">
                      No products found for {"\""}
                      {search.trim()}
                      {"\""}
                    </Text>
                    <TouchableOpacity
                      onPress={handleQuickAdd}
                      disabled={addProductMutation.isPending}
                      activeOpacity={0.8}
                      className="flex-row items-center justify-center py-3.5 px-5 rounded-2xl border-[1.5px] border-dashed border-primary bg-primaryLight w-full"
                    >
                      {addProductMutation.isPending ? (
                        <ActivityIndicator color="#000" />
                      ) : (
                        <>
                          <Plus size={18} className="text-primary" strokeWidth={2.5} />
                          <Text className="ml-2 text-[15px] font-extrabold text-primary">
                            Add {"\""}
                            {search.trim()}
                            {"\""} as new product
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View className="items-center py-8">
                    <Text className="text-[15px] text-textSecondary">Your catalog is empty.</Text>
                  </View>
                )}
              </View>
            )}
            renderItem={({ item }: { item: MappedProduct }) => {
              const added = lastAddedKey === item.id;
              return (
                <TouchableOpacity
                  onPress={() => handleSelectProduct(item)}
                  activeOpacity={0.8}
                  className={`p-4 mb-3 rounded-2xl border-[1.5px] ${
                    added ? "bg-primaryLight border-primary" : "bg-surface border-border"
                  }`}
                >
                  <View className="flex-row items-center justify-between">
                    <Text className="text-[15px] font-bold text-textPrimary flex-1 mr-2" numberOfLines={2}>
                      {item.name}
                    </Text>
                    <View className="flex-row items-center gap-2">
                      {item.base_price !== null && (
                        <Text className="text-[14px] font-semibold text-textSecondary flex-shrink-0">
                          ₹{item.base_price.toLocaleString("en-IN")}
                        </Text>
                      )}
                      
                      {added ? (
                        <View className="bg-primary rounded-full p-1 w-6 h-6 items-center justify-center">
                          <Check size={12} className="text-surface" strokeWidth={3} />
                        </View>
                      ) : item.variants.length > 0 ? (
                        <View className="px-2.5 py-1 rounded-lg bg-background border border-border">
                          <Text className="text-[12px] font-semibold text-textSecondary">
                            {item.variants.length} Variants ›
                          </Text>
                        </View>
                      ) : (
                        <View className="bg-primaryLight border border-primary px-3 py-1.5 rounded-xl">
                          <Text className="text-[12px] font-bold text-primary text-center">Add</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </BottomSheetView>
    </BottomSheetModal>
  );
}
