import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ProgressBar } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const ConsumptionOverview = ({
    currentPower = 2.4,
    dailyConsumption = 18.7,
    estimatedCost = 156.32,
    maxPower = 5,
    onViewDetails,
}) => {
    const [showDetails, setShowDetails] = useState(false);

    const powerPercentage = Math.min(
        Math.round((currentPower / maxPower) * 100),
        100
    );

    const getColor = (percentage) => {
        if (percentage < 40) return "text-green-500"; // Efficient
        if (percentage < 70) return "text-yellow-500"; // Moderate
        return "text-red-500"; // High
    };

    return (
        <TouchableOpacity
            className="bg-white p-4 rounded-lg shadow-md mb-4"
            onPress={onViewDetails}
        >
            {/* Header */}
            <View className="flex-row justify-between items-center pb-2">
                <Text className="text-lg font-semibold text-gray-800">
                    Real-Time Consumption
                </Text>
                <View className="flex-row items-center">
                    <Text className="text-blue-600 font-medium mr-1">View Details</Text>
                    <MaterialCommunityIcons name="chevron-right" size={18} color="#2563eb" />
                </View>
            </View>

            {/* Consumption Stats */}
            <View className="flex-row justify-between items-center mt-2">
                {/* Current Power Usage */}
                <View className="items-center">
                    <MaterialCommunityIcons name="lightning-bolt" size={24} color="#facc15" />
                    <Text className="text-lg font-medium text-gray-700">
                        {currentPower} kW
                    </Text>
                    <Text className="text-sm text-gray-500">Current Usage</Text>
                </View>

                {/* Daily Consumption */}
                <View className="items-center">
                    <MaterialCommunityIcons name="gauge" size={24} color="#3b82f6" />
                    <Text className="text-lg font-medium text-gray-700">
                        {dailyConsumption} kWh
                    </Text>
                    <Text className="text-sm text-gray-500">Daily Consumption</Text>
                </View>

                {/* Estimated Cost */}
                <View className="items-center">
                    <MaterialCommunityIcons name="currency-usd" size={24} color="#10b981" />
                    <Text className="text-lg font-medium text-gray-700">
                        ${estimatedCost}
                    </Text>
                    <Text className="text-sm text-gray-500">Estimated Cost</Text>
                </View>
            </View>

            {/* Power Usage Progress */}
            <View className="my-4">
                <ProgressBar progress={powerPercentage / 100} color="#2563eb" />
                <Text className={`text-sm font-medium ${getColor(powerPercentage)}`}>
                    {powerPercentage}% of max power used
                </Text>
            </View>
        </TouchableOpacity>
    );
};

export default ConsumptionOverview;
