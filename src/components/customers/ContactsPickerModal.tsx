import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetFlatList,
} from "@gorhom/bottom-sheet";
import * as Contacts from "expo-contacts";
import { Check, Users, UserX, X } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Linking,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useCustomersStore } from "../../store/customersStore";
import { normalizePhone } from "../../utils/phone";
import { colors } from "../../utils/theme";
import SearchBar from "../ui/SearchBar";

export type ContactEntry = {
  id: string;
  name: string;
  phone: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onImport: (contacts: { name: string; phone: string }[]) => Promise<void>;
};

function isValidPhone(phone: string): boolean {
  return /^\+?[0-9]{10,15}$/.test(phone);
}

// ── Avatar utilities (mirrors CustomerCard / NewCustomerModal) ───────────────
const AVATAR_COLORS = [
  colors.danger,
  colors.warning,
  colors.primary,
  "#4F9CFF",
  "#9B59B6",
  "#E91E8C",
  "#00BCD4",
  "#FF5722",
] as const;

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length >= 2)
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}
// ─────────────────────────────────────────────────────────────────────────────

export default function ContactsPickerModal({
  visible,
  onClose,
  onImport,
}: Props) {
  const existingCustomers = useCustomersStore((s) => s.customers);

  // Build a normalised phone → true map for fast "already in KredBook" lookup
  const existingPhones = useMemo(() => {
    const set = new Set<string>();
    for (const c of existingCustomers) {
      set.add(normalizePhone(c.phone));
    }
    return set;
  }, [existingCustomers]);

  const [status, setStatus] = useState<"idle" | "loading" | "denied" | "ready">(
    "idle",
  );

  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["90%"], []);
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    [],
  );

  useEffect(() => {
    if (visible) {
      sheetRef.current?.expand();
    } else {
      sheetRef.current?.close();
    }
  }, [visible]);
  const [contacts, setContacts] = useState<ContactEntry[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [importing, setImporting] = useState(false);

  const loadContacts = useCallback(async () => {
    setStatus("loading");
    const { status: perm } = await Contacts.requestPermissionsAsync();
    if (perm !== "granted") {
      setStatus("denied");
      return;
    }
    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
    });
    const entries: ContactEntry[] = [];
    for (const c of data) {
      if (!c.name || !c.phoneNumbers?.length) continue;
      const rawPhone = c.phoneNumbers[0].number ?? "";
      const phone = normalizePhone(rawPhone);
      if (!isValidPhone(phone)) continue;
      entries.push({
        id: c.id ?? `${c.name}-${phone}`,
        name: c.name,
        phone,
      });
    }
    entries.sort((a, b) => a.name.localeCompare(b.name));
    setContacts(entries);
    setStatus("ready");
  }, []);

  useEffect(() => {
    if (visible) {
      setSelected(new Set());
      setSearch("");
      loadContacts();
    }
  }, [visible, loadContacts]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return q
      ? contacts.filter(
          (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q),
        )
      : contacts;
  }, [contacts, search]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    // Only select contacts not already in KredBook
    setSelected(
      new Set(
        filtered.filter((c) => !existingPhones.has(c.phone)).map((c) => c.id),
      ),
    );
  };

  const clearAll = () => setSelected(new Set());

  const handleImport = async () => {
    const chosen = contacts.filter((c) => selected.has(c.id));
    if (!chosen.length) return;
    setImporting(true);
    try {
      await onImport(chosen.map(({ name, phone }) => ({ name, phone })));
      onClose();
    } finally {
      setImporting(false);
    }
  };

  const allFilteredSelected =
    filtered.length > 0 &&
    filtered
      .filter((c) => !existingPhones.has(c.phone))
      .every((c) => selected.has(c.id));

  const importLabel =
    selected.size > 0
      ? `Import ${selected.size} Contact${selected.size === 1 ? "" : "s"}`
      : "Import Contacts";

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      onChange={(idx) => {
        if (idx === -1) onClose();
      }}
      handleIndicatorStyle={{ backgroundColor: colors.border, width: 40 }}
      backgroundStyle={{ borderTopLeftRadius: 28, borderTopRightRadius: 28 }}
    >
      {/* Header — hidden on denied (full sheet used for permission UI) */}
      {status !== "denied" && (
        <View className="flex-row items-start justify-between px-5 pt-3 pb-4">
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text
              className="text-[18px] font-bold"
              style={{ color: colors.textPrimary }}
            >
              Import Contacts
            </Text>
            <Text
              className="text-[13px] mt-0.5"
              style={{ color: colors.textSecondary }}
            >
              Select contacts to add as customers
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} hitSlop={8} className="mt-0.5">
            <X size={22} color={colors.textSecondary} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      )}

      {/* Search */}
      {status === "ready" && (
        <View className="px-5 pb-3">
          <SearchBar
            value={search}
            onChangeText={setSearch}
            placeholder="Search contacts..."
          />
        </View>
      )}

      {/* Select All / count row */}
      {status === "ready" && filtered.length > 0 && (
        <View className="flex-row items-center justify-between px-5 pb-2">
          <TouchableOpacity
            onPress={allFilteredSelected ? clearAll : selectAll}
            activeOpacity={0.7}
          >
            <Text
              className="text-[14px] font-semibold"
              style={{ color: colors.primary }}
            >
              {allFilteredSelected ? "Deselect All" : "Select All"}
            </Text>
          </TouchableOpacity>
          <Text className="text-[13px]" style={{ color: colors.textSecondary }}>
            {filtered.length} contact{filtered.length === 1 ? "" : "s"}
          </Text>
        </View>
      )}

      {/* Divider — hidden on denied */}
      {status !== "denied" && (
        <View style={{ height: 1, backgroundColor: colors.border }} />
      )}

      {/* Body states */}
      {status === "loading" && (
        <View className="items-center justify-center py-16">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {status === "denied" && (
        <View className="items-center justify-center px-8 py-12">
          {/* Icon in a soft red circle */}
          <View
            className="rounded-full items-center justify-center mb-6"
            style={{
              width: 96,
              height: 96,
              backgroundColor: colors.dangerBg,
            }}
          >
            <UserX size={48} color={colors.danger} strokeWidth={1.5} />
          </View>

          <Text
            className="text-[18px] font-bold text-center mb-2"
            style={{ color: colors.textPrimary }}
          >
            Contacts access denied
          </Text>

          <Text
            className="text-[13px] text-center mb-8 leading-5"
            style={{ color: colors.textSecondary }}
          >
            Enable in Settings &#8594; Privacy &#8594; Contacts
          </Text>

          {/* Outlined CTA */}
          <TouchableOpacity
            onPress={() => Linking.openSettings()}
            activeOpacity={0.8}
            className="w-full items-center justify-center rounded-xl"
            style={{
              height: 52,
              borderWidth: 1.5,
              borderColor: colors.border,
              backgroundColor: "#FFFFFF",
            }}
          >
            <Text
              className="text-[16px] font-semibold"
              style={{ color: colors.textPrimary }}
            >
              Open Settings
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {status === "ready" && filtered.length === 0 && (
        <View className="items-center justify-center py-16">
          <Users size={48} color={"#AEAEB2"} strokeWidth={1.5} />
          <Text className="mt-3" style={{ color: colors.textSecondary }}>
            No contacts found
          </Text>
        </View>
      )}

      {status === "ready" && filtered.length > 0 && (
        <BottomSheetFlatList
          data={filtered}
          keyExtractor={(item: ContactEntry) => item.id}
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }: { item: ContactEntry }) => {
            const isSelected = selected.has(item.id);
            const alreadyExists = existingPhones.has(item.phone);
            const avatarColor = getAvatarColor(item.name);

            return (
              <TouchableOpacity
                onPress={() => !alreadyExists && toggle(item.id)}
                activeOpacity={alreadyExists ? 1 : 0.7}
                className="flex-row items-center px-5 py-3"
                style={{
                  backgroundColor: isSelected ? colors.successBg : "#FFFFFF",
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                }}
              >
                {/* Checkbox */}
                <View
                  className="mr-3 items-center justify-center rounded"
                  style={{
                    width: 22,
                    height: 22,
                    borderWidth: 2,
                    borderColor: isSelected
                      ? colors.primary
                      : alreadyExists
                        ? colors.border
                        : "#AEAEB2",
                    backgroundColor: isSelected ? colors.primary : "#FFFFFF",
                  }}
                >
                  {isSelected && (
                    <Check size={13} color="#FFFFFF" strokeWidth={3} />
                  )}
                </View>

                {/* Avatar */}
                <View
                  className="rounded-full mr-3 items-center justify-center"
                  style={{
                    width: 44,
                    height: 44,
                    backgroundColor: avatarColor,
                    opacity: alreadyExists ? 0.5 : 1,
                  }}
                >
                  <Text
                    className="font-bold text-white"
                    style={{ fontSize: 15 }}
                  >
                    {getInitials(item.name)}
                  </Text>
                </View>

                {/* Name + phone */}
                <View className="flex-1">
                  <View
                    className="flex-row items-center flex-wrap"
                    style={{ gap: 6 }}
                  >
                    <Text
                      className="font-semibold"
                      style={{
                        color: alreadyExists ? "#AEAEB2" : colors.textPrimary,
                        fontSize: 15,
                      }}
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                    {alreadyExists && (
                      <View
                        className="rounded-full px-2 py-0.5"
                        style={{ backgroundColor: colors.paid.bg }}
                      >
                        <Text
                          className="text-[11px] font-semibold"
                          style={{ color: colors.paid.text }}
                        >
                          Already in KredBook
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text
                    className="text-[13px] mt-0.5"
                    style={{ color: colors.textSecondary }}
                  >
                    {item.phone}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* Footer */}
      {status === "ready" && (
        <View
          className="px-5 py-4"
          style={{ borderTopWidth: 1, borderTopColor: colors.border }}
        >
          <TouchableOpacity
            onPress={handleImport}
            disabled={selected.size === 0 || importing}
            activeOpacity={0.8}
            className="rounded-full items-center justify-center"
            style={{
              height: 52,
              backgroundColor:
                selected.size === 0 || importing
                  ? colors.border
                  : colors.primary,
            }}
          >
            {importing ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text
                className="text-[16px] font-bold"
                style={{
                  color: selected.size === 0 ? colors.textSecondary : "#FFFFFF",
                }}
              >
                {importLabel}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </BottomSheet>
  );
}
