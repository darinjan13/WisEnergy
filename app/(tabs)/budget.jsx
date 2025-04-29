import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PieChart } from 'react-native-gifted-charts';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Header from "../../components/ui/Header";

export default function budget() {
    const insets = useSafeAreaInsets();

    const budgetUsed = 0.75;

    return (
        <ScrollView
            className="bg-gray-100 p-4"
            contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        >
            <Header />

            <View style={styles.cardShadow} className=" bg-white mb-4 rounded-2xl p-4">
                <Text className="text-2xl font-bold text-[#23403A] mb-1">Monthly Budget</Text>
                <Text className="text-sm text-gray-600 mb-4">
                    Track your Monthly Energy spending and optimize usage.
                </Text>
            </View>

            <View className="items-center justify-center my-4">
                <PieChart
                    donut
                    radius={70}
                    innerRadius={50}
                    data={[
                        { value: 75, color: '#10b981' },      // Filled portion
                        { value: 25, color: '#E5E7EB' },      // Unfilled background
                    ]}
                />
                <Text className="absolute text-3xl font-bold text-[#23403A]">
                    {Math.round(budgetUsed * 100)}%
                </Text>
            </View>

            <Text className="text-center font-bold text-[#23403A] text-xl">UNDER BUDGET</Text>
            <Text className="text-center text-gray-600 mb-4">
                You’ve used {Math.round(budgetUsed * 100)}% of your budget this cycle
            </Text>

            <View className="flex-row justify-between mb-4">
                <Text className="text-lg text-black">Set on: March 14, 2025</Text>
                <Text className="text-lg text-black">Resets on: April 14, 2025</Text>
            </View>

            <TouchableOpacity className="bg-green-700 py-3 rounded-md mb-6">
                <Text className="text-white font-semibold text-center">Adjust Budget</Text>
            </TouchableOpacity>

            <View className="flex-row justify-between mb-6">
                <View style={styles.cardShadow} className="flex-1 bg-white px-4 py-3 rounded-xl mr-2">
                    <Text className="text-xs text-gray-500 mb-1">Monthly Budget</Text>
                    <Text className="text-green-700 font-bold text-lg">₱3,000.00</Text>
                </View>
                <View style={styles.cardShadow} className="flex-1 bg-white px-4 py-3 rounded-xl mx-1">
                    <Text className="text-xs text-gray-500 mb-1">Estimated Cost</Text>
                    <Text className="text-green-700 font-bold text-lg">₱2,250.00</Text>
                </View>
                <View style={styles.cardShadow} className="flex-1 bg-white px-4 py-3 rounded-xl ml-2">
                    <Text className="text-xs text-gray-500 mb-1">Remaining</Text>
                    <Text className="text-green-700 font-bold text-lg">₱750.00</Text>
                </View>
            </View>

            <View style={styles.cardShadow} className="bg-white px-4 py-3 rounded-xl flex-row items-start space-x-3">
                <MaterialCommunityIcons name="lightbulb-on-outline" size={24} color="#16a34a" />
                <View className="flex-1">
                    <Text className="text-sm text-gray-800 font-semibold mb-1">Smart Recommendations</Text>
                    <Text className="text-sm text-gray-600">
                        You’re on track. Try reducing air conditioner usage to lower your costs further.
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    cardShadow: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 6,

        elevation: 10,
    },
});