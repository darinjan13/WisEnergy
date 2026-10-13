import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Alert,
  FlatList,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { ActivityIndicator } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import { AutoSkeletonView } from "react-native-auto-skeleton";

import Header from "@/components/ui/Header";
import ResultModal from "@/components/ui/ResultModal";
import SavingsChart from "@/components/reports/SavingsChart";
import CustomProgressBar from "@/components/reports/CustomProgressBar";
import EnergyPredictionChart from "@/components/reports/EnergyPredictionChart";
import ApplianceModal from "@/components/reports/ApplianceModal";

import { auth } from "@/firebase/firebaseConfig";
import { resetDeviceHistory } from "@/services/firebaseDevicesService";

import {
  useBudgetStore,
  useDeviceStore,
  useUsageStore,
} from "@/store/firebaseStore";

export default function Reports() {
  const scheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const isDark = scheme === "dark";

  const { userDevices, userAppliances } = useDeviceStore();
  const {
    fetchDailyReport,
    fetchWeeklyReport,
    fetchMonthlyReport,
    fetchDailyTotals,
    fetchWeeklyTotals,
    fetchMonthlyTotals,
    fetchTopAppliances,
    allMonthlyTotalConsumption,
    dailyData,
    weeklyData,
    monthlyData,
    topAppliances,
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
  const [resetting, setResetting] = useState(false);
  const [resetDialog, setResetDialog] = useState(null); // {kind:'confirm'} | {kind:'result',...}

  const handleResetDeviceData = () => {
    if (selectedDevice === "All Devices") return;
    setResetDialog({ kind: "confirm" });
  };

  const handleResetConfirm = async () => {
    try {
      setResetting(true);
      const uid = auth.currentUser?.uid;
      const { failed } = await resetDeviceHistory(uid, selectedDevice);
      if (failed.length === 0) {
        setResetDialog({ kind: "result", success: true, title: "Device history cleared", lines: ["All readings, summaries, and kWh for this device were removed."] });
      } else {
        setResetDialog({ kind: "result", success: false, title: "Partially cleared", lines: ["These refused to delete:", ...failed] });
      }
    } catch (e) {
      console.error("Reset device data failed", e);
      setResetDialog({ kind: "result", success: false, title: "Reset failed", lines: [e?.code || e?.message || "Unknown error"] });
    } finally {
      setResetting(false);
    }
  };

  const category = ["Monthly", "Weekly", "Daily"];

  // -----------------------------
  // A. INITIAL LOAD
  // -----------------------------
  useFocusEffect(
    useCallback(() => {
      let active = true;
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      const loadInitial = async () => {
        try {
          await Promise.allSettled([
            fetchDailyTotals(uid),
            fetchWeeklyTotals(uid),
            fetchMonthlyTotals(uid),
            fetchAllBudget(uid),
            fetchTopAppliances(uid),
          ]);

          if (!active) return;

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
        } finally {
          if (active) setIsLoading(false);
        }
      };

      loadInitial();

      return () => {
        active = false;
        setSelectedDevice("All Devices");
        setReportData([]);
      };
    }, [userDevices, userAppliances])
  );

  // -----------------------------
  // B. FETCH REPORTS PER CATEGORY
  // -----------------------------
  useEffect(() => {
    if (!selectedDevice) return;

    let cancelled = false;
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const run = async () => {
      const hasPersisted =
        (reportCategory === "Daily" && (dailyData.dailyTotals?.length || Object.keys(dailyData.dailyReport || {}).length)) ||
        (reportCategory === "Weekly" && (weeklyData.weeklyTotals?.length || Object.keys(weeklyData.weeklyReport || {}).length)) ||
        (reportCategory === "Monthly" && (monthlyData.monthlyTotals?.length || Object.keys(monthlyData.monthlyReport || {}).length));
      if (!hasPersisted) setReportLoading(true);

      // 👉 ALL DEVICES
      if (selectedDevice === "All Devices") {
        const map = reportData.reduce((acc, d) => {
          acc[d.device_id] = d.appliances;
          return acc;
        }, {});

        const promises = Object.entries(map).map(([deviceId, apps]) => {
          if (!apps || apps.length === 0) return Promise.resolve();

          switch (reportCategory) {
            case "Daily":
              return fetchDailyReport(uid, deviceId, apps);
            case "Weekly":
              return fetchWeeklyReport(uid, deviceId, apps);
            case "Monthly":
              return fetchMonthlyReport(uid, deviceId, apps);
            default:
              return Promise.resolve();
          }
        });

        await Promise.all(promises);
        if (!cancelled) {
          const source =
            reportCategory === "Daily"
              ? dailyData
              : reportCategory === "Weekly"
                ? weeklyData
                : monthlyData;

          setReportsTotal(source);
          setReportLoading(false);
          setLastUpdatedAt(new Date());
        }
        return;
      }

      // 👉 SPECIFIC DEVICE
      setReportLoading(false);
      setLastUpdatedAt(new Date());
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [reportCategory, selectedDevice, reportData]);

  // -----------------------------
  // C. UPDATE REPORTS PER DEVICE
  // -----------------------------
  useEffect(() => {
    if (!selectedDevice || selectedDevice === "All Devices") return;

    const map = {
      Daily: dailyData.dailyReport[selectedDevice] || [],
      Weekly: weeklyData.weeklyReport[selectedDevice] || [],
      Monthly: monthlyData.monthlyReport[selectedDevice] || [],
    };

    setReports(map[reportCategory] || []);
  }, [reportCategory, selectedDevice, dailyData, weeklyData, monthlyData]);

  // useEffect(() => {
  //   console.log("Reports: ", reports[0]);

  // }, [reports])
  // -----------------------------
  // D. MEMOIZED APPLIANCES (PERFORMANCE)
  // -----------------------------
  const allAppliancesForAllDevices = useMemo(() => {
    const reportMap = {
      Daily: dailyData.dailyReport,
      Weekly: weeklyData.weeklyReport,
      Monthly: monthlyData.monthlyReport,
    };

    const map = reportMap[reportCategory] || {};
    return Object.values(map).flat().filter(Boolean);
  }, [reportCategory, dailyData, weeklyData, monthlyData]);

  const totalUsageAll = useMemo(() => {
    return allAppliancesForAllDevices.reduce(
      (sum, a) => sum + (a.latestKwh ?? 0),
      0
    );
  }, [allAppliancesForAllDevices]);

  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);

  const heroStats = useMemo(() => {
    const day = dailyData.dailyTotals?.[0];
    const week = weeklyData.weeklyTotals?.[0];
    const dayBars = day?.barData ?? [];
    const weekBars = week?.barData ?? [];
    const dayDelta = dayBars.length >= 2
      ? Number((dayBars[dayBars.length - 1].value - dayBars[dayBars.length - 2].value).toFixed(2))
      : null;
    const weekDelta = weekBars.length >= 2
      ? Number((weekBars[weekBars.length - 1].value - weekBars[weekBars.length - 2].value).toFixed(2))
      : null;
    const top = topAppliances?.[0] ?? null;
    return {
      today: day?.latestKwh ?? null,
      todayDelta: dayDelta,
      week: week?.latestKwh ?? null,
      weekDelta: weekDelta,
      topName: top?.name ?? null,
      topKwh: top?.kwh ?? null,
      topShare: top && totalUsageAll > 0 ? Math.round((top.kwh / totalUsageAll) * 100) : null,
    };
  }, [dailyData, weeklyData, topAppliances, totalUsageAll]);

  // -----------------------------
  // E. LINE CHART DATA
  // -----------------------------
  const lineData1 = allMonthlyTotalConsumption.map((d) => ({
    ...d,
    type: "consumption",
  }));
  const lineData2 = allBudget.map((d) => ({
    ...d,
    type: "budget",
  }));

  const chartMax = useMemo(() => {
    const max1 = lineData1.length
      ? Math.max(...lineData1.map((d) => d.value))
      : 0;
    const max2 = lineData2.length
      ? Math.max(...lineData2.map((d) => d.value))
      : 0;
    return Math.max(max1, max2);
  }, [lineData1, lineData2]);

  // -----------------------------
  // F. UI START
  // -----------------------------
  if (isLoading) {
    return (
      <ScrollView
        className="h-full p-5"
        contentContainerStyle={{
          paddingBottom: insets.bottom + 40,
          paddingTop: insets.top,
        }}
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
        contentContainerStyle={{
          paddingBottom: insets.bottom + 150,
          paddingTop: insets.top,
        }}
      >
        <Header />
        <Text className="text-xl font-bold text-green-800 mb-4">Reports</Text>

        {/* Hero strip */}
        <View className="flex-row gap-x-3 mb-4">
          <View style={styles.cardShadow} className="flex-1 bg-white p-4 rounded-2xl">
            <Text className="text-[11px] text-gray-500 font-semibold">Today</Text>
            <Text className="text-2xl font-extrabold text-[#2E4F4F]">
              {heroStats.today ?? "—"}
            </Text>
            <Text className="text-xs text-gray-500">kWh{heroStats.todayDelta !== null && ` (${heroStats.todayDelta >= 0 ? "+" : ""}${heroStats.todayDelta})`}</Text>
          </View>
          <View style={styles.cardShadow} className="flex-1 bg-white p-4 rounded-2xl">
            <Text className="text-[11px] text-gray-500 font-semibold">This week</Text>
            <Text className="text-2xl font-extrabold text-[#2E4F4F]">
              {heroStats.week ?? "—"}
            </Text>
            <Text className="text-xs text-gray-500">kWh{heroStats.weekDelta !== null && ` (${heroStats.weekDelta >= 0 ? "+" : ""}${heroStats.weekDelta})`}</Text>
          </View>
          <View style={styles.cardShadow} className="flex-1 bg-white p-4 rounded-2xl">
            <Text className="text-[11px] text-gray-500 font-semibold">Top appliance</Text>
            <Text className="text-base font-extrabold text-[#2E4F4F]" numberOfLines={1}>
              {heroStats.topName ?? "—"}
            </Text>
            <Text className="text-xs text-gray-500">
              {heroStats.topKwh !== null ? `${heroStats.topKwh} kWh${heroStats.topShare !== null ? ` • ${heroStats.topShare}%` : ""}` : "—"}
            </Text>
          </View>
        </View>
        {lastUpdatedAt && (
          <Text className="text-[10px] text-gray-400 mb-4">
            Updated {lastUpdatedAt.toLocaleTimeString()}
          </Text>
        )}

        {/* Savings Over Time */}
        <Text className="text-xl font-bold text-green-800 mb-4">
          Savings Over Time
        </Text>

        <SavingsChart
          lineData1={lineData1}
          lineData2={lineData2}
          chartMax={chartMax}
          styles={styles}
        />

        {/* Category Filters */}
        <View
          style={styles.cardShadow}
          className="flex-row space-x-3 mb-4 bg-white p-4 rounded-2xl justify-between items-center"
        >
          {category.map((label, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                if (reportCategory !== label) {
                  setReports([]);
                  setReportsTotal([]);
                  setReportCategory(label);
                  setReportLoading(true);
                }
              }}
              className={`px-4 py-2 rounded-full border ${label === reportCategory
                ? "bg-green-700 border-green-700"
                : "bg-white border-gray-300"
                }`}
            >
              <Text
                className={`${label === reportCategory ? "text-white" : "text-black"
                  } font-semibold`}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Device Picker */}
        <View
          style={styles.cardShadow}
          className="bg-white p-4 rounded-2xl mb-4"
        >
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-800 font-semibold mr-4">
              Select Device
            </Text>
            <View className="flex-1 border rounded-xl overflow-hidden border-gray-300">
              <Picker
                mode="dropdown"
                selectedValue={selectedDevice}
                dropdownIconColor="#000"
                style={{ color: "#000", backgroundColor: "#fff" }}
                onValueChange={(v) => {
                  if (v !== selectedDevice) {
                    setReportLoading(true);
                    setSelectedDevice(v);
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
          {selectedDevice !== "All Devices" && (
            <TouchableOpacity
              onPress={handleResetDeviceData}
              disabled={resetting}
              className="mb-4 px-3 py-2 rounded-lg border border-red-300 self-start bg-white"
            >
              <Text className="text-red-600 text-xs font-bold">
                {resetting ? "Resetting…" : "Reset device data"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ------------------------- */}
        {/* ALL DEVICES VIEW */}
        {/* ------------------------- */}
        {selectedDevice === "All Devices" ? (
          <AutoSkeletonView isLoading={reportLoading}>
            <View
              style={styles.cardShadow}
              className="bg-white p-5 rounded-2xl mb-6 min-h-[320px] justify-center"
            >
              {/* Overall Chart */}
              {reportsTotal?.[reportCategory.toLowerCase() + "Totals"]?.[0] ? (
                <EnergyPredictionChart
                  actualData={
                    reportsTotal[reportCategory.toLowerCase() + "Totals"][0]
                      .barData
                  }
                  predictedData={
                    reportsTotal[reportCategory.toLowerCase() + "Totals"][0]
                      .barData2
                  }
                  category={reportCategory}
                />
              ) : (
                <Text className="text-gray-500 text-center text-lg font-semibold">
                  No data yet…
                </Text>
              )}

              {/* Appliances List */}
              {allAppliancesForAllDevices.length === 0 ? (
                <View className="mt-6 items-center">
                  <Text className="text-gray-500 text-lg font-semibold">
                    No appliance usage data available.
                  </Text>
                </View>
              ) : (
                <View className="mt-6">
                  <Text className="text-green-800 font-semibold mb-5 text-center text-lg">
                    {reportCategory} Consumption per Appliance
                  </Text>

                  {allAppliancesForAllDevices.length > 0 ? (
                    <FlatList
                      data={allAppliancesForAllDevices}
                      keyExtractor={(item, i) => item.applianceName + "-" + i}
                      scrollEnabled={false}
                      renderItem={({ item, index: i }) => {
                        const powerUsed = item.latestKwh ?? 0;
                        return (
                          <TouchableOpacity
                            onPress={() => {
                              setSelectedAppliance(item);
                              setModalVisible(true);
                            }}
                            className="mb-4"
                          >
                            <View className="flex-row items-center">
                              <Text className="w-24">{item.applianceName}</Text>
                              <View className="flex-1">
                                <CustomProgressBar
                                  progress={powerUsed}
                                  maxProgress={totalUsageAll}
                                  color="#4CAF50"
                                  reports
                                />
                              </View>
                              <Text className="ml-2 text-gray-600 text-sm">
                                {powerUsed.toFixed(2)} kWh
                              </Text>
                            </View>
                          </TouchableOpacity>
                        );
                      }}
                    />
                  ) : null}
                </View>
              )}
            </View>
          </AutoSkeletonView>
        ) : (
          /* ------------------------- */
          /* SPECIFIC DEVICE VIEW     */
          /* ------------------------- */
          <AutoSkeletonView isLoading={reportLoading}>
            <Text className="text-xl font-bold text-green-800 mb-4">
              Appliance Usage
            </Text>
            <View
              style={styles.cardShadow}
              className="bg-white p-5 rounded-2xl mb-6 min-h-[320px] justify-center"
            >
              {reports.length > 0 ? (
                <FlatList
                  data={reports}
                  keyExtractor={(item, i) => item.applianceName + "-" + i}
                  scrollEnabled={false}
                  renderItem={({ item, index: i }) => {
                    const powerUsed = item.latestKwh ?? 0;
                    const total = reports.reduce(
                      (sum, r) => sum + (r.latestKwh ?? 0),
                      0
                    );
                    return (
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedAppliance(item);
                          setModalVisible(true);
                        }}
                        className="mb-4"
                      >
                        <View className="flex-row items-center">
                          <Text className="w-24">{item.applianceName}</Text>
                          <View className="flex-1">
                            <CustomProgressBar
                              progress={powerUsed}
                              maxProgress={total}
                              color="#4CAF50"
                              reports
                            />
                          </View>
                          <Text className="ml-2 text-gray-600 text-sm">
                            {powerUsed.toFixed(2)} kWh
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  }}
                />
              ) : (
                <View className="h-40 items-center justify-center">
                  <Text className="text-gray-500 text-lg font-semibold">
                    No appliance usage data available.
                  </Text>
                </View>
              )}
            </View>
          </AutoSkeletonView>
        )}
      </ScrollView>

      {/* Modal */}
      <ApplianceModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setSelectedAppliance(null);

        }}
        applianceData={selectedAppliance}
        reportCategory={reportCategory}
      />
      <ResultModal
        visible={!!resetDialog}
        mode={resetDialog?.kind === "confirm" ? "confirm" : "result"}
        success={resetDialog?.success ?? true}
        title={resetDialog?.kind === "confirm" ? "Reset device data?" : resetDialog?.title ?? ""}
        lines={resetDialog?.kind === "confirm" ? ["Deletes ALL history for this device (readings, summaries, kWh).", "Totals may keep residue.", "Cannot be undone."] : resetDialog?.lines ?? []}
        confirmText="Reset"
        onConfirm={handleResetConfirm}
        onClose={() => setResetDialog(null)}
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
