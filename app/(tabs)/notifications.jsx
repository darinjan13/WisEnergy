import React, { useCallback, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Modal,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import Animated, { FadeInRight, FadeOutRight } from "react-native-reanimated";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { auth } from "@/firebase/firebaseConfig";

import { useNotificationStore } from "@/store/firebaseStore";
import { timeAgo } from "@/utils/dateHelper.js"


export default function Notifications() {
    const insets = useSafeAreaInsets();
    const [notifToDelete, setNotifToDelete] = useState(null);
    const [swipedItem, setSwipedItem] = useState(null);

    const {
        notifications,
        loading,
        hasMore,
        fetchNotifications,
        loadMoreNotifications,
        markAllAsRead,
        deleteNotification,
    } = useNotificationStore();

    useFocusEffect(
        useCallback(() => {
            const user = auth.currentUser;
            if (user) fetchNotifications(user.uid);
        }, [])
    );

    const getIcon = (type) => {
        switch (type) {
            case "warning":
                return { name: "alert-outline", color: "#facc15" };
            case "error":
                return { name: "alert-circle-outline", color: "#ef4444" };
            case "ai_insight":
            case "smart_recommendation":
                return { name: "lightbulb-on-outline", color: "#22c55e" };
            case "high_usage_alert":
                return { name: "flash-outline", color: "#f97316" };
            case "system":
            default:
                return { name: "bell-outline", color: "#6b7280" };
        }
    };

    return (
        <GestureHandlerRootView>
            {/* Back button */}
            <TouchableOpacity
                onPress={() => router.back()}
                className="w-10 ml-5 mt-10 pt-10"
            >
                <Feather name="arrow-left" size={30} color="#095333" />
            </TouchableOpacity>

            <ScrollView
                showsVerticalScrollIndicator={false}
                className="p-5"
                contentContainerStyle={{ paddingBottom: insets.bottom + 50 }}
            >
                {/* Header */}
                <View className="flex-row justify-between items-center mb-6">
                    <Text className="text-2xl font-bold text-black">Notifications</Text>
                    <TouchableOpacity
                        onPress={() => markAllAsRead(auth.currentUser?.uid)}
                    >
                        <Text className="text-blue-600 font-medium">
                            Mark all as read
                        </Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#095333" />
                ) : notifications.length === 0 ? (
                    <Text className="text-gray-500 text-center">
                        No notifications yet
                    </Text>
                ) : (
                    notifications.map((item) => {
                        const icon = getIcon(item.type);

                        const renderRightActions = () => (
                            <Animated.View
                                entering={FadeInRight}
                                exiting={FadeOutRight}

                                className="flex-row justify-center items-center bg-red-600 w-20 rounded-r-xl"
                            >
                                <TouchableOpacity
                                    onPress={() => setNotifToDelete(item)}
                                    className="justify-center items-center flex-1"
                                >
                                    <Feather name="trash-2" size={22} color="#fff" />
                                </TouchableOpacity>
                            </Animated.View>
                        );

                        return (
                            <Swipeable
                                key={item.id}
                                renderRightActions={renderRightActions}
                                friction={2}
                                // overshootRight={false}
                                containerStyle={{ overflow: "visible", marginBottom: 20 }}
                                onSwipeableWillOpen={() => setSwipedItem(item.id)}   // 👈 when swipe starts
                                onSwipeableWillClose={() => setSwipedItem(null)}
                            >
                                <View
                                    className={`${!item.read_at ? "bg-gray-200" : "bg-white"
                                        } p-4`}
                                    style={{
                                        shadowColor: "#000",
                                        shadowOffset: { width: 0, height: 2 },
                                        borderTopLeftRadius: 10,
                                        borderBottomLeftRadius: 10,
                                        borderTopRightRadius: swipedItem === item.id ? 0 : 10,    // ✅ remove right corner when swiped
                                        borderBottomRightRadius: swipedItem === item.id ? 0 : 10,
                                        shadowOpacity: 0.1,
                                        shadowRadius: 4,
                                        elevation: 10,
                                    }}
                                >
                                    <View className="flex-row items-center mb-2">
                                        <MaterialCommunityIcons
                                            name={icon.name}
                                            size={22}
                                            color={icon.color}
                                        />
                                        <Text
                                            className={`ml-2 text-base font-medium ${item.read_at ? "text-gray-500" : "text-gray-800"
                                                }`}
                                        >
                                            {item.title}
                                        </Text>
                                    </View>
                                    <Text className="text-gray-700 text-sm leading-6 mb-2">
                                        {item.message}
                                    </Text>
                                    <Text className="text-xs text-gray-400 text-right">
                                        {timeAgo(item.created_at)}
                                    </Text>
                                </View>
                            </Swipeable>
                        );
                    })
                )}

                {hasMore && !loading && notifications.length > 0 && (
                    <TouchableOpacity
                        onPress={() => loadMoreNotifications(auth.currentUser?.uid)}
                        className="mt-4 mb-8 py-3 bg-green-600 rounded-xl"
                    >
                        <Text className="text-center text-white font-semibold">
                            Load More
                        </Text>
                    </TouchableOpacity>
                )}
            </ScrollView>

            {/* Confirm Delete Modal */}
            <Modal
                visible={!!notifToDelete}
                transparent
                animationType="fade"
                onRequestClose={() => setNotifToDelete(null)}
            >
                <View className="flex-1 bg-black/40 justify-center items-center px-6">
                    <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
                        <Text className="text-lg font-bold mb-3 text-center text-black">
                            Delete Notification
                        </Text>
                        <Text className="text-gray-600 text-center mb-5">
                            Are you sure you want to delete this notification?
                        </Text>

                        <View className="flex-row justify-center gap-4">
                            <TouchableOpacity
                                onPress={() => setNotifToDelete(null)}
                                className="bg-gray-300 px-4 py-2 rounded-lg"
                            >
                                <Text className="text-gray-800 font-medium">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={async () => {
                                    await deleteNotification(
                                        auth.currentUser?.uid,
                                        notifToDelete.id
                                    );
                                    setNotifToDelete(null);
                                }}
                                className="bg-red-600 px-4 py-2 rounded-lg"
                            >
                                <Text className="text-white font-medium">Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </GestureHandlerRootView>
    );
}
