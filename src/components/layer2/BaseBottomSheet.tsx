import { colors, spacing } from "@/src/utils/theme";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { X } from "lucide-react-native";
import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

type Props = {
  visible?: boolean;
  onClose: () => void;
  title?: string;
  snapPoints?: string[];
  children: React.ReactNode;
  footer?: React.ReactNode;
  withScroll?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

const BaseBottomSheet = forwardRef<BottomSheetModal, Props>(function BaseBottomSheet(
  {
    visible,
    onClose,
    title,
    snapPoints,
    children,
    footer,
    withScroll = true,
    contentContainerStyle,
  },
  ref,
) {
  const modalRef = useRef<BottomSheetModal>(null);
  const resolvedSnapPoints = useMemo(() => snapPoints ?? ["90%"], [snapPoints]);

  useImperativeHandle(ref, () => modalRef.current as BottomSheetModal, []);

  useEffect(() => {
    if (visible === undefined) return;
    if (visible) {
      modalRef.current?.present();
    } else {
      modalRef.current?.dismiss();
    }
  }, [visible]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    [],
  );

  const content = (
    <>
      {title ? (
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <X size={20} color={colors.textPrimary} strokeWidth={2} />
          </Pressable>
        </View>
      ) : null}
      {children}
      {footer}
    </>
  );

  return (
    <BottomSheetModal
      ref={modalRef}
      index={0}
      snapPoints={resolvedSnapPoints}
      backdropComponent={renderBackdrop}
      onDismiss={onClose}
      onChange={(index) => {
        if (index === -1) onClose();
      }}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      handleIndicatorStyle={styles.indicator}
      backgroundStyle={styles.background}
    >
      {withScroll ? (
        <BottomSheetScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.content,
            contentContainerStyle as object,
          ]}
        >
          {content}
        </BottomSheetScrollView>
      ) : (
        <View style={[styles.content, contentContainerStyle as object]}>{content}</View>
      )}
    </BottomSheetModal>
  );
});

export default memo(BaseBottomSheet);

const styles = StyleSheet.create({
  indicator: {
    backgroundColor: colors.border,
    width: 40,
  },
  background: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  content: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing["3xl"],
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  closeButton: {
    padding: spacing.xs,
  },
});
