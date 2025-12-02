import { Modal, View, TouchableOpacity, Text } from "react-native";
import { WebView } from "react-native-webview";

type PdfPreviewModalProps = {
  visible: boolean;
  onClose: () => void;
  url: string; // public URL (https...)
};

export default function PdfPreviewModal({
  visible,
  onClose,
  url,
}: PdfPreviewModalProps) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1 }}>
        <View
          style={{
            height: 56,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 12,
            borderBottomWidth: 1,
            borderColor: "#eee",
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "600" }}>
            Preview Invoice
          </Text>
          <TouchableOpacity onPress={onClose} style={{ padding: 8 }}>
            <Text style={{ color: "#007aff" }}>Close</Text>
          </TouchableOpacity>
        </View>

        <WebView source={{ uri: url }} style={{ flex: 1 }} />
      </View>
    </Modal>
  );
}
