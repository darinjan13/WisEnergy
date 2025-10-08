import React, { useCallback, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Modal } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { db, auth } from "@/firebase/firebaseConfig";
import { ref, onValue, update } from "firebase/database";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Notifications() {
    const insets = useSafeAreaInsets();

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedNotif, setSelectedNotif] = useState(null);

    useFocusEffect(
        useCallback(() => {
            const user = auth.currentUser;
            if (!user) return;
            const notifRef = ref(db, `notifications/${user.uid}`);

            const unsubscribe = onValue(notifRef, (snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();

                    const formatted = Object.entries(data).map(([id, item]) => ({
                        id,
                        title: item.title,
                        message: item.message,
                        created_at: item.created_at,
                        read_at: item.read_at,
                        type: item.type || "system",
                    }));
                    formatted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

                    setNotifications(formatted);
                } else {
                    setNotifications([]);
                }
                setLoading(false);
            });

            return () => unsubscribe();
        }, [])
    );

    const handleClose = async () => {
        if (!selectedNotif) return;

        try {
            const user = auth.currentUser;
            if (!user) return;

            const now = new Date().toISOString();
            const notifRef = ref(db, `notifications/${user.uid}/${selectedNotif.id}`);
            await update(notifRef, { read_at: now });

            // instant UI update
            setNotifications((prev) =>
                prev.map((n) =>
                    n.id === selectedNotif.id ? { ...n, read_at: now } : n
                )
            );

            console.log(`✅ Marked ${selectedNotif.id} as read`);
        } catch (error) {
            console.error("⚠️ Failed to mark as read:", error);
        } finally {
            setSelectedNotif(null);
        }
    };


    const markAllAsRead = async () => {
        const user = auth.currentUser;
        if (!user) return;

        const updates = {};
        notifications.forEach((n) => {
            updates[`notifications/${user.uid}/${n.id}/read_at`] = new Date().toISOString();
        });

        await update(ref(db), updates);
    };

    const getIcon = (type) => {
        switch (type) {
            case "warning":
                return { name: "alert-outline", color: "#facc15" }; // yellow
            case "error":
                return { name: "alert-circle-outline", color: "#ef4444" }; // red
            case "ai_insight":
                return { name: "email-outline", color: "#22c55e" }; // green
            case "system":
            default:
                return { name: "bell-outline", color: "#6b7280" }; // gray
        }
    };

    return (
        <View className="flex-1 bg-white">
            {/* Back button */}
            <TouchableOpacity onPress={() => router.back()} className="w-10 ml-5 mt-10 pt-10">
                <Feather name="arrow-left" size={30} color="#095333" />
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false} className="p-10" contentContainerStyle={{ paddingBottom: insets.bottom + 50 }}>
                {/* Header */}
                <View className="flex-row justify-between items-center mb-6">
                    <Text className="text-2xl font-bold text-black">Notifications</Text>
                    <TouchableOpacity onPress={markAllAsRead}>
                        <Text className="text-blue-600 font-medium">Mark all as read</Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#095333" />
                ) : notifications.length === 0 ? (
                    <Text className="text-gray-500 text-center">No notifications yet</Text>
                ) : (
                    notifications.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            activeOpacity={0.8}
                            onPress={() => setSelectedNotif(item)}
                        >
                            <View
                                className={`${!item.read_at ? "bg-gray-100" : "bg-white"} rounded-xl p-4 mb-4 flex-row justify-between items-center`}
                                style={{
                                    shadowColor: "#000",
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 4,
                                    elevation: 2,
                                }}
                            >
                                <View className="flex-1 pr-2">
                                    <Text
                                        className={`text-base font-medium mb-1 ${item.read_at ? "text-gray-500" : "text-gray-800"
                                            }`}
                                    >
                                        {item.title}
                                    </Text>
                                    <Text className="text-xs text-gray-500">{item.created_at}</Text>
                                </View>
                                {(() => {
                                    const icon = getIcon(item.type);
                                    return (
                                        <MaterialCommunityIcons
                                            name={icon.name}
                                            size={22}
                                            color={icon.color}
                                        />
                                    );
                                })()}
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>

            {/* Modal for viewing full message */}
            <Modal
                visible={!!selectedNotif}
                transparent
                animationType="slide"
                onRequestClose={() => setSelectedNotif(null)}
            >
                <View className="flex-1 bg-black/40 justify-center items-center px-6">
                    <View className="bg-white rounded-2xl w-full max-h-[80%] p-6">
                        <Text className="text-2xl font-bold mb-2 text-center">
                            {selectedNotif?.title}
                        </Text>
                        <Text className="text-xs text-gray-500 mb-4 text-center">
                            {selectedNotif?.created_at}
                        </Text>

                        <ScrollView className="mb-4">
                            <Text className="text-gray-700 whitespace-pre-line text-base leading-6">
                                {selectedNotif?.message}
                                {/* ASDASD */}
                            </Text>
                        </ScrollView>

                        <TouchableOpacity
                            onPress={handleClose}
                            className="mt-4 py-3 bg-emerald-600 rounded-xl"
                        >
                            <Text className="text-white text-center font-semibold text-base">Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
