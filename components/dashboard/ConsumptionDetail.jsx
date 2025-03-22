import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Dimensions, Platform } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { CartesianChart, Line } from "victory-native";
// import "@/assets/fonts/SpaceMono-Regular.ttf";
import { useFont, Skia } from "@shopify/react-native-skia";
import Svg from "react-native-svg";

const screenWidth = Dimensions.get("window").width;

const ConsumptionDetail = ({ onBack }) => {
    const [timeFrame, setTimeFrame] = useState("hourly");

    const font = useFont(require("@/assets/fonts/SpaceMono-Regular.ttf"), 12);

    if (!font) {
        return (
            <TouchableOpacity className="flex-row items-center mb-4" onPress={onBack}>
                <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
                <Text className="text-lg ml-2 text-gray-800">Back to Dashboard</Text>
            </TouchableOpacity>
        ) // Prevent errors by waiting for font to load
    }

    const timeFrameData = {
        hourly: [
            { time: "1 AM", consumption: 1.2 }, { time: "2 AM", consumption: 1.8 },
            { time: "3 AM", consumption: 2.4 }, { time: "4 AM", consumption: 3.2 },
            { time: "5 AM", consumption: 2.8 }, { time: "6 AM", consumption: 2.5 },
            { time: "7 AM", consumption: 2.3 }, { time: "8 AM", consumption: 2.7 },
            { time: "9 AM", consumption: 3.0 }, { time: "10 AM", consumption: 3.5 },
            { time: "11 AM", consumption: 4.0 }, { time: "12 PM", consumption: 5.0 },
            { time: "1 PM", consumption: 4.2 }, { time: "2 PM", consumption: 4.0 },
            { time: "3 PM", consumption: 3.8 }, { time: "4 PM", consumption: 3.6 },
            { time: "5 PM", consumption: 3.3 }, { time: "6 PM", consumption: 3.0 },
            { time: "7 PM", consumption: 2.7 }, { time: "8 PM", consumption: 2.5 },
            { time: "9 PM", consumption: 2.3 }, { time: "10 PM", consumption: 2.0 },
            { time: "11 PM", consumption: 1.8 }, { time: "12 AM", consumption: 1.5 }
        ],
        daily: [
            { time: "Mon", consumption: 16.5 }, { time: "Tue", consumption: 17.2 },
            { time: "Wed", consumption: 18.7 }, { time: "Thu", consumption: 19.4 },
            { time: "Fri", consumption: 20.1 }
        ],
        weekly: [
            { time: "Week 1", consumption: 112.5 }, { time: "Week 2", consumption: 118.3 },
            { time: "Week 3", consumption: 124.7 }, { time: "Week 4", consumption: 130.2 },
            { time: "Week 5", consumption: 135.6 }
        ],
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

            {/* Line Chart using Victory Native */}
            <View className="bg-white p-4 rounded-lg shadow-md mb-5 w-full">
                <Text className="text-lg font-medium text-gray-900 mb-2">
                    {timeFrame.charAt(0).toUpperCase() + timeFrame.slice(1)} Consumption
                </Text>
                <View style={{ height: 220 }}>
                    {Platform.OS === "web" ? (
                        <Svg width={screenWidth} height={220}>
                            <CartesianChart
                                data={timeFrameData[timeFrame]}
                                xKey="time"
                                yKeys={["consumption"]}
                                axisOptions={{ font }}
                            >
                                {({ points }) => (
                                    <Line
                                        points={points.consumption}
                                        color={timeFrame === "hourly" ? "blue" : timeFrame === "daily" ? "green" : "red"}
                                        strokeWidth={3}
                                    />
                                )}
                            </CartesianChart>
                        </Svg>
                    ) : (
                        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                            <View style={{ width: Math.max(screenWidth, timeFrameData[timeFrame].length * 10), height: 220 }}>
                                <CartesianChart
                                    data={timeFrameData[timeFrame]}
                                    xKey="time"
                                    yKeys={["consumption"]}
                                    axisOptions={{ font }}
                                >
                                    {({ points }) => (
                                        <Line
                                            points={points.consumption}
                                            color={timeFrame === "hourly" ? "blue" : timeFrame === "daily" ? "green" : "red"}
                                            strokeWidth={3}
                                            connectMissingData={true}
                                            tooltip={({ datum }) => (
                                                <VictoryTooltip
                                                    text={`Time: ${datum.time}\nConsumption: ${datum.consumption} kWh`}
                                                    flyoutStyle={{ fill: "white", stroke: "gray" }}
                                                />
                                            )}
                                        />
                                    )}
                                </CartesianChart>
                            </View>
                        </ScrollView>
                    )}

                </View>
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
        </ScrollView >
    );
};

export default ConsumptionDetail;
