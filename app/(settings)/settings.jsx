import { useCallback, useState } from "react";
import { View, Text, TouchableOpacity, Switch, ScrollView, ActivityIndicator, BackHandler, useWindowDimensions } from "react-native";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { Link, useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useAuth from "@/hooks/useAuth";
import { auth, db } from "@/firebase/firebaseConfig";
import { onValue, ref, update } from "firebase/database";

export default function settings() {
    const { width } = useWindowDimensions();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { logout } = useAuth();

    const [smartRecommendation, setSmartRecommendation] = useState(true);
    const [highUsageAlert, setHighUsageAlert] = useState(true);
    const [systemUpdates, setSystemUpdates] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingUI, setIsLoadingUI] = useState(true);

    const getInitials = () => {
        const name = auth.currentUser?.displayName?.trim();
        if (!name) return "U";

        // Split into words and remove empty strings
        const parts = name.split(" ").filter(Boolean);

        if (parts.length === 1) {
            // Single name only (e.g., "Cher")
            return parts[0][0].toUpperCase();
        }

        // ✅ First letter of first name + first letter of last name
        const firstInitial = parts[0][0].toUpperCase();
        const lastInitial = parts[parts.length - 1][0].toUpperCase();

        return `${firstInitial}${lastInitial}`;
    };

    useFocusEffect(
        useCallback(() => {
            const backHandler = BackHandler.addEventListener("hardwareBackPress", onBackPress);
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

            return () => { unsubscribe(); backHandler.remove(); }
        }, [])
    )

    const onBackPress = () => { router.replace('/(tabs)/dashboard'); return true; };

    const toggleSwitch = (key, setter) => () => {
        setter((prev) => {
            const newVal = !prev;

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
                    <Text className="text-gray-500 mt-4 text-lg font-semibold">Loading your profile data....</Text>
                </View>
            </ScrollView>
        )
    }

    return (
        <View>
            <ScrollView className="bg-gray-100 p-10" contentContainerStyle={{ paddingBottom: insets.bottom + 60, paddingTop: insets.top - 10 }}>
                <View className="mb-6 flex-row items-center">
                    <TouchableOpacity
                        className="w-10 -ml-4"
                        onPress={() => {
                            if (router.canGoBack()) {
                                router.back();
                            } else {
                                router.replace('/(tabs)/dashboard');
                            }
                        }}
                    >
                        <Feather name='arrow-left' size={30} color="#095333" />
                    </TouchableOpacity>
                    <Text className="text-2xl font-bold text-[#23403A]">Profile</Text>
                </View>
                <View className="mb-6 flex-row items-center">
                    {/* Avatar */}
                    <View className="h-14 w-14 rounded-md bg-[#136B1E] items-center justify-center mr-4">
                        <Text className="text-white text-lg font-bold">
                            {getInitials()}
                        </Text>
                    </View>

                    {/* User Info */}
                    <View>
                        <Text className="text-lg font-semibold text-gray-900">
                            {auth.currentUser?.displayName ?? "User"}
                        </Text>
                        <Text className="text-sm text-gray-600">
                            {auth.currentUser?.email}
                        </Text>
                    </View>
                </View>


                <View className="bg-white rounded-xl shadow-md p-4 mb-6">
                    <View className="flex-row items-center mb-2">
                        <FontAwesome5 name="user-circle" size={30} color="#23403A" />
                        <Text className="ml-4 text-base font-semibold text-[#23403A]">Account Settings</Text>
                    </View>

                    {[
                        { label: "Edit Profile", route: "/(settings)/editProfile" },
                        { label: "Change password", route: "/(settings)/changePassword" },
                        { label: "Delete account", route: "/(settings)/deleteAccount" },
                    ].map((item) => (
                        <TouchableOpacity
                            key={item.label}
                            className="flex-row justify-between items-center py-3 ml-12"
                            onPress={() => router.push(item.route)}
                        >
                            <Text className={width < 720 ? "text-sm text-gray-800" : "text-gray-800"}>
                                {item.label}
                            </Text>
                            <Feather name="chevron-right" size={20} color="#6B7280" />
                        </TouchableOpacity>
                    ))}
                </View>

                <View className="bg-white rounded-xl shadow-md p-4 mb-6">
                    <View className="flex-row items-center mb-2">
                        <Feather name="bell" size={30} color="#23403A" />
                        <Text className="ml-4 text-base font-semibold text-[#23403A]">Notification</Text>
                    </View>

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
                        <View key={label} className="flex-row justify-between items-center py-3 ml-12">
                            <Text className={width < 720 ? "text-sm text-gray-800" : "text-gray-800"}>{label}</Text>
                            <Switch
                                value={value}
                                onValueChange={toggle}
                                trackColor={{ false: "#ccc", true: "#10B981" }}
                                thumbColor={value ? "#065f46" : "#f4f4f5"}
                            />
                        </View>
                    ))}
                </View>


                <View className="bg-white rounded-xl shadow-md p-4 mb-6">
                    <View className="flex-row items-center mb-2">
                        <Feather name="info" size={30} color="#23403A" />
                        <Text className="ml-4 text-base font-semibold text-[#23403A]">About</Text>
                    </View>

                    {[
                        { label: "WisEnergy", route: "/(settings)/about" },
                        { label: "Help & Feedback", route: "/(settings)/contactSupport" },
                        { label: "Terms of Service", route: "/(settings)/terms" },
                        { label: "Privacy Policy", route: "/(settings)/privacy" },
                    ].map((item) => (
                        <Link asChild key={item.route} href={item.route} className="ml-12">
                            <TouchableOpacity className="flex-row justify-between items-center py-3">
                                <Text className={width < 720 ? "text-sm text-gray-800" : "text-gray-800"}>{item.label}</Text>
                                <Feather name="chevron-right" size={20} color="#6B7280" />
                            </TouchableOpacity>
                        </Link>
                    ))}
                </View>


                <TouchableOpacity onPress={handleLogout} disabled={isLoading} className="mt-2 self-center bg-red-600 px-6 py-2 rounded-md">
                    <View className="h-8 w-16 items-center justify-center">
                        {!isLoading ? (
                            <Text className="text-white font-semibold">Log Out</Text>
                        ) : (
                            <ActivityIndicator size="small" color="white" />
                        )}
                    </View>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}