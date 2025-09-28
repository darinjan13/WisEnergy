import { useCallback, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Header from "../../components/ui/Header";
import { auth } from "../../firebase/firebaseConfig";
import { useFocusEffect } from "expo-router";
import { ActivityIndicator } from "react-native-paper";
import { useBudgetStore, useDeviceStore, useUsageStore } from "../../store/firebaseStore";
import { Picker } from "@react-native-picker/picker";
import ApplianceUsage from "../../components/reports/ApplianceUsage"
import { Ionicons } from "@expo/vector-icons";
import CustomProgressBar from "../../components/reports/CustomProgressBar";
import { BlurView } from "expo-blur";
import { set } from "date-fns";

export default function reports() {
    const insets = useSafeAreaInsets();
    const { devices, setDevices, fetchUserAppliances, userAppliances, userDevices } = useDeviceStore();
    const { reportHistory, fetchDailyReport, fetchWeeklyReport, monthlyTotalConsumption, fetchAllMonthlyTotalConsumption, allMonthlyTotalConsumption } = useUsageStore();
    const { monthlyBudget, allBudget, fetchAllBudget } = useBudgetStore();

    const [reportCategory, setReportCategory] = useState("Daily");
    const [selectedDevice, setSelectedDevice] = useState();

    const [reportData, setReportData] = useState([]);
    const [reports, setReports] = useState([]);
    const [lineData1, setLineData1] = useState([]);
    const [lineData2, setLineData2] = useState([]);

    const [totalEnergyConsumption, setTotalEnergyConsumption] = useState(0);

    const [isLoading, setIsLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [reportLoading, setReportLoading] = useState(true);
    const [selectedAppliance, setSelectedAppliance] = useState(null);

    const [maxProgress, setMaxProgress] = useState(10);

    const category = ["Monthly", "Weekly", "Daily"];

    useFocusEffect(
        useCallback(() => {
            setIsLoading(true)
            fetchAllMonthlyTotalConsumption(auth.currentUser?.uid)
            fetchAllBudget(auth.currentUser?.uid)
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
                clearTimeout(timeout)
                setIsLoading(true)
            };
        }, [devices, userAppliances, userDevices])
    );

    useEffect(() => {
        if (devices.length === 0) setDevices();
        // if (userAppliances.length === 0) fetchUserAppliances();
    }, [devices])

    const fetchDailyReport1 = async (user_id, selectedDevice, appliances) => {
        setReportLoading(true);
        await fetchDailyReport(user_id, selectedDevice, appliances);
    }
    const fetchWeeklyReport1 = async (user_id, selectedDevice, appliances) => {
        setReportLoading(true);
        await fetchWeeklyReport(user_id, selectedDevice, appliances);
    }

    useEffect(() => {
        if (selectedDevice != undefined) {

            if (reportHistory[reportCategory.toLowerCase()]?.[selectedDevice] == undefined) {
                reportData.find((device) => {
                    if (device.device_id == selectedDevice) {
                        fetchDailyReport1(auth.currentUser?.uid, selectedDevice, device.appliances);
                        fetchWeeklyReport1(auth.currentUser?.uid, selectedDevice, device.appliances);
                    }
                })
            } else {
                setReportLoading(false);
                setReports(reportHistory[reportCategory.toLowerCase()]?.[selectedDevice] || []);
            }
        }
    }, [selectedDevice, reportCategory])

    useEffect(() => {
        setReportLoading(true);
        switch (reportCategory) {
            case "Weekly":
                setMaxProgress(50);
                break;
            case "Daily":
                setMaxProgress(10);
                break;
            default:
                break;
        }

    }, [reportCategory])

    useEffect(() => {
        if (reports.length > 0) {
            setReportLoading(false)
        } else {
            setReportLoading(true)
        }
    }, [reports])

    useEffect(() => {
        setLineData1(allMonthlyTotalConsumption)
        setLineData2(allBudget)
    }, [allMonthlyTotalConsumption, allBudget])

    useEffect(() => {
        if (Object.keys(reportHistory[reportCategory.toLowerCase()]).length > 0) {
            setReports(reportHistory[reportCategory.toLowerCase()]?.[selectedDevice] || []);
            // setIsLoading(false)
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

    return (
        <View className="flex-1 bg-gray-100">
            <ScrollView className="h-full p-4" showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 150 }}>
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
                                height={200}
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
                        </View>
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

                        {/* <View className="flex-row justify-between mb-2 text-center">
                            <Text className="text-2xl font-bold text-[#14532d] my-auto">{reportCategory} Energy Consumption</Text>
                            <Text className="text-2xl font-bold text-white my-auto bg-green-600 rounded-xl py-1 px-2">{totalEnergyConsumption?.toFixed(2)} kWh</Text>
                        </View> */}

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
                                                setReportLoading(true);
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

                        <Text className="text-2xl font-bold text-[#14532d] mb-4">Appliance Usage</Text>
                        <View style={styles.cardShadow} className="bg-white p-4 rounded-2xl shadow-sm mb-4">
                            {!reportLoading ? (
                                reports.map((item, index) => {
                                    let powerUsed = item?.barData?.reduce((total, current) => total + current.value, 0) || 0;

                                    if (powerUsed > maxProgress) {
                                        powerUsed = maxProgress;
                                    }

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
                                                {/* Appliance name */}
                                                <Text className="w-20">{item.applianceName}</Text>

                                                {/* Progress bar takes remaining space */}
                                                <View className="flex-1 ml-2">
                                                    <CustomProgressBar
                                                        progress={powerUsed}
                                                        maxProgress={maxProgress}
                                                        color="#4CAF50"
                                                    />
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })
                            ) : (
                                <View className="h-full p-4 flex-1 items-center justify-center">
                                    <ActivityIndicator size="large" color="#166534" />
                                    <Text className="text-gray-500 mt-4 text-lg font-semibold">Loading your reports data....</Text>
                                </View>
                            )}
                        </View>
                        {/* {Object.keys(reportHistory[reportCategory.toLowerCase()]).length > 0 ? (
                            <View style={styles.cardShadow} className="bg-white p-4 rounded-2xl shadow-sm mb-4">
                                {reportLoading ? (
                                    reports?.map((item, index) => {
                                        let powerUsed = item?.barData?.reduce((total, current) => total + current.value, 0) || 0;

                                        let maxProgress = 10;

                                        if (powerUsed > maxProgress) {
                                            powerUsed = maxProgress;
                                        }

                                        return (
                                            <TouchableOpacity
                                                key={item.applianceName + index}
                                                onPress={() => {
                                                    setModalVisible(true);
                                                    setSelectedAppliance(item);
                                                }}
                                                className="mb-4"
                                            >
                                                <View className="w-full flex flex-row flex-wrap items-center mb-5">
                                                    <Text className="mr-5 w-24">{item.applianceName}</Text>
                                                    <CustomProgressBar
                                                        progress={powerUsed}
                                                        maxProgress={maxProgress}
                                                        color="#4CAF50"
                                                    />
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    })
                                ) : (
                                    <View className="h-full flex-1 items-center justify-center">
                                        <ActivityIndicator size="large" color="#166534" />
                                        <Text className="text-gray-500 mt-4 text-lg font-semibold">Loading your reports data....</Text>
                                    </View>
                                )}
                            </View>
                        ) : (
                            <View className="h-full flex-1 items-center justify-center">
                                <Text className="text-gray-500 mt-4 text-lg font-semibold">No reports data...</Text>
                            </View>
                        )} */}
                    </View>
                )}
            </ScrollView>
            <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <BlurView intensity={100} tint="dark" className="flex-1 justify-center items-center">
                    <View className="bg-white rounded-xl p-6 w-11/12">
                        <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>X</Text>
                        </TouchableOpacity>
                        <ApplianceUsage category={reportCategory} data={selectedAppliance} />
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