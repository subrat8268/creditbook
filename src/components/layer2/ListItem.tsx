import MoneyAmount from "@/src/components/ui/MoneyAmount";
import { colors, radius, spacing, typography } from "@/src/utils/theme";
import { ChevronRight } from "lucide-react-native";
import { memo } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import StatusBadge from "./StatusBadge";

type Status = "Paid" | "Pending" | "Overdue" | "Partially Paid" | "Advance";

type Props = {
  title: string;
  subtitle?: string;
  leftSlot?: React.ReactNode;
  onPress?: () => void;
  amount?: number;
  amountColor?: string;
  status?: Status;
  statusAlign?: "left" | "right";
  trailingSlot?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  footerLeft?: React.ReactNode;
  footerRight?: React.ReactNode;
  compact?: boolean;
  noMargin?: boolean;
  variant?: "card" | "row";
  bordered?: boolean;
};

export default memo(function ListItem({
  title,
  subtitle,
  leftSlot,
  onPress,
  amount,
  amountColor,
  status,
  statusAlign = "right",
  trailingSlot,
  secondaryAction,
  footerLeft,
  footerRight,
  compact = false,
  noMargin = false,
  variant = "card",
  bordered = false,
}: Props) {
  const Container = onPress ? Pressable : View;

  return (
    <Container
      onPress={onPress}
      style={[
        styles.container,
        variant === "row" ? styles.rowContainer : null,
        compact ? styles.compactContainer : null,
        noMargin ? styles.noMargin : null,
        bordered ? styles.borderedBottom : null,
      ]}
    >
      <View style={styles.mainRow}>
        {leftSlot ? <View style={styles.leftSlot}>{leftSlot}</View> : null}

        <View style={styles.content}>
          <Text style={typography.cardTitle} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={[typography.caption, styles.subtitle]} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        <View style={styles.trailing}>
          {amount !== undefined ? (
            <MoneyAmount
              value={amount}
              variant="title"
              color={amountColor}
              style={styles.amount}
            />
          ) : null}
          {status ? <StatusBadge status={status} align={statusAlign} /> : null}
          {!status && trailingSlot ? trailingSlot : null}
        </View>
      </View>

      {secondaryAction || footerLeft || footerRight || (onPress && !status && !trailingSlot) ? (
        <View style={styles.footerRow}>
          <View>{secondaryAction ?? footerLeft}</View>
          <View style={styles.footerRight}>
            {footerRight ??
              (onPress && !status && !trailingSlot ? (
                <View style={styles.detailsRow}>
                  <Text style={typography.caption}>View details</Text>
                  <ChevronRight size={14} color={colors.textSecondary} strokeWidth={2} />
                </View>
              ) : null)}
          </View>
        </View>
      ) : null}
    </Container>
  );
});

const shadowStyle: ViewStyle = {
  shadowColor: colors.textPrimary,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.04,
  shadowRadius: 8,
  elevation: 2,
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.cardPadding,
    marginBottom: spacing.md,
    ...shadowStyle,
  },
  rowContainer: {
    backgroundColor: "transparent",
    borderWidth: 0,
    borderRadius: 0,
    paddingHorizontal: 0,
    paddingVertical: spacing.md,
    marginBottom: 0,
    shadowColor: "transparent",
    elevation: 0,
  },
  compactContainer: {
    paddingVertical: spacing.md,
  },
  noMargin: {
    marginBottom: 0,
  },
  borderedBottom: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  mainRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  leftSlot: {
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
    marginRight: spacing.md,
  },
  subtitle: {
    marginTop: 2,
  },
  trailing: {
    alignItems: "flex-end",
    justifyContent: "flex-start",
    minWidth: 72,
    gap: spacing.xs,
  },
  amount: {
    fontWeight: "800",
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.lg,
  },
  footerRight: {
    alignItems: "flex-end",
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
});
