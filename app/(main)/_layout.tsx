import { CustomerIcon, HomeIcon, MoreIcon } from "@/assets/icons/main";
import { colors, spacing, typography } from "@/src/utils/theme";
import { Tabs, useRouter } from "expo-router";
import { Plus, Receipt } from "lucide-react-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function NewBillButton() {
  const router = useRouter();
  return (
    <TouchableOpacity
      onPress={() => router.push("/orders/create")}
      activeOpacity={0.85}
      style={styles.fabWrapper}
    >
      <View style={styles.fabContainer}>
        {/* Orange circle with white border */}
        <View style={styles.fab}>
          <Plus size={28} color={colors.surface} strokeWidth={2.5} />
        </View>

        {/* Floating label above the FAB */}
        <View style={styles.labelBadge}>
          <Text style={styles.fabLabelText}>New Bill</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: spacing.dividerHeight,
          borderTopColor: colors.border,
          elevation: 8,
          shadowColor: colors.textPrimary,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 6,
          height: spacing.tabBarHeight + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 2,
        },
        tabBarLabelStyle: {
          fontSize: typography.label.fontSize,
          fontWeight: typography.label.fontWeight,
          marginTop: 2,
        },
      }}
    >
      {/* Tab 1 — Home */}
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <HomeIcon width={size} height={size} color={color} />
          ),
        }}
      />

      {/* Tab 2 — Customers */}
      <Tabs.Screen
        name="customers"
        options={{
          title: "Customers",
          tabBarIcon: ({ color, size }) => (
            <CustomerIcon width={size} height={size} color={color} />
          ),
        }}
      />

      {/* Tab 3 — New Bill (center FAB, phantom tab) */}
      <Tabs.Screen
        name="new-bill"
        options={{
          title: "",
          tabBarIcon: () => null,
          tabBarLabel: () => null,
          tabBarButton: () => <NewBillButton />,
        }}
      />

      {/* Tab 4 — Orders list */}
      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          tabBarIcon: ({ color, size }) => (
            <Receipt size={size} color={color} strokeWidth={1.8} />
          ),
        }}
      />

      {/* Tab 5 — More */}
      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarIcon: ({ color, size }) => (
            <MoreIcon width={size} height={18} color={color} />
          ),
        }}
      />

      {/* Hidden routes — accessible via router.push but not shown in the tab bar */}
      <Tabs.Screen name="suppliers" options={{ href: null }} />
      <Tabs.Screen name="net-position" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
      <Tabs.Screen name="products" options={{ href: null }} />
      <Tabs.Screen name="export" options={{ href: null }} />
      <Tabs.Screen name="reports" options={{ href: null }} />
      <Tabs.Screen name="notifications/index" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  fabWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  fabContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  fab: {
    width: spacing.fabSize,
    height: spacing.fabSize,
    borderRadius: spacing.fabSize / 2,
    backgroundColor: colors.warning, // orange — per UX spec §2
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: colors.surface,
    marginTop: -(spacing.fabSize / 2),
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  labelBadge: {
    position: "absolute",
    top: -(spacing.fabSize / 2) - 16,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  fabLabelText: {
    fontSize: typography.caption.fontSize,
    fontWeight: "800" as const,
    color: colors.textPrimary,
  },
});
