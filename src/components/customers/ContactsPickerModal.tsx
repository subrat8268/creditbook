import * as Contacts from "expo-contacts";
import { AlertCircle, Check, Users, X } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Modal from "react-native-modal";
import { useCustomersStore } from "../../store/customersStore";
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

function cleanPhone(raw: string): string {
  return raw.replace(/[\s\-.()]/g, "");
}

function isValidPhone(phone: string): boolean {
  return /^\+?[0-9]{10,15}$/.test(phone);
}

// ── Avatar utilities (mirrors CustomerCard / NewCustomerModal) ───────────────
const AVATAR_COLORS = [
  colors.danger.DEFAULT,
  colors.warning.DEFAULT,
  colors.primary.DEFAULT,
  colors.info.DEFAULT,
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

  // Build a normalised phone → true map for fast "already in CreditBook" lookup
  const existingPhones = useMemo(() => {
    const set = new Set<string>();
    for (const c of existingCustomers) {
      set.add(cleanPhone(c.phone));
    }
    return set;
  }, [existingCustomers]);

  const [status, setStatus] = useState<"idle" | "loading" | "denied" | "ready">(
    "idle",
  );
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
      const phone = cleanPhone(rawPhone);
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
    // Only select contacts not already in CreditBook
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
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      style={{ margin: 0, justifyContent: "flex-end" }}
      statusBarTranslucent
      backdropOpacity={0.5}
      avoidKeyboard
      animationIn="slideInUp"
      animationOut="slideOutDown"
      useNativeDriver
    >
      <View className="bg-white rounded-t-2xl" style={{ maxHeight: "88%" }}>
        {/* Drag handle */}
        <View className="items-center pt-3 pb-1">
          <View
            className="rounded-full"
            style={{
              width: 36,
              height: 4,
              backgroundColor: colors.neutral[300],
            }}
          />
        </View>

        {/* Header */}
        <View className="flex-row items-start justify-between px-5 pt-3 pb-4">
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text
              className="text-[18px] font-bold"
              style={{ color: colors.neutral[900] }}
            >
              Import Contacts
            </Text>
            <Text
              className="text-[13px] mt-0.5"
              style={{ color: colors.neutral[500] }}
            >
              Select contacts to add as customers
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} hitSlop={8} className="mt-0.5">
            <X size={22} color={colors.neutral[500]} strokeWidth={2} />
          </TouchableOpacity>
        </View>

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
                style={{ color: colors.primary.DEFAULT }}
              >
                {allFilteredSelected ? "Deselect All" : "Select All"}
              </Text>
            </TouchableOpacity>
            <Text
              className="text-[13px]"
              style={{ color: colors.neutral[500] }}
            >
              {filtered.length} contact{filtered.length === 1 ? "" : "s"}
            </Text>
          </View>
        )}

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: colors.neutral[200] }} />

        {/* Body states */}
        {status === "loading" && (
          <View className="items-center justify-center py-16">
            <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
          </View>
        )}

        {status === "denied" && (
          <View className="items-center justify-center py-16 px-8">
            <AlertCircle
              size={48}
              color={colors.danger.DEFAULT}
              strokeWidth={1.5}
            />
            <Text
              className="text-center mt-3 leading-5"
              style={{ color: colors.neutral[500] }}
            >
              Contacts permission denied. Please enable it in Settings to import
              contacts.
            </Text>
          </View>
        )}

        {status === "ready" && filtered.length === 0 && (
          <View className="items-center justify-center py-16">
            <Users size={48} color={colors.neutral[400]} strokeWidth={1.5} />
            <Text className="mt-3" style={{ color: colors.neutral[500] }}>
              No contacts found
            </Text>
          </View>
        )}

        {status === "ready" && filtered.length > 0 && (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            style={{ flexShrink: 1 }}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const isSelected = selected.has(item.id);
              const alreadyExists = existingPhones.has(item.phone);
              const avatarColor = getAvatarColor(item.name);

              return (
                <TouchableOpacity
                  onPress={() => !alreadyExists && toggle(item.id)}
                  activeOpacity={alreadyExists ? 1 : 0.7}
                  className="flex-row items-center px-5 py-3"
                  style={{
                    backgroundColor: isSelected ? colors.success.bg : "#FFFFFF",
                    borderBottomWidth: 1,
                    borderBottomColor: colors.neutral[200],
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
                        ? colors.primary.DEFAULT
                        : alreadyExists
                          ? colors.neutral[300]
                          : colors.neutral[400],
                      backgroundColor: isSelected
                        ? colors.primary.DEFAULT
                        : "#FFFFFF",
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
                          color: alreadyExists
                            ? colors.neutral[400]
                            : colors.neutral[900],
                          fontSize: 15,
                        }}
                        numberOfLines={1}
                      >
                        {item.name}
                      </Text>
                      {alreadyExists && (
                        <View
                          className="rounded-full px-2 py-0.5"
                          style={{ backgroundColor: colors.success.light }}
                        >
                          <Text
                            className="text-[11px] font-semibold"
                            style={{ color: colors.success.text }}
                          >
                            Already in CreditBook
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text
                      className="text-[13px] mt-0.5"
                      style={{ color: colors.neutral[500] }}
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
            style={{ borderTopWidth: 1, borderTopColor: colors.neutral[200] }}
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
                    ? colors.neutral[200]
                    : colors.primary.DEFAULT,
              }}
            >
              {importing ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text
                  className="text-[16px] font-bold"
                  style={{
                    color:
                      selected.size === 0 ? colors.neutral[500] : "#FFFFFF",
                  }}
                >
                  {importLabel}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}

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

function cleanPhone(raw: string): string {
  // Remove spaces, dashes, parentheses, dots
  return raw.replace(/[\s\-.()]/g, "");
}

function isValidPhone(phone: string): boolean {
  return /^\+?[0-9]{10,15}$/.test(phone);
}

export default function ContactsPickerModal({
  visible,
  onClose,
  onImport,
}: Props) {
  const { t } = useTranslation();
  const [status, setStatus] = useState<"idle" | "loading" | "denied" | "ready">(
    "idle",
  );
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
      const phone = cleanPhone(rawPhone);
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
    setSelected(new Set(filtered.map((c) => c.id)));
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
    filtered.length > 0 && filtered.every((c) => selected.has(c.id));

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      style={{ margin: 0, justifyContent: "flex-end" }}
      statusBarTranslucent
      backdropOpacity={0.5}
    >
      <View className="bg-white rounded-t-2xl" style={{ maxHeight: "88%" }}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 pt-4 pb-3 border-b border-default">
          <Text className="text-lg font-bold text-textPrimary">
            {t("customers:importContacts")}
          </Text>
          <TouchableOpacity onPress={onClose} hitSlop={8}>
            <X size={24} color={colors.neutral[500]} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Search + Select-all row */}
        {status === "ready" && (
          <View className="px-4 pt-3 pb-1 gap-y-2">
            <TextInput
              placeholder={t("customers:search")}
              value={search}
              onChangeText={setSearch}
              className="border border-default rounded-lg px-3 py-2 text-textPrimary"
            />
            <View className="flex-row justify-between items-center">
              <Text className="text-xs text-textSecondary">
                {filtered.length} {t("customers:contactsFound")}
              </Text>
              <TouchableOpacity
                onPress={allFilteredSelected ? clearAll : selectAll}
              >
                <Text className="text-xs text-primary font-semibold">
                  {allFilteredSelected
                    ? t("customers:deselectAll")
                    : t("customers:selectAll")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Body states */}
        {status === "loading" && (
          <View className="items-center justify-center py-16">
            <ActivityIndicator size="large" color={colors.info.dark} />
          </View>
        )}

        {status === "denied" && (
          <View className="items-center justify-center py-16 px-8">
            <AlertCircle
              size={48}
              color={colors.danger.DEFAULT}
              strokeWidth={1.5}
            />
            <Text className="text-center text-textSecondary mt-3 leading-5">
              {t("customers:permissionDenied")}
            </Text>
          </View>
        )}

        {status === "ready" && filtered.length === 0 && (
          <View className="items-center justify-center py-16">
            <Users size={48} color={colors.neutral[400]} strokeWidth={1.5} />
            <Text className="text-textSecondary mt-3">
              {t("customers:noContactsFound")}
            </Text>
          </View>
        )}

        {status === "ready" && filtered.length > 0 && (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            style={{ flexShrink: 1 }}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const isSelected = selected.has(item.id);
              return (
                <TouchableOpacity
                  onPress={() => toggle(item.id)}
                  activeOpacity={0.7}
                  className={`flex-row items-center px-4 py-3 border-b border-default ${
                    isSelected ? "bg-blue-50" : "bg-white"
                  }`}
                >
                  <View
                    className={`w-5 h-5 rounded border-2 mr-3 items-center justify-center ${
                      isSelected
                        ? "bg-primary border-primary"
                        : "border-gray-400"
                    }`}
                  >
                    {isSelected && (
                      <Check size={12} color="white" strokeWidth={3} />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text
                      className="font-medium text-textPrimary"
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                    <Text className="text-sm text-textSecondary">
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
          <View className="px-4 py-4 border-t border-default">
            <TouchableOpacity
              onPress={handleImport}
              disabled={selected.size === 0 || importing}
              activeOpacity={0.8}
              className={`rounded-xl py-3 items-center ${
                selected.size === 0 || importing ? "bg-gray-300" : "bg-primary"
              }`}
            >
              {importing ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-base">
                  {selected.size > 0
                    ? t("customers:importSelected", { count: selected.size })
                    : t("customers:selectContacts")}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}
