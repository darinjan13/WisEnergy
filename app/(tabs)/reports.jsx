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

export default function Reports() {
    const scheme = useColorScheme();
    const insets = useSafeAreaInsets();
    const isDark = scheme === "dark";

    const { devices, userDevices, userAppliances, setDevices } = useDeviceStore();
    const {
        reportHistory,
        fetchReport,
        fetchTotals,
        fetchAllMonthlyTotalConsumption,
        allMonthlyTotalConsumption,
        dailyTotals,
        weeklyTotals,
        monthlyTotals,
    } = useUsageStore();
    const { allBudget, fetchAllBudget } = useBudgetStore();

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

    /** ---------- INITIAL LOAD ---------- */
    useFocusEffect(
        useCallback(() => {
            let active = true;
            const uid = auth.currentUser?.uid;
            if (!uid) return;

            const loadInitial = async () => {
                try {
                    await Promise.allSettled([
                        fetchAllMonthlyTotalConsumption(uid),
                        fetchAllBudget(uid),
                        fetchTotals("Daily", uid),
                        fetchTotals("Weekly", uid),
                        fetchTotals("Monthly", uid),
                    ]);
                    if (active) setIsLoading(false);
                } catch {
                    if (active) setIsLoading(false);
                }
            };

            loadInitial();
            const timeout = setTimeout(() => {
                if (reportHistory !== null)
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
            console.log("Appliances", userAppliances);

            return () => {
                clearTimeout(timeout)
                timeoutsRef.current.forEach(clearTimeout);
                timeoutsRef.current = [];
                setSelectedDevice("All Devices")
                setReportData([])
            };
        }, [userDevices, userAppliances])
    );

    /** ---------- DEVICE/APPLIANCE SYNC ---------- */
    // useEffect(() => {
    //     const devicesList = Array.isArray(userDevices) ? userDevices : [];
    //     const appliancesList = Array.isArray(userAppliances) ? userAppliances : [];

    //     if (devicesList.length === 0 || appliancesList.length === 0) return;

    //     const mapped = devicesList
    //         .map((device) => {
    //             const match = appliancesList.find((a) => a.id === device.id);
    //             if (!match) return null;
    //             return {
    //                 device_id: device.id,
    //                 device_nickname: device.device_nickname,
    //                 appliances: match.appliances || [],
    //             };
    //         })
    //         .filter(Boolean);

    //     setReportData(mapped);

    //     if (mapped.length > 0 && !selectedDevice) {
    //         setSelectedDevice("All Devices");
    //     }
    // }, [userDevices, userAppliances]);

    /** ---------- CATEGORY OR DEVICE CHANGE ---------- */
    useEffect(() => {
        if (!selectedDevice) return;
        setReportLoading(true);

        registerTimeout(async () => {
            const uid = auth.currentUser?.uid;
            if (!uid) return;

            if (selectedDevice === "All Devices") {
                switch (reportCategory) {
                    case "Daily": setReportsTotal(dailyTotals); break;
                    case "Weekly": setReportsTotal(weeklyTotals); break;
                    case "Monthly": setReportsTotal(monthlyTotals); break;
                }
                setReportLoading(false);
                return;
            }

            // const existing = reportHistory[reportCategory.toLowerCase()]?.[selectedDevice];
            // console.log("Existing", existing);

            // if (!existing) {
            const device = reportData?.find((d) => d.device_id === selectedDevice);
            if (device) {
                await fetchReport(reportCategory, uid, selectedDevice, device.appliances);
            }
            // }
            setReportLoading(false);
        }, 250);
    }, [reportData, selectedDevice, reportCategory]);

    /** ---------- UPDATE REPORT DATA ---------- */
    useEffect(() => {
        if (!selectedDevice) return;
        if (selectedDevice === "All Devices") return;

        const updated = reportHistory[reportCategory.toLowerCase()]?.[selectedDevice];
        console.log(reportHistory);

        if (updated) setReports(updated);
    }, [reportHistory, selectedDevice, reportCategory]);

    /** ---------- LINE GRAPH ---------- */
    const lineData1 = allMonthlyTotalConsumption || [];
    const lineData2 = allBudget || [];

    const chartMax = useMemo(() => {
        const max1 = lineData1.length ? Math.max(...lineData1.map((d) => d.value)) : 0;
        const max2 = lineData2.length ? Math.max(...lineData2.map((d) => d.value)) : 0;
        return Math.max(max1, max2);
    }, [lineData1, lineData2]);

    /** ---------- MODAL CLEANUP ---------- */
    const closeModal = () => {
        setSelectedAppliance(null);
        setModalVisible(false);
    };

    /** ---------- RENDER ---------- */
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
                <View style={styles.cardShadow} className="bg-white p-4 rounded-2xl mb-4">
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

                {/* Category Filters */}
                <Text className="text-xl font-bold text-green-800 mb-4">Energy Consumption</Text>
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

                {/* All Devices */}
                {selectedDevice === "All Devices" ? (
                    <AutoSkeletonView isLoading={reportLoading}>
                        <Text className="text-xl font-bold text-green-800 mb-4">
                            Overall Energy Consumption ({reportCategory})
                        </Text>
                        <View style={styles.cardShadow} className="bg-white p-4 rounded-2xl mb-4">
                            {reportsTotal.length > 0 ? (
                                <EnergyPredictionChart
                                    actualData={reportsTotal?.[0]?.barData}
                                    predictedData={reportsTotal?.[0]?.barData2}
                                    category={reportCategory}
                                />
                            ) : (
                                <Text className="text-gray-500 text-center text-lg font-semibold">
                                    No data yet…
                                </Text>
                            )}
                        </View>
                    </AutoSkeletonView>
                ) : (
                    // Specific Device (Appliance list)
                    <AutoSkeletonView isLoading={reportLoading}>
                        <Text className="text-xl font-bold text-green-800 mb-4">Appliance Usage</Text>
                        <View style={styles.cardShadow} className="bg-white p-4 rounded-2xl mb-4">
                            {reports.length > 0 ? (
                                reports.map((item, index) => {
                                    const powerUsed = item.latestKwh ?? 0;
                                    const totalUsage = reports.reduce((sum, r) => sum + (r.latestKwh ?? 0), 0);
                                    return (
                                        <TouchableOpacity
                                            key={item.applianceName + index}
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
                                })
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
            <Modal animationType="fade" transparent visible={modalVisible} onRequestClose={closeModal}>
                <BlurView intensity={100} tint="dark" className="flex-1 justify-center items-center px-4">
                    <View className="bg-white rounded-2xl p-5 w-full max-w-[420px] shadow-lg" style={{ maxHeight: "85%" }}>
                        <TouchableOpacity onPress={closeModal} className="absolute top-3 right-3 z-10">
                            <View className="bg-red-600 w-10 h-10 rounded-full items-center justify-center">
                                <AntDesign name="close" size={15} color="white" />
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
