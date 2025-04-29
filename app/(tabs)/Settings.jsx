import React, { useState } from "react";
import { View, Text, TouchableOpacity, Switch, ScrollView, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useAuth from "../../hooks/useAuth";

export default function settings() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { logout } = useAuth();

    const [smartRecommendation, setSmartRecommendation] = useState(true);
    const [highUsageAlert, setHighUsageAlert] = useState(true);
    const [systemUpdates, setSystemUpdates] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const toggleSwitch = (setter) => () => setter((prev) => !prev);

    const handleLogout = () => {
        setIsLoading(true);
        setTimeout(() => {
            logout(setIsLoading);
        }, 1000);
    }

    return (
        <ScrollView className="flex-1 bg-gray-100 p-4" contentContainerStyle={{ paddingBottom: insets.bottom + 60, }}>
            {/* Header */}
            <Text className="text-2xl font-bold text-[#23403A] mb-6">Settings</Text>

            {/* Account Section */}
            <Text className="text-lg font-semibold text-[#23403A] mb-2">Account</Text>
            <View className="border-t border-gray-300 mb-4" />

            {[
                { label: "Edit Profile", route: "/edit-profile" },
                { label: "Change password", route: "/change-password" },
                { label: "Delete account", route: "/delete-account" },
            ].map(({ label, route }) => (
                <TouchableOpacity
                    key={label}
                    onPress={() => router.push(route)}
                    className="flex-row justify-between items-center py-3 border-b border-gray-100"
                >
                    <Text className="text-gray-800">{label}</Text>
                    <Feather name="chevron-right" size={20} color="#6B7280" />
                </TouchableOpacity>
            ))}

            {/* Notification Section */}
            <Text className="text-lg font-semibold text-[#23403A] mt-6 mb-2">Notification</Text>
            <View className="border-t border-gray-300 mb-4" />

            {[
                { label: "Smart Recommendation", value: smartRecommendation, toggle: toggleSwitch(setSmartRecommendation) },
                { label: "High Energy Usage Alerts", value: highUsageAlert, toggle: toggleSwitch(setHighUsageAlert) },
                { label: "System Updates & Maintenance", value: systemUpdates, toggle: toggleSwitch(setSystemUpdates) },
            ].map(({ label, value, toggle }) => (
                <View key={label} className="flex-row justify-between items-center py-3">
                    <Text className="text-gray-800">{label}</Text>
                    <Switch value={value} onValueChange={toggle} trackColor={{ false: "#ccc", true: "#10B981" }} />
                </View>
            ))}

            {/* About Section */}
            <Text className="text-lg font-semibold text-[#23403A] mt-6 mb-2">About</Text>
            <View className="border-t border-gray-300 mb-4" />

            {[
                "WisEnergy",
                "Contact Support",
                "Terms of Service & Privacy Policy",
            ].map((item) => (
                <TouchableOpacity
                    key={item}
                    className="flex-row justify-between items-center py-3 border-b border-gray-100"
                >
                    <Text className="text-gray-800">{item}</Text>
                    <Feather name="chevron-right" size={20} color="#6B7280" />
                </TouchableOpacity>
            ))}

            {/* Logout Button */}
            <TouchableOpacity className="mt-6 self-center bg-red-700 px-6 py-2 rounded-md">
                {!isLoading ? (
                    <Text onPress={handleLogout} className="text-white font-semibold">Log Out</Text>
                ) : (
                    <ActivityIndicator size="small" color="#000" />
                )}
            </TouchableOpacity>
        </ScrollView>
    );
}
