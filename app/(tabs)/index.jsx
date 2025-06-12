import { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { PieChart, BarChart } from 'react-native-gifted-charts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Dimensions } from 'react-native';
import Header from '../../components/ui/Header';
import { auth } from '../../firebase/firebaseConfig';
import { useFocusEffect } from 'expo-router';
import { ActivityIndicator } from 'react-native-paper';
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

            <View style={styles.cardShadow} className="bg-white p-4 rounded-2xl mb-4">
                <Text className="text-lg font-semibold mb-2">Top Appliances</Text>
                <View className="space-y-1">
                    <Text className="text-gray-800">❄️ Air Conditioner - <Text className="text-orange-500">High</Text></Text>
                    <Text className="text-gray-800">🧺 Washing Machine - <Text className="text-yellow-500">Medium</Text></Text>
                    <Text className="text-gray-800">💻 Computer - <Text className="text-green-600">Low</Text></Text>
                </View>
            </View>

            <View style={styles.cardShadow} className="bg-white p-4 rounded-2xl flex-row items-center space-x-3 mb-4">
                <FontAwesome name="plug" size={24} color="black" />
                <Text className="text-gray-700">
                    Consider unplugging unused devices to save ₱50/month.
                </Text>
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