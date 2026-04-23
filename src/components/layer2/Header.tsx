import { colors, spacing, typography } from "@/src/utils/theme";
import { ArrowLeft } from "lucide-react-native";
import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
};

export default memo(function Header({ title, subtitle, onBack, rightAction }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.leading}>
        {onBack ? (
          <Pressable onPress={onBack} style={styles.backButton} hitSlop={8}>
            <ArrowLeft size={22} color={colors.textPrimary} strokeWidth={2} />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.center}>
        <Text style={typography.sectionTitle} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[typography.caption, styles.subtitle]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View style={styles.trailing}>{rightAction}</View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.sm,
  },
  leading: {
    width: 36,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  center: {
    flex: 1,
  },
  trailing: {
    minWidth: 36,
    alignItems: "flex-end",
  },
  backButton: {
    paddingVertical: spacing.xs,
    paddingRight: spacing.xs,
  },
  subtitle: {
    marginTop: spacing.xs,
  },
});
