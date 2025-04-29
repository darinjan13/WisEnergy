import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { PieChart, BarChart } from 'react-native-gifted-charts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Dimensions } from 'react-native';
import Header from '../../components/ui/Header';
import { auth } from '../../firebase/firebaseConfig';
const screenWidth = Dimensions.get('window').width;

export default function Dashboard() {
    const insets = useSafeAreaInsets();
    const [userName, setUserName] = useState("");

    useEffect(() => {
        const user = auth?.currentUser;

        if (user) {
            setUserName(user.displayName || "User");
        }
    }, []);

    const efficiencyData = [
        {
            value: 82,
            color: '#10b981',
        },
        {
            value: 18,
            color: '#e5e7eb',
        },
    ];
    const smartBudget = [
        {
            value: 75,
            color: '#36a25e',
        },
        {
            value: 25,

            color: '#e5e7eb',
        },
    ];
    const barData = [
        { value: 5.1, label: 'S' },
        { value: 4.7, label: 'M' },
        { value: 2.5, label: 'T' },
        { value: 3.0, label: 'W' },
        { value: 4.2, label: 'TH' },
        { value: 5.1, label: 'F' },
        { value: 4.6, label: 'S' },
    ];
    return (
        <ScrollView className="bg-gray-100 p-4" contentContainerStyle={{ paddingBottom: insets.bottom + 60, }}>
            <Header />
            <View style={styles.cardShadow} className="flex-row justify-between items-center bg-white mb-4 rounded-2xl p-5">
                <View>
                    <Text className="text-xl font-semibold text-gray-800">Good Morning, {userName}!</Text>
                    <Text className="text-sm text-gray-600">You've saved ₱150 this week compared to last!</Text>
                </View>
            </View>

            <View style={styles.cardShadow} className="flex-row justify-between bg-white p-4 mb-4 rounded-2xl">
                <View className="flex-1 items-center">
                    <Text className="text-lg font-bold mb-2 text-[#23403A]">Energy Efficiency</Text>
                    <PieChart
                        donut
                        innerRadius={35}
                        radius={50}
                        data={efficiencyData}
                        showText
                        textColor="#111827"
                        textSize={22}
                        textBackgroundColor="transparent"
                        centerLabelComponent={() => (
                            <Text className="text-2xl font-bold text-gray-900">82%</Text>
                        )}
                    />
                    <Text className="text-sm text-green-600 mt-2">Efficient</Text>
                    <Text className="text-center text-gray-600 mt-2">Your household is 82% energy efficient this week.</Text>
                    <Text className="text-center text-blue-600 font-medium mt-2">See how to improve →</Text>
                </View>

                <View className="flex-1 items-center ">
                    <Text className="text-lg font-bold mb-2 text-[#23403A]">Smart Budget</Text>
                    <PieChart
                        donut
                        innerRadius={35}
                        radius={50}
                        data={smartBudget}
                        showText
                        textColor="#111827"
                        textSize={22}
                        textBackgroundColor="transparent"
                        centerLabelComponent={() => (
                            <Text className="text-2xl font-bold text-gray-900">75%</Text>
                        )}
                    />
                    <Text className="mt-2 text-lg text-blue-600">You're on track!</Text>
                    <Text className="text-sm text-gray-600">9 days remaining</Text>
                </View>
            </View>



            {/* Weekly Trends */}
            <View style={styles.cardShadow} className="flex-1 flex-wrap bg-white p-4 rounded-2xl mb-4">
                <View className="w-screen">
                    <Text className="text-lg font-semibold mb-2">Weekly Energy Trends</Text>
                    <BarChart
                        data={barData}
                        barWidth={screenWidth / barData.length / 1.8}
                        barBorderRadius={5}
                        frontColor="#10b981"
                        yAxisThickness={0}
                        xAxisThickness={0}
                        xAxisLabelTextStyle={{ color: '#4B5563', fontSize: 12 }}
                        yAxisTextStyle={{ color: '#4B5563' }}
                        spacing={10}
                        maxValue={6}
                        noOfSections={3}
                        isAn
                    />
                </View>
            </View>

            {/* Top Appliances */}
            <View style={styles.cardShadow} className="bg-white p-4 rounded-2xl mb-4">
                <Text className="text-lg font-semibold mb-2">Top Appliances</Text>
                <View className="space-y-1">
                    <Text className="text-gray-800">❄️ Air Conditioner - <Text className="text-orange-500">High</Text></Text>
                    <Text className="text-gray-800">🧺 Washing Machine - <Text className="text-yellow-500">Medium</Text></Text>
                    <Text className="text-gray-800">💻 Computer - <Text className="text-green-600">Low</Text></Text>
                </View>
            </View>

            {/* AI Recommendation */}
            <View style={styles.cardShadow} className="bg-white p-4 rounded-2xl flex-row items-center space-x-3 mb-4">
                <FontAwesome name="plug" size={24} color="black" />
                <Text className="text-gray-700">
                    Consider unplugging unused devices to save ₱50/month.
                </Text>
            </View>

            {/* Buttons */}
            <View className="flex-row justify-between mt-4">
                <Text className="bg-blue-100 px-4 py-2 rounded-xl text-blue-800 font-semibold">Run Appliance Checkup</Text>
                <Text className="bg-blue-100 px-4 py-2 rounded-xl text-blue-800 font-semibold">Update Budget Plan</Text>
                <Text className="bg-blue-100 px-4 py-2 rounded-xl text-blue-800 font-semibold">View Reports</Text>
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