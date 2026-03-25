import { colors } from "@/src/utils/theme";
import { Pencil, Trash2, X } from "lucide-react-native";
import { Modal, Text, TouchableOpacity, View } from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export default function ProductActionsModal({
  visible,
  onClose,
  onEdit,
  onDelete,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="relative bg-white border border-neutral-300 w-80 p-6 rounded-lg">
          <Text className="text-2xl text-center font-inter-semibold mb-4">
            Product Actions
          </Text>
          <TouchableOpacity
            onPress={onClose}
            className="absolute top-4 right-4"
          >
            <X size={20} color={colors.textSecondary} strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-primary flex-row items-center justify-center gap-3 py-3 rounded-md mb-3"
            onPress={onEdit}
          >
            <Pencil size={20} color="white" strokeWidth={2} />
            <Text className="text-center font-inter-medium text-lg text-white">
              Edit Product
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-danger flex-row items-center justify-center gap-3 py-3 rounded-md mb-3"
            onPress={onDelete}
          >
            <Trash2 size={20} color="white" strokeWidth={2} />
            <Text className="text-center font-inter-medium text-lg text-white">
              Delete Product
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="py-3 border border-neutral-300 rounded-md"
            onPress={onClose}
          >
            <Text className="text-center font-inter-medium text-lg text-neutral-900">
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
