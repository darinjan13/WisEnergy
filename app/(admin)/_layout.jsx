import { Tabs } from "expo-router";
import { Home, Users, Battery, MessageSquare, Settings } from "lucide-react-native";

export default function AdminLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: "green",
                tabBarStyle: { height: 60 },
            }}
        >
            <Tabs.Screen
                name="dashboard"
                options={{
                    title: "Dashboard",
                    tabBarIcon: ({ color }) => <Home size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="users"
                options={{
                    title: "Users",
                    tabBarIcon: ({ color }) => <Users size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="energy"
                options={{
                    title: "Energy",
                    tabBarIcon: ({ color }) => <Battery size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="feedback"
                options={{
                    title: "Feedback",
                    tabBarIcon: ({ color }) => <MessageSquare size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: "Settings",
                    tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
                }}
            />
        </Tabs>
    );
}
