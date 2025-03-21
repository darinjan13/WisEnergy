import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

const ConsumptionDetail = ({ onBack }) => {
    const [timeFrame, setTimeFrame] = useState("hourly");

    const timeFrameData = {
        hourly: {
            labels: [
                "1 AM", "2 AM", "3 AM", "4 AM", "5 AM", "6 AM", "7 AM", "8 AM", "9 AM", "10 AM", "11 AM", "12 PM",
                "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM", "8 PM", "9 PM", "10 PM", "11 PM", "12 MN"
            ],
            data: [1.2, 1.8, 2.4, 3.2, 2.8, 2.5, 2.3, 2.7, 3.0, 3.5, 4.0, 5,
                4.2, 4.0, 3.8, 3.6, 3.3, 3.0, 2.7, 2.5, 2.3, 2.0, 1.8, 1.5]
        },
        daily: { labels: ["Mon", "Tue", "Wed", "Thu", "Fri"], data: [16.5, 17.2, 18.7, 19.4, 20.1] },
        weekly: { labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"], data: [112.5, 118.3, 124.7, 130.2, 135.6] },
    };

    return (
        <ScrollView className="flex-1 bg-gray-100 p-5">
            {/* Back Button */}
            <TouchableOpacity className="flex-row items-center mb-4" onPress={onBack}>
                <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
                <Text className="text-lg ml-2 text-gray-800">Back to Dashboard</Text>
            </TouchableOpacity>

            {/* Title */}
            <Text className="text-2xl font-bold text-gray-900 mb-3">
                Energy Consumption Details
            </Text>

            {/* Power Info */}
            <View className="bg-blue-100 p-4 rounded-lg mb-3">
                <Text className="text-lg text-gray-900">Current Power: 2.4 kWh</Text>
                <Text className="text-lg text-gray-900">Daily Consumption: 18.7 kWh</Text>
            </View>

            {/* Timeframe Buttons */}
            <View className="flex-row justify-between mb-4">
                {["hourly", "daily", "weekly"].map((frame) => (
                    <TouchableOpacity
                        key={frame}
                        className={`p-3 rounded-lg ${timeFrame === frame ? "bg-blue-500" : "bg-gray-300"}`}
                        onPress={() => setTimeFrame(frame)}
                    >
                        <Text className={`text-white ${timeFrame === frame ? "font-bold" : "font-medium"}`}>
                            {frame.charAt(0).toUpperCase() + frame.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Line Chart */}
            <View className="bg-white p-4 rounded-lg shadow-md mb-5 w-full">
                <Text className="text-lg font-medium text-gray-900 mb-2">
                    {timeFrame.charAt(0).toUpperCase() + timeFrame.slice(1)} Consumption
                </Text>
                <ScrollView horizontal={true} className="w-full">
                    <View className="flex-1 overflow-hidden rounded-xl">
                        <LineChart
                            data={{
                                labels: timeFrameData[timeFrame].labels,
                                datasets: [{ data: timeFrameData[timeFrame].data }],
                            }}
                            width={screenWidth * 1.5} // Adjust width for better scrolling
                            height={220}
                            yAxisSuffix=" kWh"
                            yLabelsOffset={0}
                            chartConfig={{
                                backgroundColor: "#fff",
                                backgroundGradientFrom: "#f8f9fa",
                                backgroundGradientTo: "#e9ecef",
                                decimalPlaces: 1,
                                color: (opacity = 1) => `rgba(0, 174, 239, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                propsForDots: { r: "4", strokeWidth: "2", stroke: "#00AEEF" },
                            }}
                            bezier
                        />
                    </View>
                </ScrollView>
            </View>

            {/* Appliance Usage */}
            <Text className="text-xl font-semibold text-gray-900 mt-5 mb-3">
                Top Appliances by Power Usage
            </Text>
            <View className="bg-white p-4 rounded-lg shadow-md">
                {/* Air Conditioner */}
                <View className="flex-row items-center justify-between py-2 border-b border-gray-300">
                    <View className="flex-row items-center">
                        <MaterialCommunityIcons name="air-conditioner" size={24} color="#00AEEF" />
                        <Text className="text-lg font-medium text-gray-800 ml-2">Air Conditioner</Text>
                    </View>
                    <Text className="text-lg text-blue-500">1.2 kWh</Text>
                </View>

                {/* Water Heater */}
                <View className="flex-row items-center justify-between py-2 border-b border-gray-300">
                    <View className="flex-row items-center">
                        <MaterialCommunityIcons name="water-boiler" size={24} color="#00AEEF" />
                        <Text className="text-lg font-medium text-gray-800 ml-2">Water Heater</Text>
                    </View>
                    <Text className="text-lg text-blue-500">0.8 kWh</Text>
                </View>

                {/* Refrigerator */}
                <View className="flex-row items-center justify-between py-2">
                    <View className="flex-row items-center">
                        <MaterialCommunityIcons name="fridge" size={24} color="#00AEEF" />
                        <Text className="text-lg font-medium text-gray-800 ml-2">Refrigerator</Text>
                    </View>
                    <Text className="text-lg text-blue-500">0.5 kWh</Text>
                </View>
            </View>
        </ScrollView>
    );
};

export default ConsumptionDetail;
