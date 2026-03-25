import { colors, spacing, typography } from "@/src/utils/theme";
import { Tabs } from "expo-router";
import {
  House,
  ShoppingCart,
  Truck,
  UserCircle,
  Users,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ACTIVE = colors.primary; // brand green
const INACTIVE = "#9CA3AF"; // design-spec inactive tab color

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
          elevation: 4,
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: -1 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
          height: spacing.tabBarHeight + insets.bottom,
          paddingBottom: 8 + insets.bottom,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: typography.label.fontSize,
          fontWeight: typography.label.fontWeight,
        },
      }}
    >
      {/* Tab 1 — Home */}
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <House size={size} color={color} strokeWidth={1.75} />
          ),
        }}
      />

      {/* Tab 2 — Customers */}
      <Tabs.Screen
        name="customers"
        options={{
          title: "Customers",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Users size={size} color={color} strokeWidth={1.75} />
          ),
        }}
      />

      {/* Tab 3 — Orders */}
      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <ShoppingCart size={size} color={color} strokeWidth={1.75} />
          ),
        }}
      />

      {/* Tab 4 — Suppliers */}
      <Tabs.Screen
        name="suppliers"
        options={{
          title: "Suppliers",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Truck size={size} color={color} strokeWidth={1.75} />
          ),
        }}
      />

      {/* Tab 5 — Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <UserCircle size={size} color={color} strokeWidth={1.75} />
          ),
        }}
      />

      {/* Hidden screens — accessible via router.push, never shown in tab bar */}
      <Tabs.Screen name="products" options={{ href: null }} />
      <Tabs.Screen name="export" options={{ href: null }} />
      <Tabs.Screen name="reports" options={{ href: null }} />
    </Tabs>
  );
}
