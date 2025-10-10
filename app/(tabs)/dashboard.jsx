import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Feather, FontAwesome6, MaterialCommunityIcons } from '@expo/vector-icons';
import { BarChart, PieChart } from 'react-native-gifted-charts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format } from 'date-fns-tz';

import Header from '@/components/ui/Header';
import { auth } from '@/firebase/firebaseConfig';
import { useAiGeneratedStore, useBudgetStore, useDeviceStore, useUsageStore } from '@/store/firebaseStore';
import CustomProgressBar from '@/components/reports/CustomProgressBar';
import AIInsightsCarousel from '@/components/ai/Messages';
import Tooltip from '@/components/ui/Tooltip';
import { AutoSkeletonIgnoreView, AutoSkeletonView } from 'react-native-auto-skeleton';

export default function Dashboard() {
    const insets = useSafeAreaInsets();
    const { devices, userDevices, setDevices, listenToUserAppliances } = useDeviceStore();
    const { insights, fetchDailyAiGeneratedContent } = useAiGeneratedStore();
    const { monthlyTotalConsumption, subscribeToMonthlyTotalConsumption, fetchTodayTrend, todayTrend, topAppliances, fetchTopAppliances, fetchAllMonthlyTotalConsumption, allMonthlyTotalConsumption, weeklyTotals, fetchWeeklyTotals, dailyTotals, fetchDailyTotals } = useUsageStore();
    const { locationRate, fetchLocationRate, monthlyBudget, fetchPercentUsed, subscribeToBudget } = useBudgetStore();
    const [efficiency, setEfficiency] = useState(0);
    const [efficiencyColor, setEfficiencyColor] = useState('#16a34a');
    const [totalEnergyConsumption, setTotalEnergyConsumption] = useState(0);
    const [selectedBar, setSelectedBar] = useState(null);
    const [hourlyData, setHourlyData] = useState([]);
    const [toolTip, setToolTip] = useState(false);
    const [userName, setUserName] = useState("");
    const [isLoading, setIsLoading] = useState(true)
    const [weeklySavings, setWeeklySavings] = useState(0);
    useFocusEffect(
        useCallback(() => {
            const userId = auth?.currentUser?.uid;
            if (!userId) return;

            const setupData = async () => {
                if (devices.length === 0) {
                    await setDevices();
                }
                await calculateWeeklySavings(userId);

                listenToUserAppliances(userId);

                if (locationRate === 0 || monthlyBudget === null) {
                    await fetchLocationRate(userId);
                    subscribeToBudget(userId);
                    subscribeToMonthlyTotalConsumption(userId);
                }

                if (!todayTrend) {
                    await fetchTodayTrend(userId);
                }

                if (allMonthlyTotalConsumption.length === 0) {
                    await fetchAllMonthlyTotalConsumption(userId);
                }
            };

            setupData();
            const timeout = setTimeout(() => {
                if (locationRate > 0) {
                    setIsLoading(false);
                }
            }, 1000);
            return () => {
                setIsLoading(true)
                clearTimeout(timeout)
                setToolTip(false)
            }
        }, [locationRate])
    )
    useEffect(() => {
        const userId = auth?.currentUser?.uid;
        if (userId && locationRate > 0) {
            calculateWeeklySavings(userId);
        }
    }, [weeklyTotals, locationRate]);

    const calculateWeeklySavings = async (userId) => {
        try {
            if (!userId) return;

            if (!weeklyTotals?.length) await fetchWeeklyTotals(userId);
            if (!dailyTotals?.length) await fetchDailyTotals(userId);

            const weeklyData = weeklyTotals[0]?.barData || [];
            if (weeklyData.length < 1) return;

            const sortedWeeks = [...weeklyData].sort((a, b) =>
                a.label.localeCompare(b.label)
            );

            const prevWeek = sortedWeeks[sortedWeeks.length - 1]?.value || 0;

            const today = new Date();
            const dayOfWeek = today.getDay();
            const lastSunday = new Date(today);
            lastSunday.setDate(today.getDate() - dayOfWeek);
            const lastSundayLocal = new Date(lastSunday.getTime() + 8 * 60 * 60 * 1000);

            const currentWeekDays = dailyTotals[0]?.barData?.filter((d) => {
                const dDate = new Date(d.date);
                return dDate > lastSundayLocal;
            }) || [];

            const currentWeekTotal = currentWeekDays.reduce(
                (sum, d) => sum + (d.value || 0),
                0
            );
            const diff = (prevWeek - currentWeekTotal) * (locationRate || 0);

            setWeeklySavings(Number(diff.toFixed(2)));
        } catch (err) {
            console.error("Error computing weekly savings:", err);
        }
    };


    useEffect(() => {
        if (totalEnergyConsumption <= 0) {
            const total = allMonthlyTotalConsumption.reduce(
                (sum, item) => sum + (item.value || 0),
                0
            );
            setTotalEnergyConsumption(total)
        }
    }, [allMonthlyTotalConsumption]);

    useEffect(() => {
        const userId = auth?.currentUser?.uid;
        if (!userId) return;

        const fetchInitialData = async () => {
            if (insights.length === 0) {
                console.log("Fetching AI Insights");
                const now = Date.now();
                const todayStr = format(now, "yyyy-MM-dd", { timeZone: "Asia/Manila" });
                await fetchDailyAiGeneratedContent(userId, todayStr);
            }

            if (topAppliances.length === 0) {
                console.log("Fetching top Appliances");
                await fetchTopAppliances(userId);
            }
        };

        fetchInitialData();
    }, []);

    useEffect(() => {
        const user = auth?.currentUser;
        if (user) {
            setUserName(user.displayName);
        }
    }, []);

    useEffect(() => {
        if (locationRate > 0 && monthlyTotalConsumption > 0 && monthlyBudget?.budget_php > 0) {
            fetchPercentUsed(monthlyTotalConsumption);
            const budgetedKwh = monthlyBudget.budget_php / locationRate;
            const ratio = monthlyTotalConsumption / budgetedKwh;
            const efficiency = 100 - (ratio * 100);
            const finalEfficiency = Math.max(0, efficiency.toFixed(0));
            setEfficiency(finalEfficiency);
            setEfficiencyColor(
                finalEfficiency === 0 ? '#dc2626' :
                    finalEfficiency < 10 ? '#f59e0b' :
                        '#16a34a'
            );
        } else {
            setEfficiencyColor('#16a34a');
        }
    }, [locationRate, monthlyTotalConsumption, monthlyBudget]);

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
                    label: `${displayHour}${ampm} `,
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
                <AutoSkeletonView isLoading={isLoading}>
                    <View className="p-6 mb-6 items-center">
                        <PieChart
                            donut
                            radius={80}
                            innerRadius={60}
                            strokeWidth={0}
                            data={[
                                { value: 100 - efficiency, color: "#e5e7eb" },
                                { value: efficiency, color: efficiencyColor },
                            ]}
                            centerLabelComponent={() => (
                                <View className="items-center">
                                    <Text className="text-4xl font-bold">{efficiency}</Text>
                                    <Text className="text-md text-center">Energy Efficiency Index</Text>
                                    <TouchableOpacity onPress={() => setToolTip(!toolTip)} className="p-1">
                                        <Feather name="info" size={18} color="gray" />
                                    </TouchableOpacity>
                                </View>
                            )}
                            textColor="black"
                        />
                        <AutoSkeletonIgnoreView>
                            {monthlyBudget === null && !isLoading ? (
                                <Text className="text-red-600 text-sm mt-2">
                                    No budget is set, set budget first on budget page.
                                </Text>

                            ) : efficiency === 0 && monthlyBudget?.budget_kwh === monthlyTotalConsumption && (
                                <Text className="text-red-600 text-sm mt-2">
                                    You've exceeded your budget! Try reducing energy usage.
                                </Text>
                            )}
                            {efficiency > 0 && efficiency < 10 && (
                                <Text className="text-yellow-600 text-sm mt-2">
                                    You're close to exceeding your budget! Monitor your usage.
                                </Text>
                            )}
                        </AutoSkeletonIgnoreView>
                    </View >
                    <Tooltip
                        toolTip={toolTip}
                        setToolTip={setToolTip}
                        content={`Energy Efficiency Index shows how your current energy consumption compares to your monthly budget.A higher score means you're using less of your budget. Yellow indicates you're near your budget, and red means you've exceeded it.`}
                        from="Dashboard"
                    />
                    <View className="flex-row justify-between items-center mb-6" >
                        <View className="bg-white rounded-2xl p-4 w-[55%] h-full" style={styles.cardShadow}>
                            <Text className="text-xl font-extrabold mb-6">
                                Welcome Back, {userName}!
                            </Text>
                            {weeklySavings > 0 ? (
                                <View className="flex-row items-center">
                                    <Feather name="trending-down" size={15} color="#16a34a" />
                                    <Text className="text-green-700 ml-2 text-base font-sm">
                                        You've saved ₱{weeklySavings} this week compared to last!
                                    </Text>
                                </View>
                            ) : weeklySavings < 0 ? (
                                <View className="flex-row items-center">
                                    <Feather name="trending-up" size={18} color="#dc2626" />
                                    <Text className="text-red-600 ml-2 text-base font-medium">
                                        Energy usage increased this week.
                                    </Text>
                                </View>
                            ) : (
                                <Text className="text-gray-500 text-base">
                                    Keep tracking your usage to see weekly changes!
                                </Text>
                            )}
                        </View>
                        <View className="w-[43%] flex-col h-full">
                            <View className="bg-white rounded-xl p-4 mb-3 items-center" style={styles.cardShadow}>
                                <View className="flex-row items-center">
                                    <MaterialCommunityIcons name="power-plug-outline" size={30} color="gray" />
                                    <Text className="text-3xl font-bold text-green-600">
                                        {userDevices?.length}
                                    </Text>
                                </View>
                                <Text className="text-gray-500 text-sm">Devices</Text>
                            </View>
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
                    </View >
                    <View className="bg-white rounded-2xl p-4 mb-6" style={styles.cardShadow}>
                        <Text className="text-2xl font-extrabold mb-2">Today's Energy Trend</Text>
                        <Text className="text-gray-500 text-sm mb-4">
                            Tap a bar to see exact time range & kWh
                        </Text>
                        <View
                            className={`flex-row justify-between items-end ${todayTrend?.buckets && Object.keys(todayTrend.buckets).length > 0 ? 'h-32' : ''
                                }`}
                        >
                            {todayTrend?.buckets && Object.keys(todayTrend.buckets).length > 0 ? (
                                Object.entries(todayTrend.buckets).map(([label, value], i) => (
                                    <TouchableOpacity key={i} className="items-center mx-3" onPress={() => handleBarPress(label)}>
                                        <View className="w-6 bg-green-600 rounded-md" style={{ height: value * 100 }} />
                                        <Text className="text-md mt-1 text-gray-500">{value.toFixed(2)}</Text>
                                        <Text className="text-sm mt-1 text-gray-500">{label.split("-")[0]}</Text>
                                    </TouchableOpacity>
                                ))
                            ) : (
                                <View className="items-center justify-center">
                                    <Text className="text-gray-500 text-md">No data available for today.</Text>
                                </View>
                            )}
                        </View>
                    </View>
                    <View className="bg-white rounded-2xl p-4 mb-6" style={styles.cardShadow}>
                        <Text className="text-2xl font-extrabold mb-2">Monthly Goals</Text>
                        <Text className="text-sm text-black mb-4">Monitor your estimated monthly energy bills against your set target.</Text>
                        {monthlyBudget !== null ? (
                            <View><View className="flex-row justify-between">
                                <Text className="text-gray-500 mb-2">Current: ₱{(monthlyTotalConsumption * locationRate).toFixed(2)}</Text>
                                <Text>Goal: ₱{monthlyBudget?.budget_php}</Text>
                            </View>
                                <CustomProgressBar
                                    progress={(monthlyTotalConsumption * locationRate).toFixed(2)}
                                    maxProgress={monthlyBudget?.budget_php}
                                    color="#4CAF50"
                                    backgroundColor="#D9D9D9"
                                /></View>
                        ) : (
                            <View className="">
                                <Text className="text-gray-500 text-md">No data budget is set, set it at budget page.</Text>
                            </View>
                        )}
                    </View>
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
                    <View className="bg-white rounded-2xl p-4" style={styles.cardShadow}>
                        <Text className="text-2xl font-extrabold mb-4">AI Insights</Text>
                        {insights && insights.length > 0 ? (
                            <AIInsightsCarousel insights={insights} />
                        ) : (
                            <Text className="text-gray-400">AI will give you personalized tips to save energy when data is available</Text>
                        )}
                    </View>
                </AutoSkeletonView >
            </ScrollView >
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
                                    width={320}
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
                            className="mt-6 py-3 bg-red-600 rounded-lg"
                        >
                            <Text className="text-white text-center font-semibold text-base">
                                Close
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View >
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