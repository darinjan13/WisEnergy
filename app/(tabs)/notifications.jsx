import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { db, auth } from "@/firebase/firebaseConfig"; // adjust your path
import { ref, onValue, update } from "firebase/database";

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
                }));
                // Sort newest first
                formatted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                setNotifications(formatted);
            } else {
                setNotifications([]);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const markAllAsRead = async () => {
        const user = auth.currentUser;
        if (!user) return;

        const updates = {};
        notifications.forEach((n) => {
            updates[`notifications/${user.uid}/${n.id}/read_at`] = new Date().toISOString();
        });

        await update(ref(db), updates);
    };

    return (
        <View className="flex-1 bg-white">
            <TouchableOpacity onPress={() => router.back()} className="w-10 ml-5 mt-10 pt-10">
                <Feather name="arrow-left" size={30} color="#095333" />
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false} className="p-10">
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
                        <View
                            key={item.id}
                            className="bg-white rounded-xl p-4 mb-4 flex-row justify-between items-center"
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
                            <MaterialCommunityIcons
                                name={item.read_at ? "check-circle-outline" : "bell-outline"}
                                size={22}
                                color={item.read_at ? "#22c55e" : "#facc15"}
                            />
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    );
}
