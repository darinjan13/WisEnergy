import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Modal, TouchableWithoutFeedback } from 'react-native';
import { Feather, FontAwesome6, MaterialCommunityIcons } from '@expo/vector-icons';
import { BarChart, PieChart } from 'react-native-gifted-charts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Tooltip } from 'react-native-paper';

import Header from '@/components/ui/Header';
import { auth } from '@/firebase/firebaseConfig';
import { useAiGeneratedStore, useBudgetStore, useDeviceStore, useUsageStore } from '@/store/firebaseStore';
import BudgetModal from '@/components/budget/SetBudget';
import CustomProgressBar from '@/components/reports/CustomProgressBar';
import { format } from 'date-fns-tz';
import AIInsightsCarousel from '@/components/ai/Messages';

export default function Dashboard() {
    const insets = useSafeAreaInsets();
    const [modalVisible, setModalVisible] = useState(false);
    const { devices, userDevices, setDevices, listenToUserAppliances } = useDeviceStore();
    const { insights, fetchDailyAiGeneratedContent } = useAiGeneratedStore();
    const { monthlyTotalConsumption, subscribeToMonthlyTotalConsumption, fetchTodayTrend, todayTrend, topAppliances, fetchTopAppliances, fetchAllMonthlyTotalConsumption, allMonthlyTotalConsumption } = useUsageStore();
    const { locationRate, fetchLocationRate, monthlyBudget, percentUsed, fetchPercentUsed, subscribeToBudget } = useBudgetStore();
    const [efficiency, setEfficiency] = useState(0);
    const [daysRemaining, setDaysRemaining] = useState(0);
    const [totalEnergyConsumption, setTotalEnergyConsumption] = useState(0);
    const [selectedBar, setSelectedBar] = useState(null);
    const [hourlyData, setHourlyData] = useState([]);
    const [efficiencyTooltip, setEfficiencyTooltip] = useState(false);
    const [userName, setUserName] = useState("");

    useFocusEffect(
        useCallback(() => {

            if (devices.length === 0) setDevices();
            listenToUserAppliances(auth?.currentUser?.uid);
            fetchTodayTrend(auth.currentUser?.uid)
            fetchAllMonthlyTotalConsumption(auth.currentUser?.uid)
            if (locationRate == 0 || monthlyBudget === null) {
                fetchLocationRate(auth.currentUser?.uid);
                subscribeToBudget(auth.currentUser?.uid);
                subscribeToMonthlyTotalConsumption(auth.currentUser?.uid);
            }
            return () => {
            }
        }, [devices.length, locationRate, monthlyTotalConsumption, monthlyBudget])
    )

    useEffect(() => {
        if (totalEnergyConsumption <= 0) {
            const total = allMonthlyTotalConsumption.reduce(
                (sum, item) => sum + (item.value || 0),
                0
            );
            setTotalEnergyConsumption(total)
        }
    }, [allMonthlyTotalConsumption]);

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
            setUserName(user.displayName);
        }
    }, []);

    useEffect(() => {
        if (locationRate > 0 && monthlyTotalConsumption > 0 && monthlyBudget?.budget_php > 0) {
            fetchPercentUsed(monthlyTotalConsumption);
            setEfficiency(Math.max(0, 100 - ((monthlyTotalConsumption / (monthlyBudget?.budget_php / locationRate)) * 100)))

        }
    }, [locationRate, monthlyTotalConsumption, monthlyBudget])

    const handleBarPress = (label) => {
        const ranges = {
            "12am-4am": [0, 3],
            "4am-8am": [4, 7],
            "8am-12pm": [8, 11],
            "12pm-4pm": [12, 15],
            "4pm-8pm": [16, 19],
            "8pm-12am": [20, 23],
        };

        const [start, end] = ranges[label];

        const filtered = Object.entries(todayTrend?.hourlyData || {})
            .filter(([hourKey]) => {
                const h = parseInt(hourKey.split(":")[0]);
                return h >= start && h <= end;
            })
            .map(([hour, val]) => {
                const h = parseInt(hour.split(":")[0]);
                const ampm = h >= 12 ? "pm" : "am";
                const displayHour = h % 12 === 0 ? 12 : h % 12;
                return {
                    label: `${displayHour}${ampm}`, // 1am, 2am, 3pm, etc.
                    value: parseFloat(val) || 0,
                };
            });

        setHourlyData(filtered);
        setSelectedBar({
            label,
            value: filtered.reduce((a, b) => a + b.value, 0),
        });
    };

    return (
        <View>
            <ScrollView className="p-5 bg-white" contentContainerStyle={{ paddingBottom: insets.bottom + 150, paddingTop: insets.top }}>
                <Header />
                {locationRate > 0 ? (
                    <>
                        <View className="p-6 mb-6 items-center relative">
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
                                            <Text className="text-4xl font-bold">{efficiency.toFixed(0)}</Text>
                                            <Text className="text-md text-center">Energy Efficiency Index</Text>
                                            <TouchableOpacity
                                                onPress={() => setEfficiencyTooltip(!efficiencyTooltip)}
                                                className="p-1"
                                            >
                                                <Feather name="info" size={18} color="gray" />
                                            </TouchableOpacity>

                                        </View>
                                    );
                                }}
                                textColor="black"
                            />
                            {efficiencyTooltip && (
                                <TouchableWithoutFeedback onPress={() => setEfficiencyTooltip(false)}>
                                    <View className="absolute top-[150px] bg-white border border-gray-300 rounded-xl p-3 w-[90%] z-50 mx-auto"
                                        style={{
                                            shadowColor: "#000",
                                            shadowOffset: { width: 0, height: 2 },
                                            shadowOpacity: 0.15,
                                            shadowRadius: 4,
                                            elevation: 3,
                                        }}
                                    >
                                        <Text className="text-gray-600 text-[13px] leading-5 text-center">
                                            Energy Efficiency Index is calculated from your consumption patterns
                                            compared to your budget and previous usage. A higher score means
                                            more efficient energy use.
                                        </Text>
                                    </View>
                                </TouchableWithoutFeedback>
                            )}
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
                                <View className="bg-white rounded-xl p-4 mb-3 items-center" style={styles.cardShadow}>
                                    <View className="flex-row items-center">
                                        <MaterialCommunityIcons name="power-plug-outline" size={30} color="gray" />
                                        <Text className="text-3xl font-bold text-green-600">
                                            {userDevices?.length}
                                        </Text>
                                    </View>
                                    <Text className="text-gray-500 text-sm">Devices</Text>
                                </View>

                                {/* Energy */}
                                <View className="bg-white rounded-xl p-4 items-center" style={styles.cardShadow}>
                                    <View className="flex-row items-center">
                                        <MaterialCommunityIcons name="lightning-bolt-outline" size={30} color="gray" />
                                        <Text className="text-3xl font-bold text-green-600">{totalEnergyConsumption.toFixed(2)}</Text>
                                    </View>
                                    <Text className="text-gray-500 text-xs italic">
                                        Total Energy Consumption(kWh)
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
                                {Object.entries(todayTrend?.buckets || {}).map(([label, value], i) => (
                                    <TouchableOpacity key={i} className="items-center" onPress={() => handleBarPress(label)}>
                                        <View className="w-6 bg-green-600 rounded-md" style={{ height: value * 100 }} />
                                        <Text className="text-md mt-1 text-gray-500">{value.toFixed(2)}</Text>
                                        <Text className="text-sm mt-1 text-gray-500">{label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Monthly Goals */}
                        <View className="bg-white rounded-2xl p-4 mb-6" style={styles.cardShadow}>
                            <Text className="text-2xl font-extrabold mb-2">Monthly Goals</Text>
                            <Text className="text-sm text-black mb-4">Monitor your estimated monthly energy bills against your set target.</Text>
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
                            <Text className="text-sm text-black mb-4">See which appliances are consuming the most energy</Text>
                            {topAppliances.length > 0 ? (
                                topAppliances.map((appliance, i) => (
                                    <View key={i} className="flex-row justify-center gap-x-10 mb-2 items-center">
                                        <View className="flex-row items-center">
                                            <MaterialCommunityIcons name={`numeric-${i + 1}-circle`} size={20} color="green" />
                                            <Text className="text-gray-700 ml-2">{appliance.name}</Text>
                                        </View>
                                        <FontAwesome6 name="arrow-right-long" size={15} color="gray" />
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
                ) : (
                    <View className="h-screen -mt-36 items-center justify-center">
                        <ActivityIndicator size="large" color="#166534" />
                        <Text className="text-gray-500 mt-4 text-lg font-semibold">
                            Loading dashboard...
                        </Text>
                    </View>
                )}
            </ScrollView>
            <Modal
                visible={!!selectedBar}
                transparent
                animationType="fade"
                onRequestClose={() => setSelectedBar(null)}
            >
                <View className="flex-1 justify-center items-center bg-black/40 px-4">
                    <View className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <Text className="text-lg font-bold text-center mb-2">
                            {selectedBar?.label}
                        </Text>

                        <Text className="text-center text-gray-700 mb-4 text-base">
                            Total Consumption:{" "}
                            <Text className="font-semibold text-green-700">
                                {selectedBar?.value?.toFixed(3)} kWh
                            </Text>
                        </Text>

                        {hourlyData.length > 0 ? (
                            <View style={{ width: "100%", alignItems: "center" }}>
                                <BarChart
                                    data={hourlyData}
                                    barWidth={36}
                                    spacing={40}
                                    disableScroll
                                    frontColor="#16a34a"
                                    yAxisTextStyle={{ color: "#6B7280", fontSize: 11 }}
                                    xAxisLabelTextStyle={{ color: "#6B7280", fontSize: 11 }}
                                    noOfSections={4}
                                    animationDuration={800}
                                    yAxisThickness={0}
                                    xAxisThickness={0}
                                    width={320} // full width in modal
                                    maxValue={Math.max(...hourlyData.map((d) => d.value)) * 1.2 || 1}
                                    initialSpacing={20}
                                    barBorderRadius={6}
                                    xAxisLabelsVerticalShift={8}
                                    yAxisLabelWidth={32}
                                />
                            </View>
                        ) : (
                            <Text className="text-center text-gray-400">No hourly data</Text>
                        )}

                        <TouchableOpacity
                            onPress={() => setSelectedBar(null)}
                            className="mt-6 py-3 bg-emerald-600 rounded-lg"
                        >
                            <Text className="text-white text-center font-semibold text-base">
                                Close
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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