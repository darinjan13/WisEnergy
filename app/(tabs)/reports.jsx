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
import { MaterialCommunityIcons } from "@expo/vector-icons";
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

  const applianceIcon = (name = "") => {
    const n = String(name).toLowerCase();
    if (n.includes("fan") || n.includes("aircon") || n.includes("air-con") || n.includes("ac ")) return "fan";
    if (n.includes("tv") || n.includes("monitor") || n.includes("screen")) return "television";
    if (n.includes("pc") || n.includes("computer") || n.includes("desktop") || n.includes("laptop")) return "desktop-tower";
    if (n.includes("fridge") || n.includes("refrigerator")) return "fridge";
    if (n.includes("lamp") || n.includes("light") || n.includes("bulb")) return "lightbulb";
    if (n.includes("heater") || n.includes("kettle") || n.includes("water")) return "kettle";
    if (n.includes("charger") || n.includes("phone")) return "power-plug";
    return "power-plug-outline";
  };

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

  const chartMeta = useMemo(() => {
    const src = reportsTotal?.[reportCategory.toLowerCase() + "Totals"]?.[0];
    const bars = src?.barData ?? [];
    const vals = bars.map((b) => Number(b.value) || 0);
    return {
      avg: vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null,
      month: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      title: `${reportCategory} Breakdown`,
    };
  }, [reportsTotal, reportCategory]);

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
        <Text className="text-xl font-bold text-green-800">Reports</Text>
        <Text className="text-sm text-gray-500 mb-4">Historical Usage & Insights</Text>

        {/* Hero strip */}
        <View className="flex-row gap-x-2.5 mb-5">
          <View style={styles.cardShadow} className="flex-1 bg-white p-3 rounded-2xl min-h-[104px] justify-between">
            <Text className="text-[11px] text-gray-500 font-semibold uppercase">Today</Text>
            <View className="my-1 flex-row items-baseline">
              <Text className="text-xl font-extrabold text-green-800 leading-none">
                {heroStats.today ?? "—"}
              </Text>
              <Text className="text-[11px] font-semibold text-gray-500 ml-0.5">kWh</Text>
            </View>
            {heroStats.todayDelta !== null && heroStats.todayDelta !== 0 && (
              <View className={`self-start px-1.5 py-0.5 rounded-md ${heroStats.todayDelta < 0 ? "bg-green-50" : "bg-red-50"}`}>
                <Text className={`text-[11px] font-semibold ${heroStats.todayDelta < 0 ? "text-green-700" : "text-red-600"}`}>
                  {heroStats.todayDelta < 0 ? "↓" : "↑"} {Math.abs(heroStats.todayDelta)}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.cardShadow} className="flex-1 bg-white p-3 rounded-2xl min-h-[104px] justify-between">
            <Text className="text-[11px] text-gray-500 font-semibold uppercase">This week</Text>
            <View className="my-1 flex-row items-baseline">
              <Text className="text-xl font-extrabold text-green-800 leading-none">
                {heroStats.week ?? "—"}
              </Text>
              <Text className="text-[11px] font-semibold text-gray-500 ml-0.5">kWh</Text>
            </View>
            {heroStats.weekDelta !== null && heroStats.weekDelta !== 0 && (
              <View className={`self-start px-1.5 py-0.5 rounded-md ${heroStats.weekDelta < 0 ? "bg-green-50" : "bg-red-50"}`}>
                <Text className={`text-[11px] font-semibold ${heroStats.weekDelta < 0 ? "text-green-700" : "text-red-600"}`}>
                  {heroStats.weekDelta < 0 ? "↓" : "↑"} {Math.abs(heroStats.weekDelta)}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.cardShadow} className="flex-1 bg-white p-3 rounded-2xl min-h-[104px] justify-between">
            <Text className="text-[11px] text-gray-500 font-semibold uppercase">Top app.</Text>
            <View className="my-1">
              <Text className="text-base font-extrabold text-green-800 leading-none" numberOfLines={1}>
                {heroStats.topName ?? "—"}
              </Text>
            </View>
            <Text className="text-[11px] text-gray-500">
              {heroStats.topShare !== null ? `${heroStats.topShare}% total` : "—"}
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
        <View className="flex-row gap-x-2 mb-5 w-full">
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
              className={`flex-1 min-h-[46px] rounded-full items-center justify-center ${label === reportCategory
                ? "bg-[#166534]"
                : "bg-white"
                }`}
              style={label === reportCategory ? {} : styles.cardShadow}
            >
              <Text
                className={`${label === reportCategory ? "text-white" : "text-gray-800"
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
          className="bg-white p-4 rounded-2xl mb-5 w-full"
        >
          <Text className="text-[11px] text-gray-500 font-semibold uppercase mb-2">
            Select Device
          </Text>
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
              <View className="flex-row items-start justify-between mb-4">
                <View>
                  <Text className="text-base font-bold text-gray-800">{chartMeta.title}</Text>
                  <Text className="text-xs text-gray-500 mt-0.5">{chartMeta.month}</Text>
                </View>
                {chartMeta.avg !== null && (
                  <View className="bg-gray-100 px-2.5 py-1.5 rounded-lg flex-row items-center">
                    <Text className="text-[11px] font-semibold text-green-800">
                      Avg: {chartMeta.avg.toFixed(1)} kWh{reportCategory === "Daily" ? "/day" : reportCategory === "Weekly" ? "/week" : "/mo"}
                    </Text>
                  </View>
                )}
              </View>
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
                        const share = totalUsageAll > 0 ? Math.round((powerUsed / totalUsageAll) * 100) : 0;
                        return (
                          <TouchableOpacity
                            onPress={() => {
                              setSelectedAppliance(item);
                              setModalVisible(true);
                            }}
                            className="mb-4"
                          >
                            <View className="flex-row items-center">
                              <View className="w-10 h-10 rounded-xl bg-green-50 items-center justify-center mr-3">
                                <MaterialCommunityIcons
                                  name={applianceIcon(item.applianceName)}
                                  size={20}
                                  color="#166534"
                                />
                              </View>
                              <View className="flex-1">
                                <Text className="text-sm font-semibold text-gray-800" numberOfLines={1}>{item.applianceName}</Text>
                                <View className="h-2 bg-gray-100 rounded-full overflow-hidden mt-1.5">
                                  <View className="h-full bg-green-700 rounded-full" style={{ width: `${share}%` }} />
                                </View>
                              </View>
                              <View className="items-end ml-2">
                                <Text className="text-sm font-extrabold text-green-800">
                                  {powerUsed.toFixed(2)} <Text className="text-[11px] font-medium text-gray-500">kWh</Text>
                                </Text>
                                <Text className="text-[11px] text-gray-500 mt-0.5">{share}% share</Text>
                              </View>
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
                    const share = total > 0 ? Math.round((powerUsed / total) * 100) : 0;
                    return (
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedAppliance(item);
                          setModalVisible(true);
                        }}
                        className="mb-4"
                      >
                        <View className="flex-row items-center">
                          <View className="w-10 h-10 rounded-xl bg-green-50 items-center justify-center mr-3">
                            <MaterialCommunityIcons
                              name={applianceIcon(item.applianceName)}
                              size={20}
                              color="#166534"
                            />
                          </View>
                          <View className="flex-1">
                            <Text className="text-sm font-semibold text-gray-800" numberOfLines={1}>{item.applianceName}</Text>
                            <View className="h-2 bg-gray-100 rounded-full overflow-hidden mt-1.5">
                              <View className="h-full bg-green-700 rounded-full" style={{ width: `${share}%` }} />
                            </View>
                          </View>
                          <View className="items-end ml-2">
                            <Text className="text-sm font-extrabold text-green-800">
                              {powerUsed.toFixed(2)} <Text className="text-[11px] font-medium text-gray-500">kWh</Text>
                            </Text>
                            <Text className="text-[11px] text-gray-500 mt-0.5">{share}% share</Text>
                          </View>
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
