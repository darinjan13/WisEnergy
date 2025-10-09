import React, { useCallback, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Switch, ScrollView, ActivityIndicator, BackHandler, useWindowDimensions, Alert, Modal } from "react-native";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { Link, useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useAuth from "../../hooks/useAuth";
import { auth, db } from "../../firebase/firebaseConfig";
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
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

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
    const handleDeleteAccount = async () => {
        Alert.alert(
            "Delete Account",
            "Are you sure you want to delete your account? This action cannot be undone after 30 days.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Yes, Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const userId = auth.currentUser?.uid;
                            if (!userId) return;

                            // Schedule deletion for 30 days later
                            const deletionDate = new Date();
                            deletionDate.setDate(deletionDate.getDate() + 30);
                            const formattedDate = deletionDate.toISOString().replace("T", " ").split(".")[0];

                            const userRef = ref(db, `users/${userId}`);
                            await update(userRef, { deletion_date: formattedDate });

                            // Optional: immediately disable notifications
                            await update(userRef, {
                                notify_smart_recommendation: false,
                                notify_high_usage_alerts: false,
                                notify_system_updates: false,
                            });

                            Alert.alert(
                                "Account Scheduled for Deletion",
                                "Your account will be permanently deleted in 30 days. You can contact support to restore it before that date."
                            );

                            await signOut(auth);
                        } catch (error) {
                            console.error("Error scheduling deletion:", error);
                            Alert.alert("Error", "Unable to process your request. Please try again later.");
                        }
                    },
                },
            ]
        );
    };

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
                                router.replace('/(tabs)/dashboard'); // fallback to home/tabs if no history
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
                            {auth.currentUser?.displayName?.[0] ?? "U"}
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
                        { label: "Delete account", onPress: () => setShowDeleteModal(true) },
                    ].map((item) => (
                        <TouchableOpacity
                            key={item.label}
                            className="flex-row justify-between items-center py-3 ml-12"
                            onPress={item.onPress || (() => router.push(item.route))}
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
            <Modal
                transparent
                animationType="fade"
                visible={showDeleteModal}
                onRequestClose={() => setShowDeleteModal(false)}
            >
                <View className="flex-1 items-center justify-center bg-black/40">
                    <View className="bg-white rounded-2xl w-80 p-6 items-center shadow-lg">
                        <Feather name="alert-triangle" size={36} color="#dc2626" />
                        <Text className="text-lg font-bold text-gray-800 mt-3">
                            Delete Account?
                        </Text>
                        <Text className="text-sm text-gray-600 text-center mt-2 mb-4">
                            Your account will be permanently deleted 30 days from now.
                            You may contact support to cancel deletion before that date.
                        </Text>

                        <View className="flex-row justify-between w-full mt-2">
                            <TouchableOpacity
                                className="flex-1 mr-2 bg-gray-200 py-2 rounded-lg items-center"
                                onPress={() => setShowDeleteModal(false)}
                            >
                                <Text className="text-gray-800 font-semibold">Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                disabled={isDeleting}
                                onPress={async () => {
                                    try {
                                        setIsDeleting(true);
                                        const userId = auth.currentUser?.uid;
                                        if (!userId) return;

                                        // Schedule deletion after 30 days
                                        const deletionDate = new Date();
                                        deletionDate.setDate(deletionDate.getDate() + 30);
                                        const formattedDate = deletionDate
                                            .toISOString()
                                            .replace("T", " ")
                                            .split(".")[0];

                                        const userRef = ref(db, `users/${userId}`);
                                        await update(userRef, {
                                            deletion_date: formattedDate,
                                            notify_smart_recommendation: false,
                                            notify_high_usage_alerts: false,
                                            notify_system_updates: false,
                                        });

                                        setShowDeleteModal(false);
                                        await logout(setIsDeleting);
                                    } catch (error) {
                                        console.error("Error scheduling deletion:", error);
                                        setShowDeleteModal(false);
                                    } finally {
                                        setIsDeleting(false);
                                    }
                                }}
                                className={`flex-1 ml-2 py-2 rounded-lg items-center ${isDeleting ? "bg-red-400" : "bg-red-600"
                                    }`}
                            >
                                {!isDeleting ? (
                                    <Text className="text-white font-semibold">Confirm</Text>
                                ) : (
                                    <ActivityIndicator size="small" color="#fff" />
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}