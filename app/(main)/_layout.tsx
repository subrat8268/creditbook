import {
    BillIcon,
    CustomerIcon,
    HomeIcon,
    MoreIcon,
    SupplierIcon,
} from "@/assets/icons/main";
import { colors, typography } from "@/src/utils/theme";
import { Tabs, useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ACTIVE = colors.primary;
const INACTIVE = "#9CA3AF";

function NewBillButton() {
  const router = useRouter();
  return (
    <TouchableOpacity
      onPress={() => router.push("/orders/create")}
      activeOpacity={0.85}
      style={styles.fabWrapper}
    >
      <View style={styles.fabContainer}>
        {/* The Orange Circle with White Border */}
        <View style={styles.fab}>
          <BillIcon width={26} height={26} color="#FFFFFF" />
        </View>

        {/* The Floating Label */}
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
        tabBarActiveTintColor: ACTIVE,
        tabBarInactiveTintColor: INACTIVE,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 8,
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 6,
          height: 62 + insets.bottom,
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

      {/* Tab 3 — New Bill (center FAB) */}
      <Tabs.Screen
        name="orders"
        options={{
          title: "",
          tabBarIcon: () => null,
          tabBarLabel: () => null,
          tabBarButton: () => <NewBillButton />,
        }}
      />

      {/* Tab 4 — Suppliers */}
      <Tabs.Screen
        name="suppliers"
        options={{
          title: "Suppliers",
          tabBarIcon: ({ color, size }) => (
            <SupplierIcon width={size} height={20} color={color} />
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

      {/* Hidden routes */}
      <Tabs.Screen name="profile" options={{ href: null }} />
      <Tabs.Screen name="products" options={{ href: null }} />
      <Tabs.Screen name="export" options={{ href: null }} />
      <Tabs.Screen name="reports" options={{ href: null }} />
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
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#FFFFFF",
    marginTop: -28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  labelBadge: {
    position: "absolute",
    top: -42,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  fabLabelText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#1F2937",
  },
});
