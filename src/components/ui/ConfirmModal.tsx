import { colors } from "@/src/utils/theme";
import { AlertTriangle } from "lucide-react-native";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import AppModal from "./Modal";

interface ConfirmModalProps {
  visible: boolean;
  /** Bold heading, e.g. "Delete Product?" */
  title: string;
  /** Descriptive body text */
  message: string;
  /** Label for the destructive action button — defaults to "Delete" */
  confirmLabel?: string;
  /** Label for the cancel button — defaults to "Cancel" */
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmModalProps) {
  return (
    <AppModal visible={visible} onClose={onCancel}>
      <View style={{ alignItems: "center", paddingVertical: 8 }}>
        {/* ── Warning icon circle ── */}
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: colors.danger.bg ?? "#FEF2F2",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <AlertTriangle
            size={28}
            color={colors.danger.DEFAULT}
            strokeWidth={2}
          />
        </View>

        {/* ── Title ── */}
        <Text
          style={{
            fontSize: 18,
            fontWeight: "700",
            color: colors.neutral[900],
            marginBottom: 10,
            textAlign: "center",
          }}
        >
          {title}
        </Text>

        {/* ── Message ── */}
        <Text
          style={{
            fontSize: 14,
            color: colors.neutral[500],
            textAlign: "center",
            lineHeight: 21,
            paddingHorizontal: 8,
            marginBottom: 28,
          }}
        >
          {message}
        </Text>

        {/* ── Delete (danger) button ── */}
        <TouchableOpacity
          onPress={onConfirm}
          disabled={loading}
          activeOpacity={0.8}
          style={{
            width: "100%",
            backgroundColor: loading
              ? colors.danger.DEFAULT + "88"
              : colors.danger.DEFAULT,
            borderRadius: 50,
            paddingVertical: 16,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 10,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text
              style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}
            >
              {confirmLabel}
            </Text>
          )}
        </TouchableOpacity>

        {/* ── Cancel button ── */}
        <TouchableOpacity
          onPress={onCancel}
          disabled={loading}
          activeOpacity={0.7}
          style={{
            width: "100%",
            borderRadius: 50,
            paddingVertical: 16,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: colors.neutral[200],
          }}
        >
          <Text
            style={{
              color: colors.neutral[700],
              fontWeight: "600",
              fontSize: 16,
            }}
          >
            {cancelLabel}
          </Text>
        </TouchableOpacity>
      </View>
    </AppModal>
  );
}
