import React from "react";
import { View, Text } from "react-native";
import { ProgressBar } from "react-native-paper";

const BudgetTracker = ({
    budgetAmount = 2500,
    currentUsage = 1875,
    daysRemaining = 12,
    billingCycleTotal = 30,
}) => {
    // Calculate percentage of budget used
    const percentageUsed = Math.min(currentUsage / budgetAmount, 1);

    // Determine progress bar color
    const getProgressColor = () => {
        if (percentageUsed < 0.6) return "#16a34a"; // Green
        if (percentageUsed < 0.85) return "#eab308"; // Yellow
        return "#dc2626"; // Red
    };

    return (
        <View className="bg-white p-4 rounded-lg shadow-md mb-4">
            {/* Header */}
            <View className="flex-row justify-between mb-2">
                <Text className="text-lg font-bold">Monthly Budget Tracker</Text>
                <Text className="text-lg font-semibold" style={{ color: getProgressColor() }}>
                    {Math.round(percentageUsed * 100)}% Used
                </Text>
            </View>

            {/* Progress Bar */}
            <View className="my-2">
                <ProgressBar
                    progress={percentageUsed}
                    color={getProgressColor()}
                    style={{ height: 10, borderRadius: 5 }}
                />
            </View>

            {/* Budget Info */}
            <View className="flex-row justify-between mt-2">
                <View className="items-center">
                    <Text className="text-sm text-gray-500">Budget</Text>
                    <Text className="text-lg font-bold">₱{budgetAmount.toLocaleString()}</Text>
                </View>

                <View className="items-center">
                    <Text className="text-sm text-gray-500">Current Usage</Text>
                    <Text className="text-lg font-bold">₱{currentUsage.toLocaleString()}</Text>
                </View>

                <View className="items-center">
                    <Text className="text-sm text-gray-500">Days Remaining</Text>
                    <Text className="text-lg font-bold">{daysRemaining}/{billingCycleTotal}</Text>
                </View>
            </View>

            {/* Warning Message */}
            {percentageUsed > 0.85 && (
                <View className="mt-4 p-2 bg-red-50 border border-red-200 rounded-md">
                    <Text className="text-red-700 text-sm text-center">
                        Warning: You're approaching your monthly budget limit!
                    </Text>
                </View>
            )}
        </View>
    );
};

export default BudgetTracker;
