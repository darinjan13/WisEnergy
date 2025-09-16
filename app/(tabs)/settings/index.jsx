import React, { useCallback, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Switch, ScrollView, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Link, useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useAuth from "../../../hooks/useAuth";
import { auth, db } from "../../../firebase/firebaseConfig";
import { onValue, ref, update } from "firebase/database";

export default function settings() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { logout } = useAuth();

    const [smartRecommendation, setSmartRecommendation] = useState(true);
    const [highUsageAlert, setHighUsageAlert] = useState(true);
    const [systemUpdates, setSystemUpdates] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingUI, setIsLoadingUI] = useState(true);

    useFocusEffect(
        useCallback(() => {
            const userRef = ref(db, `users/${auth.currentUser.uid}`);
            const unsubscribe = onValue(userRef, (snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    setSmartRecommendation(!!data.notify_smart_recommendation);
                    setHighUsageAlert(!!data.notify_high_usage_alerts);
                    setSystemUpdates(!!data.notify_system_updates);
                }
                setIsLoadingUI(false)
            });

            return () => unsubscribe();
        }, [])
    )

    const toggleSwitch = (key, setter) => () => {
        setter((prev) => {
            const newVal = !prev;

            // Update Firebase under /users/{uid}/{key}
            const userRef = ref(db, `users/${auth.currentUser.uid}`);
            update(userRef, { [key]: newVal });

            return newVal;
        });
    };

    const handleLogout = () => {
        setIsLoading(true);
        setTimeout(() => {
            logout(setIsLoading);
        }, 1000);
    }

    if (isLoadingUI) {
        return (
            <ScrollView className="h-full p-4" showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
                <View className="h-screen -mt-36 items-center justify-center">
                    <ActivityIndicator size="large" color="#166534" />
                    <Text className="text-gray-500 mt-4 text-lg font-semibold">Loading your reports data....</Text>
                </View>
            </ScrollView>
        )
    }

    return (
        <ScrollView className="flex-1 bg-gray-100 p-4" contentContainerStyle={{ paddingBottom: insets.bottom + 60, }}>
            <Text className="text-2xl font-bold text-[#23403A] mb-6">Settings</Text>

            <Text className="text-lg font-semibold text-[#23403A] mb-2">Account</Text>
            <View className="border-t border-gray-300 mb-4" />

            {[
                { label: "Edit Profile", route: "/(tabs)/settings/editProfile" },
                { label: "Change password", route: "/(tabs)/settings/changePassword" },
                { label: "Delete account", route: "/delete-account" },
            ].map(({ label, route }) => (
                <Link asChild key={route} href={route}>
                    <TouchableOpacity
                        key={label}
                        className="flex-row justify-between items-center py-3 border-b border-gray-100"
                    >
                        <Text className="text-gray-800">{label}</Text>
                        <Feather name="chevron-right" size={20} color="#6B7280" />
                    </TouchableOpacity>
                </Link>

            ))}

            <Text className="text-lg font-semibold text-[#23403A] mt-6 mb-2">Notification</Text>
            <View className="border-t border-gray-300 mb-4" />

            {[
                {
                    label: "Smart Recommendation",
                    value: smartRecommendation,
                    toggle: toggleSwitch("notify_smart_recommendation", setSmartRecommendation)
                },
                {
                    label: "High Energy Usage Alerts",
                    value: highUsageAlert,
                    toggle: toggleSwitch("notify_high_usage_alerts", setHighUsageAlert)
                },
                {
                    label: "System Updates & Maintenance",
                    value: systemUpdates,
                    toggle: toggleSwitch("notify_system_updates", setSystemUpdates)
                },
            ].map(({ label, value, toggle }) => (
                <View key={label} className="flex-row justify-between items-center py-3">
                    <Text className="text-gray-800">{label}</Text>
                    <Switch
                        value={value}
                        onValueChange={toggle}
                        trackColor={{ false: "#ccc", true: "#10B981" }}
                        thumbColor={value ? "#065f46" : "#f4f4f5"}
                    />
                </View>
            ))
            }

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

            <TouchableOpacity onPress={handleLogout} disabled={isLoading} className="mt-6 self-center bg-red-700 px-6 py-2 rounded-md">
                <View className="h-8 w-16 items-center justify-center">
                    {!isLoading ? (
                        <Text className="text-white font-semibold">Log Out</Text>
                    ) : (
                        <ActivityIndicator size="small" color="white" />
                    )}
                </View>
            </TouchableOpacity>
        </ScrollView>
    );
}
