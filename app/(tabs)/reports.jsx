import { useCallback, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal, useColorScheme } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Header from "@/components/ui/Header";
import { auth } from "@/firebase/firebaseConfig";
import { useFocusEffect } from "expo-router";
import { ActivityIndicator } from "react-native-paper";
import { useBudgetStore, useDeviceStore, useUsageStore } from "@/store/firebaseStore";
import { Picker } from "@react-native-picker/picker";
import ApplianceUsage from "@/components/reports/ApplianceUsage"
import { Ionicons } from "@expo/vector-icons";
import CustomProgressBar from "@/components/reports/CustomProgressBar";
import { BlurView } from "expo-blur";
import EnergyPredictionChart from "@/components/reports/EnergyPredictionChart";
import { AutoSkeletonView } from "react-native-auto-skeleton";

export default function reports() {
    const scheme = useColorScheme();
    const isDark = scheme === "dark";
    const insets = useSafeAreaInsets();
    const { devices, setDevices, fetchUserAppliances, userAppliances, userDevices } = useDeviceStore();
    const { reportHistory, fetchDailyReport, fetchWeeklyReport, fetchMonthlyReport, monthlyTotalConsumption, fetchAllMonthlyTotalConsumption, allMonthlyTotalConsumption, latestKwh, fetchAllLatestKwh, dailyTotals, weeklyTotals, monthlyTotals, fetchDailyTotals, fetchWeeklyTotals, fetchMonthlyTotals } = useUsageStore();
    const { monthlyBudget, allBudget, fetchAllBudget } = useBudgetStore();

    const [reportCategory, setReportCategory] = useState("Daily");
    const [selectedDevice, setSelectedDevice] = useState();

    const [reportData, setReportData] = useState([]);
    const [reports, setReports] = useState([]);
    const [lineData1, setLineData1] = useState([]);
    const [reportsTotal, setReportsTotal] = useState([]);
    const [lineData2, setLineData2] = useState([]);

    const [isLoading, setIsLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [reportLoading, setReportLoading] = useState(true);
    const [selectedAppliance, setSelectedAppliance] = useState(null);

    const [maxProgress, setMaxProgress] = useState(10);

    const category = ["Monthly", "Weekly", "Daily"];

    useFocusEffect(
        useCallback(() => {
            // setIsLoading(true)
            fetchAllMonthlyTotalConsumption(auth.currentUser?.uid)
            fetchAllBudget(auth.currentUser?.uid)
            fetchDailyTotals(auth.currentUser?.uid);
            fetchWeeklyTotals(auth.currentUser?.uid);
            fetchMonthlyTotals(auth.currentUser?.uid);

            const timeout = setTimeout(() => {
                if (reportHistory !== null)
                    setIsLoading(false);
            }, 1000);
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
                setReportCategory("Daily")
                clearTimeout(timeout)
                clearTimeout(timeout1)
                setIsLoading(true)
            };
        }, [devices, userAppliances, userDevices])
    );

    let timeout1
    useEffect(() => {
        if (selectedDevice === undefined) return
        timeout1 = setTimeout(() => {
            if (selectedDevice === "All Devices") {
                switch (reportCategory) {
                    case "Daily":
                        setReportsTotal(dailyTotals)
                        break;
                    case "Weekly":
                        setReportsTotal(weeklyTotals)
                        break;
                    case "Monthly":
                        setReportsTotal(monthlyTotals)
                        break;
                }
            }
            setReportLoading(false);
        }, 2000);
    }, [selectedDevice, reportCategory, dailyTotals, weeklyTotals, monthlyTotals])

    useEffect(() => {
        if (devices.length === 0) setDevices();
    }, [devices])

    const fetchDailyReport1 = async (user_id, selectedDevice, appliances) => {
        setReportLoading(true);
        await fetchDailyReport(user_id, selectedDevice, appliances);
    }
    const fetchWeeklyReport1 = async (user_id, selectedDevice, appliances) => {
        setReportLoading(true);
        await fetchWeeklyReport(user_id, selectedDevice, appliances);
    }
    const fetchMonthlyReport1 = async (user_id, selectedDevice, appliances) => {
        setReportLoading(true);
        await fetchMonthlyReport(user_id, selectedDevice, appliances);
    }

    useEffect(() => {
        if (selectedDevice != undefined) {
            setReportLoading(true);
            if (reportHistory[reportCategory.toLowerCase()]?.[selectedDevice] == undefined) {
                reportData.find((device) => {
                    if (device.device_id == selectedDevice) {
                        switch (reportCategory) {
                            case "Weekly":
                                setMaxProgress(50);
                                fetchWeeklyReport1(auth.currentUser?.uid, selectedDevice, device.appliances);
                                break;
                            case "Daily":
                                setMaxProgress(10);
                                fetchDailyReport1(auth.currentUser?.uid, selectedDevice, device.appliances);
                                break;
                            case "Monthly":
                                setMaxProgress(10);
                                fetchMonthlyReport1(auth.currentUser?.uid, selectedDevice, device.appliances);
                                break;
                            default:
                                break;
                        }
                        fetchAllLatestKwh(auth.currentUser?.uid, selectedDevice)
                    }
                })
            }
        }
    }, [selectedDevice, reportCategory])

    useEffect(() => {
        setLineData1(allMonthlyTotalConsumption)
        setLineData2(allBudget)
    }, [allMonthlyTotalConsumption, allBudget])

    useEffect(() => {
        if (Object.keys(reportHistory[reportCategory.toLowerCase()]).length > 0) {
            setReports(reportHistory[reportCategory.toLowerCase()]?.[selectedDevice] || []);
        }
    }, [reportHistory, reportCategory, selectedDevice])

    useEffect(() => {
        if (reportData.length > 0) setSelectedDevice("All Devices");
    }, [reportData]);

    if (isLoading) {
        return (
            <ScrollView className="h-full p-5" showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 40, paddingTop: insets.top }}>
                <Header />
                <View className="h-screen -mt-36 items-center justify-center">
                    <ActivityIndicator size="large" color="#166534" />
                    <Text className="text-gray-500 mt-4 text-lg font-semibold">Loading your reports data....</Text>
                </View>
            </ScrollView>
        )
    }

    const maxValueData1 = lineData1.length ? Math.max(...lineData1.map(d => d.value)) : 0;
    const maxValueData2 = lineData2.length ? Math.max(...lineData2.map(d => d.value)) : 0;

    const chartMax = Math.max(maxValueData1, maxValueData2);

    return (
        <View className={`flex-1 bg-gray-100`}>
            <ScrollView className="p-5" contentContainerStyle={{ paddingBottom: insets.bottom + 150, paddingTop: insets.top }}>
                <Header />
                {reportData.length === 0 ? (
                    <View className="h-screen -mt-36 items-center justify-center">
                        <Ionicons name="bar-chart-outline" size={64} color="#9CA3AF" />
                        <Text className="text-gray-500 mt-4 text-lg font-semibold">You have no devices added yet. Please add a device to view reports.</Text>
                    </View>
                ) : (
                    <View className="flex-1">
                        <Text className="text-2xl font-bold text-[#14532d] mb-4">Energy Usage Report</Text>
                        <Text className="text-2xl font-bold text-[#14532d] mb-4">Savings Over Time</Text>
                        <View style={styles.cardShadow} className="bg-white p-4 rounded-2xl mb-4 shadow-sm">
                            <LineChart
                                data={lineData1}
                                data2={lineData2}
                                height={150}
                                maxValue={chartMax + 10}
                                stepValue={chartMax / 2}
                                showVerticalLines
                                spacing={44}
                                initialSpacing={30}
                                width={300}
                                color1="skyblue"
                                color2="orange"
                                textColor1="green"
                                dataPointsHeight={6}
                                dataPointsWidth={6}
                                dataPointsColor1="blue"
                                dataPointsColor2="red"
                                textShiftY={-2}
                                textShiftX={-5}
                                textFontSize={13}
                            />
                            <View className="flex-row mt-5 items-center justify-center">
                                <View className="flex-row items-center mr-4">
                                    <View className="w-3.5 h-3.5 bg-orange-500 rounded-sm mr-1.5" />
                                    <Text className="text-xs text-gray-600">Budget</Text>
                                </View>
                                <View className="flex-row items-center">
                                    <View className="w-3.5 h-3.5 bg-sky-500 rounded-sm mr-1.5" />
                                    <Text className="text-xs text-gray-600">Consumption</Text>
                                </View>
                            </View>
                        </View>
                        <Text className="text-2xl font-bold text-[#14532d] mb-4">Energy Consumption</Text>
                        <View style={styles.cardShadow} className="flex-row space-x-3 mb-4 bg-white p-4 rounded-2xl shadow-sm justify-between items-center">
                            {category?.map((label, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => {
                                        setReportsTotal([])
                                        setReportCategory(label);
                                        setReportLoading(true);
                                    }}
                                    className={`px-4 py-2 rounded-full border ${label === reportCategory ? "bg-green-700 border-green-700" : "bg-white border-gray-300"}`}
                                >
                                    <Text className={`${label === reportCategory ? "text-white" : "text-black"} font-semibold`}>{label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <View style={styles.cardShadow} className="bg-white p-4 rounded-2xl shadow-sm mb-4">
                            <View className="flex-row items-center bg-white justify-between">
                                <Text className="text-gray-800 font-semibold mr-4">Select Device</Text>
                                <View
                                    className="flex-1 border rounded-xl overflow-hidden"
                                    style={{
                                        borderColor: "#d1d5db",
                                        backgroundColor: "#fff",
                                    }}
                                >
                                    <Picker
                                        mode="dropdown"
                                        dropdownIconColor={isDark ? "#000" : "#000"}
                                        style={{
                                            color: "#000",
                                            backgroundColor: "#fff",
                                        }}
                                        itemStyle={{
                                            color: "#000",
                                            backgroundColor: "#fff",
                                        }}
                                        selectedValue={selectedDevice}
                                        onValueChange={(itemValue) => {
                                            if (selectedDevice !== itemValue) {
                                                setReportLoading(true);
                                                setSelectedDevice(itemValue);
                                            }
                                        }}
                                    >
                                        <Picker.Item
                                            label="All Devices"
                                            value="All Devices"
                                            style={{ color: "#000", backgroundColor: "#fff" }}
                                        />
                                        {reportData.map((userDevice) => (
                                            <Picker.Item
                                                key={userDevice.device_id}
                                                label={userDevice.device_nickname || "Unnamed Device"}
                                                value={userDevice.device_id}
                                                style={{ color: "#000", backgroundColor: "#fff" }}
                                            />
                                        ))}
                                    </Picker>
                                </View>
                            </View>
                        </View>

                        {selectedDevice === "All Devices" ? (
                            <>
                                <Text className="text-2xl font-bold text-[#14532d] mb-4">
                                    Overall Energy Consumption ({reportCategory})
                                </Text>
                                <AutoSkeletonView isLoading={reportLoading}>
                                    <View
                                        style={styles.cardShadow}
                                        className="bg-white p-4 rounded-2xl shadow-sm mb-4"
                                    >
                                        <View className="w-full">
                                            {reportsTotal.length > 0 ? (
                                                <EnergyPredictionChart
                                                    actualData={reportsTotal?.[0]?.barData}
                                                    predictedData={reportsTotal?.[0]?.barData2}
                                                    category={reportCategory}
                                                />
                                            ) : (
                                                <Text className="text-gray-500 mt-4 text-lg font-semibold">
                                                    No data yet…
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                </AutoSkeletonView>
                            </>
                        ) : (
                            <>
                                <Text className="text-2xl font-bold text-[#14532d] mb-4">
                                    Appliance Usage
                                </Text>
                                <View
                                    style={styles.cardShadow}
                                    className="bg-white p-4 rounded-2xl shadow-sm mb-4"
                                >
                                    <AutoSkeletonView isLoading={reportLoading}>
                                        {reports.length > 0 ? (
                                            reports.map((item, index) => {
                                                const powerUsed = item.latestKwh ?? 0;
                                                const totalUsage = reports.reduce(
                                                    (sum, r) => sum + (r.latestKwh ?? 0),
                                                    0
                                                );

                                                return (
                                                    <TouchableOpacity
                                                        key={item.applianceName + index}
                                                        onPress={() => {
                                                            setModalVisible(true);
                                                            setSelectedAppliance(item);
                                                        }}
                                                        className="mb-4"
                                                    >
                                                        <View className="w-full flex-row items-center">
                                                            <Text className="w-24">{item.applianceName}</Text>
                                                            <View className="flex-1">
                                                                <CustomProgressBar
                                                                    progress={powerUsed}
                                                                    maxProgress={totalUsage}
                                                                    color="#4CAF50"
                                                                />
                                                            </View>
                                                            <Text className="ml-2 text-gray-600 text-sm">
                                                                {powerUsed.toFixed(2)} kWh
                                                            </Text>
                                                        </View>
                                                    </TouchableOpacity>
                                                );
                                            })
                                        ) : (
                                            <View className="h-40 p-4 flex-1 items-center justify-center">
                                                <Text className="text-gray-500 text-lg font-semibold h-full w-full">
                                                    No appliance usage data available.
                                                </Text>
                                            </View>
                                        )}
                                    </AutoSkeletonView>
                                </View>
                            </>
                        )}
                    </View>
                )}
            </ScrollView>
            <Modal
                animationType="fade"
                transparent
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <BlurView
                    intensity={100}
                    tint="dark"
                    className="flex-1 justify-center items-center px-4"
                >
                    <View
                        className="bg-white rounded-2xl p-5 w-full max-w-[420px] shadow-lg"
                        style={{ maxHeight: "85%" }}
                    >
                        {/* Close Button */}
                        <TouchableOpacity
                            onPress={() => setModalVisible(false)}
                            className="absolute top-3 right-3 z-10"
                        >
                            <View className="bg-red-600 w-8 h-8 rounded-full items-center justify-center">
                                <Text className="text-white font-bold text-base">×</Text>
                            </View>
                        </TouchableOpacity>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text className="text-lg font-bold text-center mb-4 text-gray-800">
                                {selectedAppliance?.applianceName || "Appliance Details"}
                            </Text>

                            {selectedAppliance?.barData?.length ? (
                                <EnergyPredictionChart
                                    actualData={selectedAppliance.barData}
                                    predictedData={selectedAppliance.barData2}
                                    category={reportCategory}
                                />
                            ) : (
                                <Text className="text-gray-500 text-center text-base mt-6">
                                    No prediction data available for this appliance yet.
                                </Text>
                            )}
                        </ScrollView>
                    </View>
                </BlurView>
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
    closeButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        backgroundColor: '#FF0000',
        padding: 10,
        borderRadius: 50,
        zIndex: 1,
    },
    closeButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    }
});