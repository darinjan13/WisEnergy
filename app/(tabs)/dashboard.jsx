import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { PieChart } from 'react-native-gifted-charts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Header from '../../components/ui/Header';
import { auth } from '../../firebase/firebaseConfig';
import { useAiGeneratedStore, useBudgetStore, useDeviceStore, useUsageStore } from '../../store/firebaseStore';
import BudgetModal from '../../components/budget/SetBudget';
import CustomProgressBar from '../../components/reports/CustomProgressBar';
import { format } from 'date-fns-tz';
import AIInsightsCarousel from '../../components/ai/Messages';

export default function Dashboard() {
    const insets = useSafeAreaInsets();
    const [modalVisible, setModalVisible] = useState(false);
    const { devices, userDevices, setDevices, listenToUserAppliances } = useDeviceStore();
    const { insights, fetchDailyAiGeneratedContent } = useAiGeneratedStore();
    const { monthlyTotalConsumption, subscribeToMonthlyTotalConsumption, fetchTodayTrend, todayTrend, topAppliances, fetchTopAppliances } = useUsageStore();
    const { locationRate, fetchLocationRate, monthlyBudget, percentUsed, fetchPercentUsed, subscribeToBudget, } = useBudgetStore();
    const [efficiency, setEfficiency] = useState(0);
    const [daysRemaining, setDaysRemaining] = useState(0);

    const [userName, setUserName] = useState("");

    useFocusEffect(
        useCallback(() => {

            if (devices.length === 0) setDevices();
            listenToUserAppliances(auth?.currentUser?.uid);
            fetchTodayTrend(auth.currentUser?.uid)
            if (locationRate == 0 || monthlyBudget === null) {
                fetchLocationRate(auth.currentUser?.uid);
                subscribeToBudget(auth.currentUser?.uid);
                subscribeToMonthlyTotalConsumption(auth.currentUser?.uid);
            }
            return () => {
            }
        }, [devices.length, locationRate, monthlyTotalConsumption, monthlyBudget])
    )

    const fetchDailyInsights = async () => {
        console.log("Fetching Ai Insights");

        const now = Date.now()
        const todayStr = format(now, "yyyy-MM-dd", { timeZone: "Asia/Manila" })
        await fetchDailyAiGeneratedContent(auth?.currentUser.uid, todayStr)
    }
    useEffect(() => {

        if (auth?.currentUser?.uid && insights.length <= 0) {
            fetchDailyInsights();
        }
        if (auth?.currentUser?.uid && topAppliances.length <= 0) {
            console.log("Fetching top Appliances");

            fetchTopAppliances(auth?.currentUser?.uid)
        }
    }, [auth?.currentUser?.uid]);

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
            setUserName("User");
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
            <ScrollView className="p-4" contentContainerStyle={{ paddingBottom: insets.bottom + 150 }}>
                <Header />
                {locationRate > 0 && (
                    <>
                        <View className="p-6 mb-6 items-center">
                            <PieChart
                                donut
                                radius={80}
                                innerRadius={60}
                                strokeWidth={0}
                                data={[
                                    { value: 100 - efficiency, color: "#e5e7eb" }, // gray-200
                                    { value: efficiency, color: "#16a34a" }, // green-600
                                ]}
                                centerLabelComponent={() => {
                                    return (
                                        <View className="items-center">
                                            <Text style={{ fontSize: 30 }}>{efficiency.toFixed(1)}%</Text>
                                            <Text className="text-center">Energy Efficiency Index</Text>
                                        </View>
                                    );
                                }}
                                textColor="black"
                            />
                        </View>

                        {/* Welcome Back + Stats */}
                        <View className="flex-row justify-between items-center mb-6">
                            {/* Left Welcome Card */}
                            <View className="bg-white rounded-2xl p-4 w-[55%] h-full" style={styles.cardShadow}>
                                <Text className="text-2xl font-extrabold mb-6">
                                    Welcome Back, {userName}!
                                </Text>
                                <Text className="text-gray-600">
                                    You've saved 150 this week compared to last!
                                </Text>
                            </View>

                            {/* Right Side Cards */}
                            <View className="w-[43%] flex-col h-full">
                                {/* Devices */}
                                <View className="bg-white rounded-xl p-4 mb-3" style={styles.cardShadow}>
                                    <View className="flex-row items-center">
                                        <MaterialCommunityIcons name="power-plug-outline" size={30} color="gray" />
                                        <Text className="font-bold text-green-600 text-2xl">
                                            {userDevices?.length}
                                        </Text>
                                    </View>
                                    <Text className="text-gray-500 text-sm">Devices</Text>
                                </View>

                                {/* Energy */}
                                <View className="bg-white rounded-xl p-4" style={styles.cardShadow}>
                                    <View className="flex-row items-center">
                                        <MaterialCommunityIcons name="lightning-bolt-outline" size={30} color="gray" />
                                        <Text className="font-extrabold text-green-600 text-2xl">{monthlyTotalConsumption}</Text>
                                        <Text className="text-sm">kWh</Text>
                                    </View>
                                    <Text className="text-gray-500 text-xs italic">
                                        Total Energy Consumption
                                    </Text>
                                </View>
                            </View>
                        </View>


                        {/* Today's Energy Trend */}
                        <View className="bg-white rounded-2xl p-4 mb-6" style={styles.cardShadow}>
                            <Text className="text-2xl font-extrabold mb-2">Today's Energy Trend</Text>
                            <Text className="text-gray-500 text-sm mb-4">
                                Tap a bar to see exact time range & kWh
                            </Text>
                            <View className="flex-row justify-between items-end h-32">
                                {Object.entries(todayTrend || {}).map(([label, value], i) => (
                                    <TouchableOpacity key={i} className="items-center">
                                        <View className="w-6 bg-green-600 rounded-md" style={{ height: value * 100 }} />
                                        <Text className="text-xs mt-1 text-gray-500">{value.toFixed(2)}</Text>
                                        <Text className="text-xs mt-1 text-gray-500">{label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Monthly Goals */}
                        <View className="bg-white rounded-2xl p-4 mb-6" style={styles.cardShadow}>
                            <Text className="text-2xl font-extrabold mb-2">Monthly Goals</Text>
                            <View className="flex-row justify-between">
                                <Text className="text-gray-500 mb-2">Current: ₱{(monthlyTotalConsumption * locationRate).toFixed(2)}</Text>
                                <Text>Goal: ₱{monthlyBudget?.budget_php}</Text>

                            </View>
                            <CustomProgressBar
                                progress={(monthlyTotalConsumption * locationRate).toFixed(2)}
                                maxProgress={monthlyBudget?.budget_php}
                                color="#4CAF50"
                                backgroundColor="#D9D9D9"
                            />
                        </View>

                        {/* Top Appliances */}
                        <View className="bg-white rounded-2xl p-4 mb-6" style={styles.cardShadow}>
                            <Text className="text-2xl font-extrabold mb-4">Top Appliances</Text>

                            {topAppliances.length > 0 ? (
                                topAppliances.map((appliance, i) => (
                                    <View key={i} className="flex-row justify-between mb-2">
                                        <Text className="text-gray-700">{appliance.name}</Text>
                                        <Text className="font-semibold">{appliance.kwh} kWh</Text>
                                    </View>
                                ))
                            ) : (
                                <Text className="text-gray-400">No usage data available</Text>
                            )}
                        </View>

                        {/* AI Insights */}
                        <View className="bg-white rounded-2xl p-4" style={styles.cardShadow}>
                            <Text className="text-2xl font-extrabold mb-4">AI Insights</Text>
                            {insights && insights.length > 0 ? (
                                <AIInsightsCarousel insights={insights} />
                            ) : (
                                <Text className="text-gray-400">No insights available</Text>
                            )}
                        </View>
                    </>
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