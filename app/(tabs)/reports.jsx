import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { BarChart, LineChart } from "react-native-gifted-charts";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Header from "../../components/ui/Header";

export default function reports() {
    const insets = useSafeAreaInsets();

    const barData = [
        { value: 30, label: 'Jan' },
        { value: 50, label: 'Feb' },
        { value: 55, label: 'Mar' },
        { value: 60, label: 'Apr' },
        { value: 75, label: 'May' },
        { value: 90, label: 'Jun' },
    ];

    const lineData = [
        { value: 10 },
        { value: 20 },
        { value: 25 },
        { value: 40 },
        { value: 35 },
    ];

    return (
        <ScrollView className="bg-gray-100 p-4" contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
            <Header />
            {/* Title */}
            <Text className="text-2xl font-bold text-[#14532d] mb-4">Energy Usage Report</Text>

            {/* Toggle Buttons */}
            <View style={styles.cardShadow} className="flex-row space-x-3 mb-4 bg-white p-4 rounded-2xl shadow-sm justify-between items-center">
                {["Today", "Weekly", "Monthly"].map((label, index) => (
                    <TouchableOpacity
                        key={index}
                        className={`px-4 py-2 rounded-full border ${label === "Monthly" ? "bg-green-700 border-green-700" : "bg-white border-gray-300"}`}
                    >
                        <Text className={`${label === "Monthly" ? "text-white" : "text-gray-700"} font-semibold`}>{label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Energy Consumption */}
            <View className="flex-row justify-between mb-2 text-center">
                <Text className="text-2xl font-bold text-[#14532d] my-auto">Energy Consumption</Text>
                <Text className="text-2xl font-bold text-white my-auto bg-green-600 rounded-xl py-1 px-2">126.789 kWh</Text>
            </View>
            <View style={styles.cardShadow} className="bg-white p-4 rounded-2xl mb-4 shadow-sm">
                <BarChart
                    data={barData}
                    barWidth={20}
                    barBorderRadius={4}
                    frontColor="#16a34a"
                    spacing={10}
                    yAxisThickness={0}
                    xAxisLabelTextStyle={{ color: "#4B5563", fontSize: 12 }}
                    maxValue={120}
                    noOfSections={3}
                />
            </View>

            {/* Savings Over Time */}
            <Text className="text-2xl font-bold text-[#14532d] mb-4">Savings Over Time</Text>
            <View style={styles.cardShadow} className="bg-white p-4 rounded-2xl mb-4 shadow-sm">
                <LineChart
                    data={lineData}
                    thickness={2}
                    color="#16a34a"
                    areaChart
                    startFillColor="#bbf7d0"
                    endFillColor="#bbf7d0"
                    yAxisThickness={0}
                    xAxisThickness={0}
                />
            </View>

            {/* Appliance Usage */}
            <Text className="text-2xl font-bold text-[#14532d] mb-4">Appliance Usage</Text>
            <View style={styles.cardShadow} className="bg-white p-4 rounded-2xl mb-4 shadow-sm">
                <View className="">
                    {["Air Conditioner", "Washing Machine", "Lights", "Refrigerator"].map((item, idx) => (
                        <View key={idx}>
                            <Text className="text-gray-600">{item}</Text>
                            <View className="h-5 mb-5 bg-green-200 rounded-full overflow-hidden">
                                <View className={`h-full bg-green-700 ${["w-4/5", "w-3/5", "w-2/5", "w-1/3"][idx]}`} />
                            </View>
                        </View>
                    ))}
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