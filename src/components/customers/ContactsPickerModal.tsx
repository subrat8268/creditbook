/**
 * ContactsPickerModal
 * ───────────────────
 * Permission flow: idle → loading → ready | denied
 *
 * Mockups:
 *   • Contact Picker Modal.png   — granted state with checkboxes
 *   • Contact Picker Denied Modal.png — denied state with solid green CTA
 *
 * Key architectural decisions:
 * 1. BottomSheetFlatList is MANDATORY — prevents gesture conflicts with
 *    @gorhom/bottom-sheet's pan responder. A plain FlatList will intercept
 *    swipe-down gestures and break the sheet.
 * 2. Permission request is wrapped in a `permRequested` ref so it fires EXACTLY
 *    once per visibility cycle, even if the component re-renders during the
 *    async await (e.g. from a Zustand store update).
 * 3. Errors during permission/contact fetch fallback to "denied" state — never
 *    crash the sheet.
 * 4. "Open Settings" CTA is solid green (primary), matching the mockup.
 * 5. Checkboxes use rounded-[6px] with green fill when selected.
 * 6. Avatar uses soft pastel background + colored text (not solid bg) for better
 *    readability — matches the mockup's aesthetic.
 */

import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import * as Contacts from "expo-contacts";
import { Check, UserX, Users, X } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { usePeople } from "../../hooks/useCustomer";
import { useAuthStore } from "../../store/authStore";
import { normalizePhone } from "../../utils/phone";
import { colors } from "../../utils/theme";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ContactEntry = {
  id: string;
  name: string;
  phone: string;
};

type PermissionStatus = "idle" | "loading" | "denied" | "ready";

