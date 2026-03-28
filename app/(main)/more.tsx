import { useAuthStore } from "@/src/store/authStore";
import { colors } from "@/src/utils/theme";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Href, useFocusEffect, useRouter } from "expo-router";
import {
    BarChart3,
    BookOpen,
    ChevronRight,
    Download,
    HelpCircle,
    LogOut,
    LucideIcon,
    ShoppingBag,
    UserRound,
} from "lucide-react-native";
import { useCallback, useRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type MenuItem = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  route: Href;
};

const BUSINESS_DETAILS: MenuItem[] = [
  {
    id: "profile",
    title: "Profile Settings",
    description: "Business details & preferences",
    icon: UserRound,
    iconBg: "#DCFCE7",
    iconColor: "#16A34A",
    route: "/(main)/profile",
  },
  {
    id: "products",
    title: "Inventory Management",
    description: "Stock tracking & product ledgers",
    icon: BookOpen,
    iconBg: "#DBEAFE",
    iconColor: "#2563EB",
    route: "/(main)/products",
  },
  {
    id: "suppliers-wholesale",
    title: "Suppliers & Wholesale",
    description: "Bulk purchase history & credit",
    icon: ShoppingBag,
    iconBg: "#FEF3C7",
    iconColor: "#D97706",
    route: "/(main)/suppliers",
  },
];

const ANALYSIS_TOOLS: MenuItem[] = [
  {
    id: "reports",
    title: "Advanced Reports",
    description: "Weekly insights & performance",
    icon: BarChart3,
    iconBg: "#EDE9FE",
    iconColor: "#7C3AED",
    route: "/(main)/reports",
  },
  {
    id: "export",
    title: "Data Export",
    description: "Download PDF, Excel or CSV files",
    icon: Download,
    iconBg: "#F3F4F6",
    iconColor: "#374151",
    route: "/(main)/export",
  },
];

function MenuItemRow({
  item,
  onPress,
}: {
  item: MenuItem;
  onPress: () => void;
}) {
  const IconComp = item.icon;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={styles.menuItem}
    >
      <View style={[styles.iconBox, { backgroundColor: item.iconBg }]}>
        <IconComp size={20} color={item.iconColor} strokeWidth={2} />
      </View>
      <View style={styles.menuText}>
        <Text style={styles.menuTitle}>{item.title}</Text>
        <Text style={styles.menuDesc}>{item.description}</Text>
      </View>
      <ChevronRight size={18} color={colors.textSecondary} strokeWidth={1.5} />
    </TouchableOpacity>
  );
}

export default function MoreScreen() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const sheetRef = useRef<BottomSheet>(null);
  const isNavigatingRef = useRef(false);

  // Re-expand the sheet every time the tab gains focus (handles second-open)
  useFocusEffect(
    useCallback(() => {
      isNavigatingRef.current = false;
      const timer = setTimeout(() => {
        sheetRef.current?.expand();
      }, 50);
      return () => clearTimeout(timer);
    }, []),
  );

  // Only go back when the user manually dismisses the sheet (swipe/tap backdrop)
  const handleClose = useCallback(() => {
    if (!isNavigatingRef.current) {
      router.back();
    }
  }, [router]);

  const handleNavAndClose = useCallback(
    (route: Href) => {
      isNavigatingRef.current = true;
      router.push(route);
    },
    [router],
  );

  const handleSignOut = useCallback(() => {
    isNavigatingRef.current = true;
    sheetRef.current?.close();
    setTimeout(() => logout(), 300);
  }, [logout]);

  return (
    <View style={styles.overlay}>
      <TouchableOpacity
        style={StyleSheet.absoluteFillObject}
        onPress={() => sheetRef.current?.close()}
        activeOpacity={1}
      />
      <BottomSheet
        ref={sheetRef}
        index={0}
        snapPoints={["85%"]}
        onClose={handleClose}
        enablePanDownToClose
        handleIndicatorStyle={styles.handle}
        backgroundStyle={styles.sheetBg}
      >
        <BottomSheetScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Business Details */}
          <Text style={styles.sectionLabel}>BUSINESS DETAILS</Text>
          <View style={styles.section}>
            {BUSINESS_DETAILS.map((item, index) => (
              <View key={item.id}>
                <MenuItemRow
                  item={item}
                  onPress={() => handleNavAndClose(item.route)}
                />
                {index < BUSINESS_DETAILS.length - 1 && (
                  <View style={styles.divider} />
                )}
              </View>
            ))}
          </View>

          {/* Analysis & Tools */}
          <Text style={[styles.sectionLabel, { marginTop: 20 }]}>
            ANALYSIS & TOOLS
          </Text>
          <View style={styles.section}>
            {ANALYSIS_TOOLS.map((item, index) => (
              <View key={item.id}>
                <MenuItemRow
                  item={item}
                  onPress={() => handleNavAndClose(item.route)}
                />
                {index < ANALYSIS_TOOLS.length - 1 && (
                  <View style={styles.divider} />
                )}
              </View>
            ))}
          </View>

          {/* Bottom Actions */}
          <View style={styles.bottomRow}>
            <TouchableOpacity style={styles.bottomBtn} activeOpacity={0.7}>
              <HelpCircle
                size={24}
                color={colors.textSecondary}
                strokeWidth={1.5}
              />
              <Text style={styles.bottomBtnText}>Help Center</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.bottomBtn, styles.signOutBtn]}
              onPress={handleSignOut}
              activeOpacity={0.7}
            >
              <LogOut size={24} color={colors.danger} strokeWidth={1.5} />
              <Text style={[styles.bottomBtnText, { color: colors.danger }]}>
                Sign Out
              </Text>
            </TouchableOpacity>
          </View>
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheetBg: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handle: {
    backgroundColor: colors.border,
    width: 40,
    height: 4,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textSecondary,
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 8,
  },
  section: {
    backgroundColor: colors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 74,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 2,
  },
  menuDesc: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  bottomRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  bottomBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 16,
    gap: 6,
  },
  signOutBtn: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  bottomBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textPrimary,
  },
});
