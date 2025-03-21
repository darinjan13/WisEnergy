import React, { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const EnergyTips = ({ tips = defaultTips }) => {
    const [currentTipIndex, setCurrentTipIndex] = useState(0);

    const nextTip = () => {
        setCurrentTipIndex((prevIndex) => (prevIndex + 1) % tips.length);
    };

    const prevTip = () => {
        setCurrentTipIndex(
            (prevIndex) => (prevIndex - 1 + tips.length) % tips.length
        );
    };

    const currentTip = tips[currentTipIndex];

    return (
        <View className="w-full bg-white shadow-md p-4 rounded-lg mb-10">
            <View className="flex-row items-center gap-2 mb-3">
                <MaterialCommunityIcons name="lightning-bolt" size={20} color="#FACC15" />
                <Text className="text-lg font-semibold text-gray-900">
                    Energy Saving Tips
                </Text>
            </View>

            <ScrollView className="space-y-2">
                <Text className="font-medium text-base text-gray-900">
                    {currentTip.title}
                </Text>
                <Text className="text-sm text-gray-600">{currentTip.description}</Text>
                <Text className="text-sm font-medium text-green-600">
                    Potential savings: {currentTip.potentialSavings}
                </Text>
            </ScrollView>

            <View className="flex-row justify-between items-center pt-3">
                <Text className="text-xs text-gray-500">
                    Tip {currentTipIndex + 1} of {tips.length}
                </Text>
                <View className="flex-row gap-2">
                    <Pressable
                        className="h-8 w-8 items-center justify-center border border-gray-300 rounded-full"
                        onPress={prevTip}
                    >
                        <MaterialCommunityIcons name="chevron-left" size={16} color="black" />
                    </Pressable>
                    <Pressable
                        className="h-8 w-8 items-center justify-center border border-gray-300 rounded-full"
                        onPress={nextTip}
                    >
                        <MaterialCommunityIcons name="chevron-right" size={16} color="black" />
                    </Pressable>
                </View>
            </View>
        </View>
    );
};

const defaultTips = [
    {
        id: 1,
        title: "Adjust your refrigerator temperature",
        description:
            "Setting your refrigerator to 3-5°C instead of 2°C can reduce its energy consumption by up to 25%.",
        potentialSavings: "₱150-300 per month",
    },
    {
        id: 2,
        title: "Use natural ventilation",
        description:
            "Opening windows during cooler hours instead of using air conditioning can significantly reduce your energy bill.",
        potentialSavings: "₱500-1000 per month",
    },
    {
        id: 3,
        title: "Switch to LED lighting",
        description:
            "Replacing all incandescent bulbs with LED alternatives uses up to 75% less energy and lasts 25 times longer.",
        potentialSavings: "₱200-400 per month",
    },
    {
        id: 4,
        title: "Unplug idle electronics",
        description:
            "Devices on standby can account for up to 10% of your home's energy use. Unplug them when not in use.",
        potentialSavings: "₱100-250 per month",
    },
    {
        id: 5,
        title: "Run full loads of laundry",
        description:
            "Washing machines use the same amount of energy regardless of load size. Wait until you have a full load.",
        potentialSavings: "₱150-300 per month",
    },
];

export default EnergyTips;