type Props = {
  visible: boolean;
  onClose: () => void;
  /** Receives only newly selected contacts (already-existing excluded). */
  onImport: (contacts: { name: string; phone: string }[]) => Promise<void>;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isValidPhone(phone: string): boolean {
  return /^\+?[0-9]{10,15}$/.test(phone);
}

// Paired soft-bg + vibrant-text avatar palette (design-system avatarPalette)
const AVATAR_COMBOS = [
  { bg: "#EFF6FF", text: "#4F9CFF" }, // blue
  { bg: "#F5F3FF", text: "#9B59B6" }, // purple
  { bg: "#FDF2F8", text: "#E91E8C" }, // pink
  { bg: "#ECFEFF", text: "#00BCD4" }, // cyan
  { bg: "#FFF7ED", text: "#FF5722" }, // deep orange
  { bg: "#FFFBEB", text: "#F59E0B" }, // amber
  { bg: "#FEF2F2", text: "#EF4444" }, // red
  { bg: "#F0FDF4", text: "#16A34A" }, // green
] as const;

function getAvatarCombo(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COMBOS[Math.abs(hash) % AVATAR_COMBOS.length];
}

function getInitials(name: string): string {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length >= 2)
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

// ─── ContactRow sub-component ─────────────────────────────────────────────────

type ContactRowProps = {
  item: ContactEntry;
  isSelected: boolean;
  alreadyExists: boolean;
  onToggle: () => void;
};

function ContactRow({
  item,
  isSelected,
  alreadyExists,
  onToggle,
}: ContactRowProps) {
  const combo = getAvatarCombo(item.name);

  return (
    <TouchableOpacity
      onPress={onToggle}
      disabled={alreadyExists}
      activeOpacity={alreadyExists ? 1 : 0.65}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 14,
        backgroundColor: isSelected ? colors.successBg : colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      {/* ── Checkbox ── */}
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 6,
          borderWidth: 2,
          borderColor: isSelected
            ? colors.primary
            : alreadyExists
              ? colors.border
              : colors.textSecondary,
          backgroundColor: isSelected ? colors.primary : colors.surface,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 14,
        }}
      >
        {isSelected && (
          <Check size={13} color={colors.surface} strokeWidth={3.5} />
        )}
      </View>

      {/* ── Avatar ── */}
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: alreadyExists ? colors.background : combo.bg,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 12,
        }}
      >
        <Text
          style={{
            fontSize: 14,
            fontWeight: "700",
            color: alreadyExists ? colors.textSecondary : combo.text,
          }}
        >
          {getInitials(item.name)}
        </Text>
      </View>

      {/* ── Name + phone ── */}
      <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 6,
            marginBottom: 2,
          }}
        >
          <Text
            numberOfLines={1}
            style={{
              fontSize: 15,
              fontWeight: "600",
              color: alreadyExists ? colors.textSecondary : colors.textPrimary,
            }}
          >
            {item.name}
          </Text>
          {alreadyExists && (
            <View
              style={{
                backgroundColor: colors.paid.bg,
                borderRadius: 99,
                paddingHorizontal: 8,
                paddingVertical: 2,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "600",
                  color: colors.paid.text,
                }}
              >
                Already in kredBook
              </Text>
            </View>
          )}
        </View>
        <Text style={{ fontSize: 13, color: colors.textSecondary }}>
          {item.phone}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ContactsPickerModal({
  visible,
  onClose,
  onImport,
}: Props) {
  const { profile } = useAuthStore();

  // ── Existing-customer phone lookup ───────────────────────────────────────────
  const { people: existingCustomers } = usePeople(profile?.id);
  const existingPhones = useMemo(() => {
    const set = new Set<string>();
    for (const c of existingCustomers) {
      if (c.phone) set.add(normalizePhone(c.phone));
    }
    return set;
  }, [existingCustomers]);

  // ── Bottom sheet ref & config ────────────────────────────────────────────────
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

  // ── State ────────────────────────────────────────────────────────────────────
  const [permStatus, setPermStatus] = useState<PermissionStatus>("idle");
  const [contacts, setContacts] = useState<ContactEntry[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [importing, setImporting] = useState(false);

  // Guard: ensure permission OS dialog fires exactly once per open cycle
  const permRequested = useRef(false);

  const loadContacts = useCallback(async () => {
    if (permRequested.current) return;
    permRequested.current = true;

    setPermStatus("loading");
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== "granted") {
        setPermStatus("denied");
        return;
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
      });

      const entries: ContactEntry[] = [];
      const seen = new Set<string>();

      for (const c of data) {
        if (!c.name || !c.phoneNumbers?.length) continue;
        const rawPhone = c.phoneNumbers[0]?.number ?? "";
        const phone = normalizePhone(rawPhone);
        if (!isValidPhone(phone)) continue;
        if (seen.has(phone)) continue; // de-duplicate
        seen.add(phone);
        entries.push({
          id: c.id ?? `${c.name}-${phone}`,
          name: c.name,
          phone,
        });
      }

      entries.sort((a, b) => a.name.localeCompare(b.name));
      setContacts(entries);
      setPermStatus("ready");
    } catch {
      // Fall back gracefully — never let an error crash the sheet
      setPermStatus("denied");
    }
  }, []);

  // Reset & load when sheet becomes visible
  useEffect(() => {
    if (visible) {
      permRequested.current = false;
      setSelected(new Set());
      setSearch("");
      setContacts([]);
      setPermStatus("idle");
      loadContacts();
    }
  }, [visible, loadContacts]);

  // ── Derived state ────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return contacts;
    return contacts.filter(
      (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q),
    );
  }, [contacts, search]);

  const selectableFiltered = useMemo(
    () => filtered.filter((c) => !existingPhones.has(c.phone)),
    [filtered, existingPhones],
  );

  const allSelected =
    selectableFiltered.length > 0 &&
    selectableFiltered.every((c) => selected.has(c.id));

  // ── Selection helpers ────────────────────────────────────────────────────────
  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(selectableFiltered.map((c) => c.id)));
    }
  };

  // ── Import ───────────────────────────────────────────────────────────────────
  // NOTE: onClose() is called AFTER setImporting(false) in the finally block
  // to avoid a "state update on unmounted component" warning. If onClose() ran
  // first, the sheet would close (potentially unmounting this component) before
  // the finally block could reset the loading state.
  const handleImport = async () => {
    const chosen = contacts.filter((c) => selected.has(c.id));
    if (!chosen.length) return;
    setImporting(true);
    let success = false;
    try {
      await onImport(chosen.map(({ name, phone }) => ({ name, phone })));
      success = true;
    } finally {
      setImporting(false);
    }
    if (success) onClose();
  };

  const importLabel =
    selected.size > 0
      ? `Import ${selected.size} Contact${selected.size === 1 ? "" : "s"}`
      : "Import Contacts";

  const ctaDisabled = selected.size === 0 || importing;

  // ── Render ───────────────────────────────────────────────────────────────────
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
      handleIndicatorStyle={{
        backgroundColor: colors.border,
        width: 40,
        height: 4,
        borderRadius: 2,
      }}
      backgroundStyle={{
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        backgroundColor: colors.surface,
      }}
    >
      {/* ════════════════════════════════════════════════════════════════════
          DENIED STATE
          Full-sheet centered layout — matches Contact Picker Denied Modal.png
      ════════════════════════════════════════════════════════════════════ */}
      {permStatus === "denied" && (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 32,
            paddingTop: 16,
            paddingBottom: 40,
          }}
        >
          {/* Crossed-out red person icon */}
          <View
            style={{
              width: 96,
              height: 96,
              borderRadius: 48,
              backgroundColor: colors.dangerBg,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            <UserX size={48} color={colors.danger} strokeWidth={1.5} />
          </View>

          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: colors.textPrimary,
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            Contacts access denied
          </Text>

          <Text
            style={{
              fontSize: 14,
              color: colors.textSecondary,
              textAlign: "center",
              lineHeight: 20,
              marginBottom: 40,
            }}
          >
            {"Enable in Settings → Privacy → Contacts"}
          </Text>

          {/* Solid green CTA — mockup shows full-width green pill button */}
          <TouchableOpacity
            onPress={() => Linking.openSettings()}
            activeOpacity={0.85}
            style={{
              width: "100%",
              height: 56,
              borderRadius: 20,
              backgroundColor: colors.primary,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontSize: 17,
                fontWeight: "800",
                color: colors.surface,
                letterSpacing: -0.2,
              }}
            >
              Open Settings
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          GRANTED STATE — Header + Search + List + Footer
          Matches Contact Picker Modal.png
      ════════════════════════════════════════════════════════════════════ */}
      {permStatus !== "denied" && (
        <>
          {/* ── Header ── */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              justifyContent: "space-between",
              paddingHorizontal: 20,
              paddingTop: 12,
              paddingBottom: 16,
            }}
          >
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "800",
                  color: colors.textPrimary,
                  letterSpacing: -0.3,
                }}
              >
                Import Contacts
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: colors.textSecondary,
                  marginTop: 2,
                }}
              >
                Select contacts to add as customers
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={{ marginTop: 2 }}
            >
              <X size={22} color={colors.textSecondary} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* ── Search (BottomSheetTextInput = keyboard + gesture safe) ── */}
          {permStatus === "ready" && (
            <View
              style={{
                marginHorizontal: 20,
                marginBottom: 12,
                flexDirection: "row",
                alignItems: "center",
                height: 46,
                backgroundColor: colors.background,
                borderRadius: 23,
                borderWidth: 1,
                borderColor: colors.border,
                paddingHorizontal: 14,
                gap: 8,
              }}
            >
              <Text style={{ fontSize: 16, color: colors.textSecondary }}>
                🔍
              </Text>
              <BottomSheetTextInput
                placeholder="Search contacts..."
                placeholderTextColor={colors.textSecondary}
                value={search}
                onChangeText={setSearch}
                style={{
                  flex: 1,
                  fontSize: 15,
                  color: colors.textPrimary,
                  paddingVertical: 0,
                }}
                returnKeyType="search"
                clearButtonMode="while-editing"
              />
            </View>
          )}

          {/* ── Select All / count row ── */}
          {permStatus === "ready" && filtered.length > 0 && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 20,
                paddingBottom: 10,
              }}
            >
              <TouchableOpacity onPress={toggleSelectAll} activeOpacity={0.7}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: colors.primary,
                  }}
                >
                  {allSelected ? "Deselect All" : "Select All"}
                </Text>
              </TouchableOpacity>
              <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                {filtered.length} contact{filtered.length === 1 ? "" : "s"}
              </Text>
            </View>
          )}

          {/* ── Divider ── */}
          <View
            style={{
              height: 1,
              backgroundColor: colors.border,
              marginBottom: 0,
            }}
          />

          {/* ── LOADING ── */}
          {(permStatus === "idle" || permStatus === "loading") && (
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 80,
              }}
            >
              <ActivityIndicator size="large" color={colors.primary} />
              <Text
                style={{
                  fontSize: 13,
                  color: colors.textSecondary,
                  marginTop: 16,
                }}
              >
                Loading contacts…
              </Text>
            </View>
          )}

          {/* ── EMPTY SEARCH RESULT ── */}
          {permStatus === "ready" && filtered.length === 0 && (
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 64,
              }}
            >
              <Users size={48} color={colors.textSecondary} strokeWidth={1.5} />
              <Text
                style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                  marginTop: 12,
                }}
              >
                {search ? "No contacts match your search" : "No contacts found"}
              </Text>
            </View>
          )}

          {/* ── CONTACT LIST ──
              BottomSheetFlatList is mandatory here.
              Using a plain FlatList inside a BottomSheet causes the list's
              scroll responder to fight the sheet's pan responder, which
              manifests as: list doesn't scroll, sheet closes on fast swipe. */}
          {permStatus === "ready" && filtered.length > 0 && (
            <BottomSheetFlatList
              data={filtered}
              keyExtractor={(item: ContactEntry) => item.id}
              style={{ flex: 1 }}
              keyboardShouldPersistTaps="handled"
              initialNumToRender={15}
              maxToRenderPerBatch={10}
              windowSize={5}
              renderItem={({ item }: { item: ContactEntry }) => (
                <ContactRow
                  item={item}
                  isSelected={selected.has(item.id)}
                  alreadyExists={existingPhones.has(item.phone)}
                  onToggle={() => toggle(item.id)}
                />
              )}
              ListFooterComponent={<View style={{ height: 8 }} />}
            />
          )}

          {/* ── Sticky footer CTA ── */}
          {permStatus === "ready" && (
            <View
              style={{
                paddingHorizontal: 20,
                paddingVertical: 16,
                borderTopWidth: 1,
                borderTopColor: colors.border,
              }}
            >
              <TouchableOpacity
                onPress={handleImport}
                disabled={ctaDisabled}
                activeOpacity={0.85}
                style={{
                  height: 56,
                  borderRadius: 20,
                  backgroundColor: ctaDisabled ? colors.border : colors.primary,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {importing ? (
                  <ActivityIndicator color={colors.surface} />
                ) : (
                  <Text
                    style={{
                      fontSize: 17,
                      fontWeight: "800",
                      letterSpacing: -0.2,
                      color: ctaDisabled
                        ? colors.textSecondary
                        : colors.surface,
                    }}
                  >
                    {importLabel}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </BottomSheet>
  );
}
