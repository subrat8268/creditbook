import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Modal from "react-native-modal";
interface AppModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}
export default function AppModal({
  visible,
  onClose,
  title,
  children,
}: AppModalProps) {
  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      avoidKeyboard
      statusBarTranslucent={Platform.OS === "android" ? true : false}
      backdropOpacity={0.5}
      animationIn="fadeIn"
      animationOut="fadeOut"
      useNativeDriver
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 20}
        style={{ flex: 1, justifyContent: "flex-end" }}
      >
        <View className="bg-white rounded-lg p-6">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-4">
            {title && (
              <Text className="text-lg font-inter-semibold">{title}</Text>
            )}
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
