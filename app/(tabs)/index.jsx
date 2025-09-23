import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { PieChart } from 'react-native-gifted-charts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Header from '../../components/ui/Header';
import { auth } from '../../firebase/firebaseConfig';
import { useBudgetStore, useDeviceStore, useUsageStore } from '../../store/firebaseStore';
import BudgetModal from '../../components/budget/SetBudget';
import { ProgressBar } from 'react-native-paper';

export default function Dashboard() {
    const insets = useSafeAreaInsets();
    const [modalVisible, setModalVisible] = useState(false);
    const {devices} = useDeviceStore();
    const { monthlyTotalConsumption, subscribeToMonthlyTotalConsumption } = useUsageStore();
    const { locationRate, fetchLocationRate, monthlyBudget, percentUsed, fetchPercentUsed, subscribeToBudget } = useBudgetStore();
    const [efficiency, setEfficiency] = useState(0);
    const [daysRemaining, setDaysRemaining] = useState(0);

    const [userName, setUserName] = useState("");

    useFocusEffect(
        useCallback(() => {
            if (locationRate == 0 || monthlyBudget === null) {
                fetchLocationRate(auth.currentUser?.uid);
                subscribeToBudget(auth.currentUser?.uid);
                subscribeToMonthlyTotalConsumption(auth.currentUser?.uid);
            }
            return () => {
            }
        }, [locationRate, monthlyTotalConsumption, monthlyBudget])
    )

    useEffect(() => {
        if (monthlyBudget?.budget_php === 0) {
            monthlyBudget?.budget_php
            setModalVisible(true);
            return;
        }

        const resetAt = monthlyBudget?.reset_at ? new Date(monthlyBudget?.reset_at) : null;

        if (resetAt && !isNaN(resetAt.getTime())) {
            const now = new Date();
            const diffMs = resetAt - now;
            const days = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
            setDaysRemaining(days);
        }
    }, [monthlyBudget]);

    useEffect(() => {
        const user = auth?.currentUser;
        if (user) {
            setUserName(user.displayName || "User");
        }
    }, []);

    useEffect(() => {
        if (locationRate > 0 && monthlyTotalConsumption > 0 && monthlyBudget?.budget_php > 0) {
            fetchPercentUsed(monthlyTotalConsumption);
            setEfficiency(Math.max(0, 100 - ((monthlyTotalConsumption / (monthlyBudget?.budget_php / locationRate)) * 100)))
        }
    }, [locationRate, monthlyTotalConsumption, monthlyBudget])

    return (
        <View>
            <ScrollView className="p-4" contentContainerStyle={{ paddingBottom: insets.bottom + 60, }}>
                <Header />
                {locationRate > 0 && (
                    // <View className="flex-1">
                    //     <View style={styles.cardShadow} className="flex-row justify-between items-center bg-white mb-4 rounded-2xl p-5">
                    //         <View>
                    //             <Text className="text-xl font-semibold text-gray-800">Good Morning, {userName}!</Text>
                    //             <Text className="text-sm text-gray-600">You've saved ₱150 this week compared to last!</Text>
                    //         </View>
                    //     </View>

                    //     <View style={styles.cardShadow} className="flex-row justify-between bg-white p-4 mb-4 rounded-2xl">
                    //         <View className="flex-1 items-center">
                    //             <Text className="text-lg font-bold mb-2 text-[#23403A]">Energy Efficiency</Text>
                    //             <PieChart
                    //                 donut
                    //                 radius={50}
                    //                 innerRadius={35}
                    //                 data={[
                    //                     { value: efficiency, color: '#10b981' },
                    //                     { value: 100 - efficiency, color: '#E5E7EB' },
                    //                 ]}
                    //                 showText
                    //                 textColor="#111827"
                    //                 textSize={22}
                    //                 textBackgroundColor="transparent"
                    //                 centerLabelComponent={() => (
                    //                     <Text className="text-2xl font-bold text-gray-900">{efficiency.toFixed(0)}%</Text>
                    //                 )}
                    //             />
                    //             <Text className="text-sm text-green-600 mt-2">Efficient</Text>
                    //             <Text className="text-center text-gray-600 mt-2">Your household is {efficiency.toFixed(0)}% energy efficient this week.</Text>
                    //         </View>

                    //         <View className="flex-1 items-center ">
                    //             <Text className="text-lg font-bold mb-2 text-[#23403A]">Smart Budget</Text>
                    //             <PieChart
                    //                 donut
                    //                 radius={50}
                    //                 innerRadius={35}
                    //                 data={[
                    //                     { value: percentUsed, color: '#10b981' },
                    //                     { value: 100 - percentUsed, color: '#E5E7EB' },
                    //                 ]}
                    //                 showText
                    //                 textColor="#111827"
                    //                 textSize={22}
                    //                 textBackgroundColor="transparent"
                    //                 centerLabelComponent={() => (
                    //                     <Text className="text-2xl font-bold text-gray-900">{percentUsed.toFixed(0)}%</Text>
                    //                 )}
                    //             />
                    //             <Text className="mt-2 text-lg text-blue-600">You're on track!</Text>
                    //             <Text className="text-sm text-gray-600">{daysRemaining} days remaining</Text>
                    //         </View>
                    //     </View>

                    //     <View style={styles.cardShadow} className="bg-white p-4 rounded-2xl mb-4">
                    //         <Text className="text-lg font-semibold mb-2">Top Appliances</Text>
                    //         <View className="space-y-1">
                    //             <Text className="text-gray-800">❄️ Air Conditioner - <Text className="text-orange-500">High</Text></Text>
                    //             <Text className="text-gray-800">🧺 Washing Machine - <Text className="text-yellow-500">Medium</Text></Text>
                    //             <Text className="text-gray-800">💻 Computer - <Text className="text-green-600">Low</Text></Text>
                    //         </View>
                    //     </View>

                    //     <View style={styles.cardShadow} className="bg-white p-4 rounded-2xl flex-row items-center space-x-3 mb-4">
                    //         <FontAwesome name="plug" size={24} color="black" />
                    //         <Text className="text-gray-700">
                    //             Consider unplugging unused devices to save ₱50/month.
                    //         </Text>
                    //     </View>
                    // </View>
                    <>
                        <View className="bg-white rounded-2xl p-6 mb-6 items-center shadow">
                            <View className="h-40 w-40 rounded-full border-[10px] border-green-600 items-center justify-center">
                                <Text className="text-4xl font-bold">{efficiency.toFixed(2)}</Text>
                                <Text className="text-gray-600 text-sm mt-1 text-center">Energy Efficiency Index</Text>
                            </View>
                        </View>

                        {/* Welcome Back + Stats */}
                        <View className="bg-white rounded-2xl p-4 mb-6 shadow">
                            <Text className="text-lg font-semibold mb-3">Welcome Back, {userName}!</Text>
                            <Text className="text-gray-600 mb-4">You've saved 150 this week compared to last!</Text>
                            <View className="flex-row justify-between">
                                <View className="bg-gray-100 p-4 rounded-xl flex-1 mr-2 items-center">
                                    <Ionicons name="flash-outline" size={20} color="green" />
                                    <Text className="font-bold text-green-700 text-xl mt-1">{devices.length}</Text>
                                    <Text className="text-gray-500 text-xs">Devices</Text>
                                </View>
                                <View className="bg-gray-100 p-4 rounded-xl flex-1 ml-2 items-center">
                                    <Ionicons name="speedometer-outline" size={20} color="green" />
                                    <Text className="font-bold text-green-700 text-xl mt-1">21</Text>
                                    <Text className="text-gray-500 text-xs">Total Energy</Text>
                                </View>
                            </View>
                        </View>

                        {/* Today's Energy Trend */}
                        <View className="bg-white rounded-2xl p-4 mb-6 shadow">
                            <Text className="font-semibold mb-2">Today's Energy Trend</Text>
                            <Text className="text-gray-500 text-xs mb-4">
                                Tap a bar to see exact time range & kWh
                            </Text>
                            <View className="flex-row justify-between items-end h-32">
                                {[3, 7, 5, 6, 2, 8].map((val, i) => (
                                    <TouchableOpacity key={i} className="items-center">
                                        <View className="w-6 bg-green-600 rounded-md" style={{ height: val * 10 }} />
                                        <Text className="text-xs mt-1 text-gray-500">
                                            {["12am-4am", "4am-8am", "8am-12pm", "12pm-4pm", "4pm-8pm", "8pm-12am"][i]}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Monthly Goals */}
                        <View className="bg-white rounded-2xl p-4 mb-6 shadow">
                            <Text className="font-semibold mb-2">Monthly Goals</Text>
                            <Text className="text-gray-500 mb-2">Current: ₱2,000 | Goal: ₱2,500</Text>
                            <ProgressBar progress={2000 / 2500} color="#16a34a" className="h-3 rounded-full" />
                        </View>

                        {/* Top Appliances */}
                        <View className="bg-white rounded-2xl p-4 mb-6 shadow">
                            <Text className="font-semibold mb-4">Top Appliances</Text>
                            {[
                                { name: "Air Conditioner", kwh: "100kWh" },
                                { name: "Electric Fan", kwh: "90kWh" },
                                { name: "Humidifier", kwh: "60kWh" },
                            ].map((appliance, i) => (
                                <View key={i} className="flex-row justify-between mb-2">
                                    <Text className="text-gray-700">{appliance.name}</Text>
                                    <Text className="font-semibold">{appliance.kwh}</Text>
                                </View>
                            ))}
                        </View>

                        {/* AI Insights */}
                        <View className="bg-white rounded-2xl p-4 shadow">
                            <Text className="font-semibold mb-2">AI Insights</Text>
                            <Text className="text-gray-600 text-sm">
                                Turning off your humidifier helps reduce unnecessary standby power when humidity levels are already optimal.
                            </Text>
                        </View></>
                )}
            </ScrollView>
            <BudgetModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                rate={locationRate}
            />
        </View>

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