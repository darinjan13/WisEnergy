import { View, Text, ScrollView } from "react-native";
import { Zap, Plug, Star, UserPlus } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";

import { fetchTotalDevices, fetchTotalUsers } from "../../services/apiService";
import AdminHeader from "../../components/ui/AdminHeader";


export default function Dashboard() {
    const [totalDevices, setTotalDevices] = useState(0);
    const [totalUsers, setTotalUsers] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    useFocusEffect(
        useCallback(() => {
            const getTotals = async () => {
                const deviceTotal = await fetchTotalDevices()
                const userTotal = await fetchTotalUsers();
                setTotalDevices(deviceTotal.length)
                setTotalUsers(userTotal.length)
            }
            getTotals()

        }, [])
    );

    return (
        <View className="flex-1 bg-white">
            <AdminHeader />
            <Text className="px-4 pt-8 text-xl font-bold text-gray-800">
                Welcome Back, Admin!
            </Text>

            <View className="flex-row flex-wrap px-4 mt-4 justify-between">
                <View className="w-[48%] bg-green-700 rounded-xl p-4 mb-3">
                    <Text className="text-white text-sm">Total Users</Text>
                    <View className="flex-row items-center mt-1">
                        <UserPlus size={18} color="white" />
                        <Text className="text-white text-2xl font-bold ml-2">{totalUsers}</Text>
                    </View>
                </View>
                <View className="w-[48%] bg-green-700 rounded-xl p-4 mb-3">
                    <Text className="text-white text-sm">Energy Saved</Text>
                    <View className="flex-row items-center mt-1">
                        <Zap size={18} color="white" />
                        <Text className="text-white text-2xl font-bold ml-2">20 kWh</Text>
                    </View>
                </View>
                <View className="w-[48%] bg-green-700 rounded-xl p-4 mb-3">
                    <Text className="text-white text-sm">Total Devices</Text>
                    <View className="flex-row items-center mt-1">
                        <Plug size={18} color="white" />
                        <Text className="text-white text-2xl font-bold ml-2">{totalDevices}</Text>
                    </View>
                </View>
                <View className="w-[48%] bg-green-700 rounded-xl p-4 mb-3">
                    <Text className="text-white text-sm">Average Rating</Text>
                    <View className="flex-row items-center mt-1">
                        <Star size={18} color="yellow" fill="yellow" />
                        <Text className="text-white text-2xl font-bold ml-2">4.5</Text>
                    </View>
                </View>
            </View>

            <View className="px-4 mt-4 flex-1">
                <Text className="text-lg font-bold text-gray-800">Recent Activity</Text>
                <ScrollView className="mt-2">
                    {Array(5)
                        .fill(0)
                        .map((_, i) => (
                            <View
                                key={i}
                                className="flex-row items-center justify-between py-3 border-b border-gray-200"
                            >
                                <View className="flex-row items-center">
                                    <UserPlus size={20} color="green" />
                                    <Text className="ml-2 text-gray-700">
                                        New account registered
                                    </Text>
                                </View>
                                <Text className="text-gray-400 text-sm">2h ago</Text>
                            </View>
                        ))}
                </ScrollView>
            </View>
        </View >
    );
}
