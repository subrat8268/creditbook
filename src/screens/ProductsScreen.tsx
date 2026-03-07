import { Ionicons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, Text, View } from "react-native";
import * as Yup from "yup";

import { uploadImage } from "../api/upload";
import BottomSheetForm from "../components/BottomSheetForm";
import FloatingActionButton from "../components/FloatingActionButton";
import ScreenWrapper from "../components/ScreenWrapper";
import SearchBar from "../components/SearchBar";
import ProductActionsModal from "../components/products/ProductActionsModal";
import ProductCard from "../components/products/ProductCard";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import {
    useAddProduct,
    useDeleteProduct,
    useProducts,
    useUpdateProduct,
} from "../hooks/useProducts";
import { useAuthStore } from "../store/authStore";

type Variant = {
  name: string;
  price: number;
  imageUrl?: string;
};

type ProductFormValues = {
  name: string;
  base_price: string;
  image_url?: string;
  variants?: Variant[];
};

const productSchema = Yup.object().shape({
  name: Yup.string().required("Product name is required"),
  base_price: Yup.number()
    .typeError("Must be a number")
    .required("Base price is required")
    .min(0, "Must be at least 0"),
  variants: Yup.array().of(
    Yup.object().shape({
      name: Yup.string().required("Variant name is required"),
      price: Yup.number()
        .typeError("Must be a number")
        .required("Variant price is required")
        .min(0, "Must be at least 0"),
      imageUrl: Yup.string().nullable(),
    }),
  ),
  image_url: Yup.string().nullable(),
});

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
  const [isUploading, setIsUploading] = useState(false);

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

  const handleAddProduct = async (values: ProductFormValues) => {
    try {
      setIsUploading(true);

      // Upload main product image if it's a local URI
      let mainImageUrl = values.image_url;
      if (mainImageUrl && mainImageUrl.startsWith("file://")) {
        mainImageUrl = await uploadImage(mainImageUrl);
      }

      // Upload variant images if they're local URIs
      const processedVariants = await Promise.all(
        (values.variants || []).map(async (variant) => {
          let variantImageUrl = variant.imageUrl;
          if (variantImageUrl && variantImageUrl.startsWith("file://")) {
            variantImageUrl = await uploadImage(variantImageUrl);
          }
          return {
            ...variant,
            price: Number(variant.price),
            imageUrl: variantImageUrl || null,
          };
        }),
      );

      await addProductMutation.mutateAsync({
        name: values.name,
        base_price: Number(values.base_price),
        image_url: mainImageUrl || null,
        variants: processedVariants.length > 0 ? processedVariants : [],
      });

      setIsBottomSheetOpen(false);
    } catch (err: any) {
      console.error("Failed to add product:", err.message);
      alert("Failed to add product. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditProduct = async (values: ProductFormValues) => {
    if (!editingProduct) return;
    try {
      setIsUploading(true);

      // Upload main product image if it's a local URI
      let mainImageUrl = values.image_url;
      if (mainImageUrl && mainImageUrl.startsWith("file://")) {
        mainImageUrl = await uploadImage(mainImageUrl);
      }

      // Upload variant images if they're local URIs
      const processedVariants = await Promise.all(
        (values.variants || []).map(async (variant) => {
          let variantImageUrl = variant.imageUrl;
          if (variantImageUrl && variantImageUrl.startsWith("file://")) {
            variantImageUrl = await uploadImage(variantImageUrl);
          }
          return {
            ...variant,
            price: Number(variant.price),
            imageUrl: variantImageUrl || null,
          };
        }),
      );

      await updateProductMutation.mutateAsync({
        id: editingProduct.id,
        values: {
          name: values.name,
          base_price: Number(values.base_price),
          image_url: mainImageUrl || null,
          variants: processedVariants.length > 0 ? processedVariants : [],
        },
      });

      setEditingProduct(null);
      setIsBottomSheetOpen(false);
    } catch (err: any) {
      console.error("Failed to update product:", err.message);
      alert("Failed to update product. Please try again.");
    } finally {
      setIsUploading(false);
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
        renderItem={({ item }) => (
          <ProductCard
            name={item.name}
            basePrice={item.base_price}
            variants={item.variants}
            image={item.image_url || undefined}
            onOptionsPress={() => handleOptionsPress(item)}
          />
        )}
        ListEmptyComponent={
          !isLoading && !error ? (
            <View className="items-center mt-10">
              <Ionicons name="cube-outline" size={40} color="#9CA3AF" />
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

      <BottomSheetForm<ProductFormValues>
        visible={isBottomSheetOpen}
        title={editingProduct ? "Edit Product" : "Add Product"}
        isSubmitting={isUploading}
        initialValues={
          editingProduct
            ? {
                name: editingProduct.name,
                base_price: String(editingProduct.base_price),
                image_url: editingProduct.image_url || "",
                variants: editingProduct.variants ?? [],
              }
            : {
                name: "",
                base_price: "",
                image_url: "",
                variants: [],
              }
        }
        validationSchema={productSchema}
        fields={[
          { name: "name", label: "Product Name", placeholder: "Enter name" },
          {
            name: "base_price",
            label: "Base Price",
            placeholder: "Enter price",
            type: "number",
          },
          {
            name: "image_url",
            label: "Product Image (optional)",
            isImagePicker: true,
          },
        ]}
        variantFields={[
          {
            name: "name",
            label: "Variant Name",
            placeholder: "e.g., Small, Red, 500ml",
          },
          {
            name: "price",
            label: "Variant Price",
            placeholder: "Enter price",
            type: "number",
          },
          {
            name: "imageUrl",
            label: "Variant Image (optional)",
            isImagePicker: true,
          },
        ]}
        onClose={() => {
          setIsBottomSheetOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={editingProduct ? handleEditProduct : handleAddProduct}
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
