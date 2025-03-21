import React, { useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Appliance Card Component
const ApplianceCard = ({
    name,
    currentPower,
    dailyUsage,
    efficiency,
    iconName = "power-plug",
    onClick = () => { },
}) => {
    // Memoized efficiency color calculation
    const efficiencyColors = useMemo(
        () => ({
            high: { bg: "bg-green-100", text: "text-green-800" },
            medium: { bg: "bg-yellow-100", text: "text-yellow-800" },
            low: { bg: "bg-red-100", text: "text-red-800" },
            default: { bg: "bg-gray-100", text: "text-gray-800" },
        }),
        []
    );

    const { bg, text } = efficiencyColors[efficiency] || efficiencyColors.default;

    return (
        <TouchableOpacity
            className="w-60 bg-white p-4 rounded-lg shadow-md"
            onPress={onClick}
            activeOpacity={0.8}
        >
            {/* Header */}
            <View className="flex-row justify-between items-start mb-3">
                <View className="flex-row items-center space-x-2">
                    <View className="p-2 rounded-full bg-blue-100">
                        <MaterialCommunityIcons name={iconName} size={24} color="#2563EB" />
                    </View>
                    <Text className="text-gray-900 font-medium">{name}</Text>
                </View>
                <View className={`px-2 py-1 rounded-md ${bg}`}>
                    <Text className={`text-xs font-semibold ${text}`}>{efficiency}</Text>
                </View>
            </View>

            {/* Power Stats */}
            <View className="space-y-2">
                <View className="flex-row justify-between items-center">
                    <Text className="text-sm text-gray-500">Current</Text>
                    <View className="flex-row items-center space-x-1">
                        <MaterialCommunityIcons name="flash" size={16} color="#FBBF24" />
                        <Text className="font-semibold">{currentPower} kW</Text>
                    </View>
                </View>
                <View className="flex-row justify-between items-center">
                    <Text className="text-sm text-gray-500">Today</Text>
                    <Text className="font-semibold">{dailyUsage} kWh</Text>
                </View>
            </View>

            {/* Action Button */}
            <View className="mt-3 flex items-end">
                <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
            </View>
        </TouchableOpacity>
    );
};

// Appliance Cards Component
const ApplianceCards = ({ appliances = [] }) => {
    return (
        <View className="w-full bg-gray-50 p-4 rounded-lg">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-4">
                <Text className="text-xl font-semibold text-gray-900">
                    Connected Appliances
                </Text>
                <TouchableOpacity className="border border-gray-300 px-3 py-1 rounded-md">
                    <Text className="text-gray-700">View All</Text>
                </TouchableOpacity>
            </View>

            {/* Scrollable Appliance List */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row space-x-4 pb-4">
                    {appliances.map((appliance, index) => (
                        <ApplianceCard key={index} {...appliance} />
                    ))}
                </View>
            </ScrollView>
        </View>
    );
};

export default ApplianceCards;
