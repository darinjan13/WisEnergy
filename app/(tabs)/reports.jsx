import { useCallback, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Header from "../../components/ui/Header";
import { auth } from "../../firebase/firebaseConfig";
import { useFocusEffect } from "expo-router";
import { ActivityIndicator } from "react-native-paper";
import { useDeviceStore, useUsageStore } from "../../store/firebaseStore";
import { Picker } from "@react-native-picker/picker";
import ApplianceUsage from "../../components/reports/ApplianceUsage"
import { Ionicons } from "@expo/vector-icons";

export default function reports() {
    const insets = useSafeAreaInsets();
    const { devices, setDevices, fetchUserAppliances, userAppliances, userDevices } = useDeviceStore();
    const { reportHistory, fetchDailyReport, fetchWeeklyReport } = useUsageStore();

    const [reportCategory, setReportCategory] = useState("Daily");
    const [selectedDevice, setSelectedDevice] = useState();

    const [reportData, setReportData] = useState([]);
    const [barData, setBarData] = useState([]);

    const [totalEnergyConsumption, setTotalEnergyConsumption] = useState(0);

    const [isLoading, setIsLoading] = useState(false);


    const category = ["Monthly", "Weekly", "Daily"];

    useFocusEffect(
        useCallback(() => {
            setIsLoading(true)
            const timeout = setTimeout(() => {
                if (reportHistory !== null)
                    setIsLoading(false);
            }, 500);
            if (userAppliances.length != 0 && userDevices.length != 0) {
                const result = userDevices.map((device) => {
                    const matched = userAppliances.find(appliance => appliance.id === device.id);
                    if (matched) {
                        return {
                            device_id: device.id,
                            device_nickname: device.device_nickname,
                            appliances: matched.appliances
                        }
                    } else {
                        return null;
                    }
                }).filter(Boolean);
                setReportData(result)
            }
            return () => {
                setTotalEnergyConsumption(0);
                setReportCategory("Daily")
                setBarData(undefined)
                clearTimeout(timeout)
                setIsLoading(true)
            };
        }, [devices, userAppliances, userDevices])
    );

    useEffect(() => {
        if (devices.length === 0) setDevices();
        if (userAppliances.length === 0) fetchUserAppliances();
    }, [devices])

    useEffect(() => {
        if (selectedDevice != undefined) {
            reportData.find((device) => {
                if (device.device_id == selectedDevice) {
                    fetchDailyReport(auth.currentUser?.uid, selectedDevice, device.appliances);
                    fetchWeeklyReport(auth.currentUser?.uid, selectedDevice, device.appliances);
                }
            })
        }
    }, [selectedDevice])

    useEffect(() => {
        if (Object.keys(reportHistory[reportCategory.toLowerCase()]).length > 0) {
            setIsLoading(false)
        }
    }, [reportHistory])

    useEffect(() => {
        if (reportData.length > 0) setSelectedDevice(reportData[0].device_id)
    }, [reportData])

    if (isLoading) {
        return (
            <ScrollView className="h-full p-4" showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
                <Header />
                <View className="h-screen -mt-36 items-center justify-center">
                    <ActivityIndicator size="large" color="#166534" />
                    <Text className="text-gray-500 mt-4 text-lg font-semibold">Loading your reports data....</Text>
                </View>
            </ScrollView>
        )
    }

    const lineData = [
        { value: 10, dataPointText: "Jholmer" },
        { value: 20, dataPointText: "Jholmer" },
        { value: 25, dataPointText: "Jholmer" },
        { value: 40, dataPointText: "Jholmer" },
        { value: 35, dataPointText: "Jholmer" },
    ]

    const lineData2 = [
        { value: 5, dataPointText: "Jholmer" },
        { value: 10, dataPointText: "Jholmer" },
        { value: 15, dataPointText: "Jholmer" },
        { value: 20, dataPointText: "Jholmer" },
        { value: 15, dataPointText: "Jholmer" },
    ]

    return (
        <View className="flex-1 bg-gray-100">
            <ScrollView className="h-full p-4" showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
                <Header />
                {reportData.length === 0 ? (
                    <View className="h-screen -mt-36 items-center justify-center">
                        <Ionicons name="bar-chart-outline" size={64} color="#9CA3AF" />
                        <Text className="text-gray-500 mt-4 text-lg font-semibold">You have no devices added yet. Please add a device to view reports.</Text>
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
                            <Text className="text-2xl font-bold text-white my-auto bg-green-600 rounded-xl py-1 px-2">{totalEnergyConsumption?.toFixed(2)} kWh</Text>
                        </View>

                        <View style={styles.cardShadow} className="bg-white p-4 rounded-2xl shadow-sm mb-4">
                            <View className="flex-row items-center justify-between">
                                <Text className="text-gray-800 font-semibold mr-4">Select Device</Text>
                                <View className="flex-1 border border-gray-300 rounded-xl overflow-hidden">
                                    <Picker
                                        selectedValue={selectedDevice}
                                        onValueChange={(itemValue) => {
                                            if (selectedDevice === itemValue) {
                                                return
                                            } else {
                                                setIsLoading(true);
                                                setSelectedDevice(itemValue);
                                            }
                                        }}
                                    >
                                        {reportData.map((userDevice) => (
                                            <Picker.Item
                                                key={userDevice.device_id}
                                                label={userDevice.device_nickname || "Unnamed Device"}
                                                value={userDevice.device_id}
                                            />
                                        ))}
                                    </Picker>
                                </View>
                            </View>
                        </View>

                        <Text className="text-2xl font-bold text-[#14532d] mb-4">Savings Over Time</Text>
                        <View style={styles.cardShadow} className="bg-white p-4 rounded-2xl mb-4 shadow-sm">
                            <LineChart
                                data={lineData}
                                data2={lineData2}
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
                        {Object.keys(reportHistory[reportCategory.toLowerCase()]).length > 0 ? (
                            <ApplianceUsage category={reportCategory} data={reportHistory?.[reportCategory.toLowerCase()]?.[selectedDevice]} styles={styles} />
                        ) : <View className="h-screen -mt-36 items-center justify-center">
                            <ActivityIndicator size="large" color="#166534" />
                            <Text className="text-gray-500 mt-4 text-lg font-semibold">Loading your reports data....</Text>
                        </View>}

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