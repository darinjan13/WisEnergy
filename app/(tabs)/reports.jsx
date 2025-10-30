import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal, useColorScheme } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { ActivityIndicator } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { AutoSkeletonView } from "react-native-auto-skeleton";

import Header from "@/components/ui/Header";
import CustomProgressBar from "@/components/reports/CustomProgressBar";
import EnergyPredictionChart from "@/components/reports/EnergyPredictionChart";

import { auth } from "@/firebase/firebaseConfig";
import { useBudgetStore, useDeviceStore, useUsageStore } from "@/store/firebaseStore";
import SavingsChart from "../../components/reports/SavingsChart";
import ApplianceModal from "../../components/reports/ApplianceModal";

export default function Reports() {
    const scheme = useColorScheme();
    const insets = useSafeAreaInsets();
    const isDark = scheme === "dark";

    const { devices, userDevices, userAppliances } = useDeviceStore();
    const {
        fetchDailyReport,
        fetchWeeklyReport,
        fetchMonthlyReport,
        fetchDailyTotals,
        fetchWeeklyTotals,
        fetchMonthlyTotals,
        allMonthlyTotalConsumption,
        dailyData,
        weeklyData,
        monthlyData,
    } = useUsageStore();
    const { allBudget, fetchAllBudget, locationRate } = useBudgetStore();

    const [reportCategory, setReportCategory] = useState("Daily");
    const [selectedDevice, setSelectedDevice] = useState("All Devices");
    const [reportData, setReportData] = useState([]);
    const [reports, setReports] = useState([]);
    const [reportsTotal, setReportsTotal] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [reportLoading, setReportLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedAppliance, setSelectedAppliance] = useState(null);

    const category = ["Monthly", "Weekly", "Daily"];
    const timeoutsRef = useRef([]);

    const registerTimeout = (fn, delay) => {
        const id = setTimeout(fn, delay);
        timeoutsRef.current.push(id);
        return id;
    };

    useFocusEffect(
        useCallback(() => {
            let active = true;
            const uid = auth.currentUser?.uid;
            if (!uid) return;

            const loadInitial = async () => {
                try {
                    if (dailyData.dailyTotals === undefined || weeklyData.weeklyTotals === undefined) {
                        await Promise.allSettled([
                            fetchDailyTotals(uid),
                            fetchWeeklyTotals(uid),
                        ]);
                    }

                    fetchMonthlyTotals(uid)
                    fetchAllBudget(uid)
                    if (active) setIsLoading(false);
                } catch {
                    if (active) setIsLoading(false);
                }
            };

            loadInitial();
            const timeout = setTimeout(() => {
                setIsLoading(false);
            }, 1000);

            const mapped = userDevices
                .map((device) => {
                    const match = userAppliances.find((a) => a.id === device.id);
                    if (!match) return null;
                    return {
                        device_id: device.id,
                        device_nickname: device.device_nickname,
                        appliances: match.appliances || [],
                    };
                })
                .filter(Boolean);

            setReportData(mapped);

            return () => {
                active = false;
                clearTimeout(timeout);
                timeoutsRef.current.forEach(clearTimeout);
                timeoutsRef.current = [];
                setSelectedDevice("All Devices");
                setReportData([]);
            };
        }, [userDevices, userAppliances])
    );

    const getAllAppliances = (reportObj) => {
        if (!reportObj) return [];

        // “All Devices” is the key you see in the console
        const bucket = reportObj["All Devices"];
        return Array.isArray(bucket) ? bucket : [];
    };

    useEffect(() => {
        if (!selectedDevice) return;
        setReportLoading(true);

        registerTimeout(async () => {
            const uid = auth.currentUser?.uid;
            if (!uid) return;

            const device = reportData?.find((d) => d.device_id === selectedDevice);

            if (selectedDevice === "All Devices") {
                // Collect all devices and their appliances
                const allDeviceMap = reportData.reduce((acc, device) => {
                    if (device.device_id && Array.isArray(device.appliances)) {
                        acc[device.device_id] = device.appliances;
                    }
                    return acc;
                }, {});

                switch (reportCategory) {
                    case "Daily":
                        // Loop through each device and fetch its report
                        await Promise.all(
                            Object.entries(allDeviceMap).map(([deviceId, appliances]) =>
                                fetchDailyReport(uid, deviceId, appliances)
                            )
                        );
                        setReportsTotal(dailyData);
                        break;
                    case "Weekly":
                        await Promise.all(
                            Object.entries(allDeviceMap).map(([deviceId, appliances]) =>
                                fetchWeeklyReport(uid, deviceId, appliances)
                            )
                        );
                        setReportsTotal(weeklyData);
                        break;
                    case "Monthly":
                        await Promise.all(
                            Object.entries(allDeviceMap).map(([deviceId, appliances]) =>
                                fetchMonthlyReport(uid, deviceId, appliances)
                            )
                        );
                        setReportsTotal(monthlyData);
                        break;
                }

                setReportLoading(false);
                return;
            }
            setReportLoading(false);
        }, 250);
    }, [reportData, selectedDevice, reportCategory]);

    useEffect(() => {
        if (!selectedDevice) return;
        if (selectedDevice === "All Devices") return;

        let updatedReports = [];

        switch (reportCategory) {
            case "Daily":
                updatedReports = dailyData.dailyReport[selectedDevice] || [];
                break;
            case "Weekly":
                updatedReports = weeklyData.weeklyReport[selectedDevice] || [];
                break;
            case "Monthly":
                updatedReports = monthlyData.monthlyReport[selectedDevice] || [];
                break;
            default:
                updatedReports = [];
        }

        setReports(updatedReports);
    }, [reportCategory, selectedDevice, dailyData, weeklyData, monthlyData]);

    const lineData1 = allMonthlyTotalConsumption.map(d => ({
        ...d,
        type: "consumption",
    }));
    const lineData2 = allBudget.map(d => ({
        ...d,
        type: "budget",
    }));

    const chartMax = useMemo(() => {
        const max1 = lineData1.length ? Math.max(...lineData1.map((d) => d.value)) : 0;
        const max2 = lineData2.length ? Math.max(...lineData2.map((d) => d.value)) : 0;
        return Math.max(max1, max2);
    }, [lineData1, lineData2]);

    const closeModal = () => {
        setSelectedAppliance(null);
        setModalVisible(false);
    };

    if (isLoading) {
        return (
            <ScrollView
                className="h-full p-5"
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: insets.bottom + 40, paddingTop: insets.top }}
            >
                <Header />
                <Text className="text-xl font-bold text-green-800 mb-4">Reports</Text>
                <View className="h-screen -mt-36 items-center justify-center">
                    <ActivityIndicator size="large" color="#166534" />
                    <Text className="text-gray-500 mt-4 text-lg font-semibold">
                        Loading your reports data...
                    </Text>
                </View>
            </ScrollView>
        );
    }

    return (
        <View className="flex-1 bg-gray-100">
            <ScrollView
                className="p-5"
                contentContainerStyle={{ paddingBottom: insets.bottom + 150, paddingTop: insets.top }}
            >
                <Header />
                <Text className="text-xl font-bold text-green-800 mb-4">Reports</Text>

                {/* Savings Over Time */}
                <Text className="text-xl font-bold text-green-800 mb-4">Savings Over Time</Text>
                <SavingsChart lineData1={lineData1} lineData2={lineData2} chartMax={chartMax} styles={styles} />


                {/* Category Filters */}
                <View style={styles.cardShadow} className="flex-row space-x-3 mb-4 bg-white p-4 rounded-2xl justify-between items-center">
                    {category.map((label, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => {
                                if (reportCategory === label) return;
                                setReports([]);
                                setReportsTotal([]);
                                setReportCategory(label);
                                setReportLoading(true);
                            }}
                            className={`px-4 py-2 rounded-full border ${label === reportCategory
                                ? "bg-green-700 border-green-700"
                                : "bg-white border-gray-300"
                                }`}
                        >
                            <Text
                                className={`${label === reportCategory ? "text-white" : "text-black"} font-semibold`}
                            >
                                {label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Device Picker */}
                <View style={styles.cardShadow} className="bg-white p-4 rounded-2xl mb-4">
                    <View className="flex-row items-center justify-between">
                        <Text className="text-gray-800 font-semibold mr-4">Select Device</Text>
                        <View className="flex-1 border rounded-xl overflow-hidden border-gray-300">
                            <Picker
                                mode="dropdown"
                                selectedValue={selectedDevice}
                                dropdownIconColor="#000"
                                style={{ color: "#000", backgroundColor: "#fff" }}
                                onValueChange={(itemValue) => {
                                    if (selectedDevice !== itemValue) {
                                        setReportLoading(true);
                                        setSelectedDevice(itemValue);
                                    }
                                }}
                            >
                                <Picker.Item label="All Devices" value="All Devices" />
                                {reportData.map((d) => (
                                    <Picker.Item
                                        key={d.device_id}
                                        label={d.device_nickname || "Unnamed Device"}
                                        value={d.device_id}
                                    />
                                ))}
                            </Picker>
                        </View>
                    </View>
                </View>

                <Text className="text-xl font-bold text-green-800 mb-4">Energy Consumption</Text>
                {/* All Devices */}
                {selectedDevice === "All Devices" ? (
                    <AutoSkeletonView isLoading={reportLoading}>
                        <View style={styles.cardShadow} className="bg-white p-4 rounded-2xl mb-4">
                            {/* Overall Chart */}
                            {reportsTotal?.[reportCategory.toLowerCase() + "Totals"]?.[0] ? (
                                <EnergyPredictionChart
                                    actualData={reportsTotal[reportCategory.toLowerCase() + "Totals"][0].barData}
                                    predictedData={reportsTotal[reportCategory.toLowerCase() + "Totals"][0].barData2}
                                    category={reportCategory}
                                />
                            ) : (
                                <Text className="text-gray-500 text-center text-lg font-semibold">
                                    No data yet…
                                </Text>
                            )}

                            {/* Appliance List */}
                            {(() => {
                                const reportMap = {
                                    Daily: dailyData.dailyReport,
                                    Weekly: weeklyData.weeklyReport,
                                    Monthly: monthlyData.monthlyReport,
                                };

                                const allKeys = Object.keys(reportMap[reportCategory] || {});
                                const appliances = allKeys.flatMap((key) => reportMap[reportCategory][key] || []);

                                if (appliances.length === 0) {
                                    return (
                                        <View className="mt-6 items-center">
                                            <Text className="text-gray-500 text-lg font-semibold">
                                                No appliance usage data available.
                                            </Text>
                                        </View>
                                    );
                                }

                                const totalUsage = appliances.reduce((sum, r) => sum + (r.latestKwh ?? 0), 0);

                                return (
                                    <View className="mt-6">
                                        <Text className="text-green-800 font-semibold mb-5 text-center text-lg">
                                            {reportCategory} Consumption per Appliance
                                        </Text>
                                        {appliances.map((item, index) => {
                                            const powerUsed = item.latestKwh ?? 0;
                                            return (
                                                <TouchableOpacity
                                                    key={`${item.applianceName}-${index}`}
                                                    onPress={() => {
                                                        setSelectedAppliance(item);
                                                        setModalVisible(true);
                                                    }}
                                                    className="mb-4"
                                                >
                                                    <View className="flex-row items-center">
                                                        <Text className="w-24">{item.applianceName}</Text>
                                                        <View className="flex-1">
                                                            <CustomProgressBar progress={powerUsed} maxProgress={totalUsage} color="#4CAF50" />
                                                        </View>
                                                        <Text className="ml-2 text-gray-600 text-sm">{powerUsed.toFixed(2)} kWh</Text>
                                                    </View>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                );
                            })()}
                        </View>
                    </AutoSkeletonView>
                ) : (
                    /* Specific Device */
                    <AutoSkeletonView isLoading={reportLoading}>
                        <Text className="text-xl font-bold text-green-800 mb-4">Appliance Usage</Text>
                        <View style={styles.cardShadow} className="bg-white p-4 rounded-2xl mb-4">
                            {reports.length > 0 ? (
                                (() => {
                                    const totalUsage = reports.reduce((sum, r) => sum + (r.latestKwh ?? 0), 0);
                                    return reports.map((item, index) => {
                                        const powerUsed = item.latestKwh ?? 0;
                                        return (
                                            <TouchableOpacity
                                                key={`${item.applianceName}-${index}`}
                                                onPress={() => {
                                                    setSelectedAppliance(item);
                                                    setModalVisible(true);
                                                }}
                                                className="mb-4"
                                            >
                                                <View className="flex-row items-center">
                                                    <Text className="w-24">{item.applianceName}</Text>
                                                    <View className="flex-1">
                                                        <CustomProgressBar progress={powerUsed} maxProgress={totalUsage} color="#4CAF50" />
                                                    </View>
                                                    <Text className="ml-2 text-gray-600 text-sm">{powerUsed.toFixed(2)} kWh</Text>
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    });
                                })()
                            ) : (
                                <View className="h-40 items-center justify-center">
                                    <Text className="text-gray-500 text-lg font-semibold">No appliance usage data available.</Text>
                                </View>
                            )}
                        </View>
                    </AutoSkeletonView>
                )}
            </ScrollView>

            {/* Appliance Modal */}
            <ApplianceModal
                visible={modalVisible}
                onClose={closeModal}
                applianceData={selectedAppliance}
                reportCategory={reportCategory}
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
