import React, { useCallback, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { BarChart, LineChart } from "react-native-gifted-charts";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Header from "../../components/ui/Header";
import { get, off, onValue, ref, set } from "firebase/database";
import { auth, db } from "../../firebase/firebaseConfig";
import { useFocusEffect } from "expo-router";
import ProgressBar from "../../components/ui/ProgressBar";

export default function reports() {
    const insets = useSafeAreaInsets();
    const [reportCategory, setReportCategory] = useState("Daily");
    const [totalEnergyConsumption, setTotalEnergyConsumption] = useState(0);
    const [loading, setLoading] = useState(true);

    const category = ["Monthly", "Weekly", "Daily"];

    useFocusEffect(
        useCallback(() => {
            fetchTotalEnergyConsumption();

            return () => {
                setTotalEnergyConsumption(0);
                setLoading(true);
            };
        }, [])
    );

    const fetchTotalEnergyConsumption = async () => {
        const now = new Date();
        const offsetDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
        const todayLocal = offsetDate.toISOString().split("T")[0];

        const dailySummaryRef = ref(db, `daily_total_consumption/${auth.currentUser.uid}/${todayLocal}`);
        const snapshot = await get(dailySummaryRef);

        setTotalEnergyConsumption(snapshot.val()?.total_energy_consumption);
        setLoading(false);
    }

    const barData = [
        { value: 80, label: 'Aircon', extraData: { kWh: 80, cost: 960 } },
        { value: 60, label: 'Washer', extraData: { kWh: 60, cost: 720 } },
        { value: 45, label: 'Fridge', extraData: { kWh: 45, cost: 540 } },
        { value: 30, label: 'TV', extraData: { kWh: 30, cost: 360 } },
    ];

    const lineData = [
        { value: 10 },
        { value: 20 },
        { value: 25 },
        { value: 40 },
        { value: 35 },
    ];

    return (
        <View className="flex-1 bg-gray-100">
            <ScrollView className="h-full p-4" showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
                <Header />
                {loading ? (
                    <View className="h-screen -mt-36 items-center justify-center">
                        <ActivityIndicator size="large" color="#166534" />
                        <Text className="text-gray-500 mt-4 text-lg font-semibold">Loading your reports data....</Text>
                    </View>
                ) : (
                    <View className="flex-1">
                        <Text className="text-2xl font-bold text-[#14532d] mb-4">Energy Usage Report</Text>
                        <View style={styles.cardShadow} className="flex-row space-x-3 mb-4 bg-white p-4 rounded-2xl shadow-sm justify-between items-center">
                            {category?.map((label, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => setReportCategory(label)}
                                    className={`px-4 py-2 rounded-full border ${label === reportCategory ? "bg-green-700 border-green-700" : "bg-white border-gray-300"}`}
                                >
                                    <Text className={`${label === reportCategory ? "text-white" : "text-black"} font-semibold`}>{label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <View className="flex-row justify-between mb-2 text-center">
                            <Text className="text-2xl font-bold text-[#14532d] my-auto">{reportCategory} Energy Consumption</Text>
                            <Text className="text-2xl font-bold text-white my-auto bg-green-600 rounded-xl py-1 px-2">{totalEnergyConsumption.toFixed(2)} kWh</Text>
                        </View>
                        <View style={styles.cardShadow} className="bg-white p-4 rounded-2xl mb-4 shadow-sm">
                            <BarChart
                                data={barData}
                                barWidth={20}
                                barBorderRadius={4}
                                frontColor="#16a34a"
                                spacing={10}
                                yAxisThickness={0}
                                xAxisLabelTextStyle={{ color: "#4B5563", fontSize: 12 }}
                                maxValue={120}
                                noOfSections={4}
                                width={250}
                            />
                        </View>

                        <Text className="text-2xl font-bold text-[#14532d] mb-4">Savings Over Time</Text>
                        <View style={styles.cardShadow} className="bg-white p-4 rounded-2xl mb-4 shadow-sm">
                            <LineChart
                                data={lineData}
                                thickness={2}
                                color="#16a34a"
                                areaChart
                                startFillColor="#bbf7d0"
                                endFillColor="#bbf7d0"
                                yAxisThickness={0}
                                xAxisThickness={0}
                            />
                        </View>

                        <Text className="text-2xl font-bold text-[#14532d] mb-4">Appliance Usage</Text>
                        <View style={styles.cardShadow} className="p-4 rounded-2xl mb-2 bg-white shadow-sm">
                            {barData?.map((item, index) => (
                                <View>
                                    <Text className="text-lg text-gray-800 font-semibold">{item.label}</Text>
                                    <ProgressBar
                                        key={index}
                                        value={item.value}
                                        max={100}
                                        height={14}
                                        barColor="#16a34a"
                                        bgColor="#e5e7eb"
                                        showLabel={true}
                                    />
                                    <Text className="text-gray-600 text-xs -mt-4 mb-4">
                                        {item.extraData.kWh} kWh | ₱{item.extraData.cost}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}
            </ScrollView>
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