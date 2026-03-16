import { useMemo, useState } from "react";
import { Keyboard, Text, TouchableOpacity } from "react-native";
import BottomSheetPicker from "./BottomSheetPicker";

interface Variant {
  id: string;
  variant_name: string;
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

interface VariantPickerProps {
  visible: boolean;
  product: Product;
  onSelect: (
    variantId: string | null,
    variantName: string,
    price: number,
  ) => void;
  onClose: () => void;
}

export default function VariantPicker({
  visible,
  product,
  onSelect,
  onClose,
}: VariantPickerProps) {
  const [search, setSearch] = useState("");

  // Combine base option (only when base_price is set) + variants.
  // For variant-only products base_price is null — no "Base" fallback row is shown.
  const items = useMemo(() => {
    const baseOption =
      product.base_price !== null
        ? [{ id: "base", variant_name: "Base", price: product.base_price }]
        : [];
    return baseOption.concat(
      product.variants.filter((v) =>
        v.variant_name.toLowerCase().includes(search.toLowerCase()),
      ),
    );
  }, [product, search]);

  const handleSelect = (item: (typeof items)[0]) => {
    Keyboard.dismiss();
    if (item.id === "base") {
      onSelect(null, "Base", item.price);
    } else {
      onSelect(item.id, item.variant_name, item.price);
    }
    onClose(); // close bottomsheet immediately
  };

  return (
    <BottomSheetPicker
      visible={visible}
      onClose={onClose}
      title={`Select Variant for ${product.name}`}
      items={items}
      search={search}
      setSearch={setSearch}
      keyExtractor={(item) => item.id}
      renderItem={(item) => (
        <TouchableOpacity
          className="p-4 mb-3 bg-white border border-gray-200 rounded-2xl shadow-smz"
          onPress={() => handleSelect(item)}
        >
          <Text>
            {item.variant_name} - ₹{item.price}
          </Text>
        </TouchableOpacity>
      )}
    />
  );
}
