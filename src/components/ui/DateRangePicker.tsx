import { useTheme } from "@/src/utils/ThemeProvider";
import { BottomSheetView } from "@gorhom/bottom-sheet";
import { memo, useCallback, useMemo, useState } from "react";
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import BaseBottomSheet from "../layer2/BaseBottomSheet";

interface DateRange {
  from?: string;
  to?: string;
}

interface Props {
  visible: boolean;
  value: DateRange;
  onChange: (range: DateRange) => void;
  onClose: () => void;
}

const YEARS = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function parseDate(str?: string): Date {
  if (!str) return new Date();
  return new Date(str + "T00:00:00");
}

function toDateStr(d: Date): string {
  return d.toISOString().substring(0, 10);
}

function formatDisplay(str?: string): string {
  if (!str) return "—";
  const d = new Date(str + "T00:00:00");
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const DAY_COUNT = 31;

interface PickerColumnProps {
  items: number[] | string[];
  selected: number;
  onChange: (index: number) => void;
  itemH: number;
}

const PickerColumn = memo(function PickerColumn({
  items,
  selected,
  onChange,
  itemH,
}: PickerColumnProps) {
  const { colors, typography } = useTheme();
  return (
    <View style={{ height: itemH * 3, overflow: "hidden" }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        snapToInterval={itemH}
        decelerationRate="fast"
        contentContainerStyle={{ paddingVertical: itemH }}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.y / itemH);
          onChange(Math.max(0, Math.min(idx, items.length - 1)));
        }}
      >
        {items.map((item, i) => {
          const isSelected = i === selected;
          return (
            <Pressable
              key={typeof item === "string" ? item : item}
              style={{ height: itemH, justifyContent: "center", alignItems: "center" }}
              onPress={() => onChange(i)}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: isSelected ? "700" : "400",
                  color: isSelected ? colors.textPrimary : colors.textSecondary,
                }}
              >
                {typeof item === "string" ? item : String(item).padStart(2, "0")}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
});

interface DatePickerSheetProps {
  title: string;
  value: Date;
  onConfirm: (d: Date) => void;
  onClose: () => void;
}

function DatePickerSheet({ title, value, onConfirm, onClose }: DatePickerSheetProps) {
  const { colors, spacing, typography } = useTheme();

  const [day, setDay] = useState(value.getDate() - 1);
  const [month, setMonth] = useState(value.getMonth());
  const [year, setYear] = useState(YEARS.indexOf(value.getFullYear()));
  const [showPicker, setShowPicker] = useState(true);

  const itemH = 40;
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const handleConfirm = useCallback(() => {
    const y = YEARS[year] ?? new Date().getFullYear();
    const d = new Date(y, month, day + 1);
    onConfirm(d);
    onClose();
  }, [day, month, year, onConfirm, onClose]);

  return (
    <BaseBottomSheet
      visible={showPicker}
      onClose={onClose}
      title={title}
      snapPoints={["55%"]}
    >
      <BottomSheetView style={{ paddingHorizontal: spacing.screenPadding }}>
        <View style={{ flexDirection: "row", gap: 8, marginBottom: spacing.lg }}>
          <View style={{ flex: 1 }}>
            <Text style={{ ...typography.caption, color: colors.textSecondary, marginBottom: 6, textAlign: "center" }}>Day</Text>
            <PickerColumn items={days} selected={day} onChange={setDay} itemH={itemH} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ ...typography.caption, color: colors.textSecondary, marginBottom: 6, textAlign: "center" }}>Month</Text>
            <PickerColumn items={MONTHS} selected={month} onChange={setMonth} itemH={itemH} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ ...typography.caption, color: colors.textSecondary, marginBottom: 6, textAlign: "center" }}>Year</Text>
            <PickerColumn items={YEARS} selected={year} onChange={setYear} itemH={itemH} />
          </View>
        </View>
        <Pressable
          style={{
            backgroundColor: colors.primary,
            borderRadius: 12,
            paddingVertical: 14,
            alignItems: "center",
          }}
          onPress={handleConfirm}
        >
          <Text style={{ color: colors.surface, fontWeight: "700", fontSize: 15 }}>Confirm</Text>
        </Pressable>
      </BottomSheetView>
    </BaseBottomSheet>
  );
}

const DateRangePicker = memo(function DateRangePicker({ visible, value, onChange, onClose }: Props) {
  const { colors, spacing, typography } = useTheme();
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const fromDate = parseDate(value.from);
  const toDate = parseDate(value.to);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          flexDirection: "row",
          gap: spacing.sm,
          marginBottom: spacing.md,
        },
        field: {
          flex: 1,
        },
        label: {
          ...typography.caption,
          color: colors.textSecondary,
          marginBottom: spacing.xs,
        },
        pill: {
          flexDirection: "row",
          alignItems: "center",
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 12,
          paddingHorizontal: spacing.md,
          paddingVertical: 12,
          backgroundColor: colors.background,
        },
        pillText: {
          flex: 1,
          ...typography.body,
          color: colors.textPrimary,
        },
        placeholder: {
          ...typography.body,
          color: colors.textSecondary,
        },
        clearBtn: {
          marginLeft: spacing.xs,
        },
        clearText: {
          color: colors.danger,
          fontSize: 12,
          fontWeight: "600",
        },
      }),
    [colors, spacing, typography],
  );

  return (
    <View>
      <View style={styles.row}>
        <View style={styles.field}>
          <Text style={styles.label}>From</Text>
          <Pressable style={styles.pill} onPress={() => setShowFromPicker(true)}>
            <Text style={value.from ? styles.pillText : styles.placeholder}>
              {value.from ? formatDisplay(value.from) : "Select start date"}
            </Text>
          </Pressable>
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>To</Text>
          <Pressable style={styles.pill} onPress={() => setShowToPicker(true)}>
            <Text style={value.to ? styles.pillText : styles.placeholder}>
              {value.to ? formatDisplay(value.to) : "Select end date"}
            </Text>
          </Pressable>
        </View>
      </View>

      {(value.from || value.to) && (
        <Pressable
          onPress={() => onChange({ from: undefined, to: undefined })}
          style={styles.clearBtn}
        >
          <Text style={styles.clearText}>Clear dates</Text>
        </Pressable>
      )}

      <DatePickerSheet
        title="Select From Date"
        value={fromDate}
        onConfirm={(d) => onChange({ ...value, from: toDateStr(d) })}
        onClose={() => setShowFromPicker(false)}
      />

      <DatePickerSheet
        title="Select To Date"
        value={toDate}
        onConfirm={(d) => onChange({ ...value, to: toDateStr(d) })}
        onClose={() => setShowToPicker(false)}
      />
    </View>
  );
});

export default DateRangePicker;