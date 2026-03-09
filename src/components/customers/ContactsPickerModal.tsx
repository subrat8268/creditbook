import * as Contacts from "expo-contacts";
import { AlertCircle, Check, Users, X } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    ActivityIndicator,
    FlatList,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Modal from "react-native-modal";

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
            <AlertCircle size={48} color={colors.danger.DEFAULT} strokeWidth={1.5} />
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
