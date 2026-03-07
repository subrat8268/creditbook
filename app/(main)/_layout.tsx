import { Tabs } from "expo-router";
import { FileText, House, Truck, UserCircle, Users } from "lucide-react-native";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ACTIVE = "#22C55E";
const INACTIVE = "#9CA3AF";

const CustomHeader = () => (
  <View className="bg-white flex-1 border-b border-default" />
);

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerTitleAlign: "center",
        headerShadowVisible: false,
        headerTitleStyle: {
          fontWeight: "600",
          fontSize: 18,
        },
        headerBackground: CustomHeader,
        tabBarActiveTintColor: ACTIVE,
        tabBarInactiveTintColor: INACTIVE,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
          elevation: 4,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -1 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
          height: 64 + insets.bottom,
          paddingBottom: 8 + insets.bottom,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
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

      {/* Tab 3 — Bills (route: orders) */}
      <Tabs.Screen
        name="orders"
        options={{
          title: "Bills",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <FileText size={size} color={color} strokeWidth={1.75} />
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
          tabBarIcon: ({ color, size }) => (
            <UserCircle size={size} color={color} strokeWidth={1.75} />
          ),
        }}
      />

      {/* Hidden screens — accessible via router.push, never shown in tab bar */}
      <Tabs.Screen name="products" options={{ href: null }} />
      <Tabs.Screen name="export" options={{ href: null }} />
    </Tabs>
  );
}
