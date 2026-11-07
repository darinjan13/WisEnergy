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
import {
  resetDeviceHistory,
  listUsageDates,
  clearDeviceData,
  clearUsageNode,
} from "@/services/firebaseDevicesService";
import { clearTopAppliancesCache } from "@/services/firebaseUsageService";

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
  const [clearSheet, setClearSheet] = useState(false);
  const [usageDates, setUsageDates] = useState([]);
  const [datesLoading, setDatesLoading] = useState(false);
  const [pickedDates, setPickedDates] = useState([]);
  const [pendingClear, setPendingClear] = useState(null); // {type:'all'|'days'|'usage', dates:[]}
  const todayIso = new Date().toISOString().slice(0, 10);
  const [zoneError, setZoneError] = useState({});
  // Rapid category/device switches obsolete in-flight rounds; only the
  // latest round may write state (prevents fetch + chart pile-ups).
  const roundRef = useRef(0);

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

  // Reflect a wipe immediately: the appliance list + heroes read from cached
  // store slices, so invalidate and refetch. Sequential, not parallel — this
  // screen has a history of heap kills and seven concurrent fetches is a spike.
  const refreshAfterClear = async () => {
    const uid = auth.currentUser?.uid;
    const apps =
      reportData.find((d) => d.device_id === selectedDevice)?.appliances ?? [];
    await clearTopAppliancesCache(uid);
    for (const task of [
      () => fetchDailyReport(uid, selectedDevice, apps),
      () => fetchWeeklyReport(uid, selectedDevice, apps),
      () => fetchMonthlyReport(uid, selectedDevice, apps),
      () => fetchDailyTotals(uid),
      () => fetchWeeklyTotals(uid),
      () => fetchMonthlyTotals(uid),
      () => fetchTopAppliances(uid),
    ]) {
      try { await task(); } catch {}
    }
  };

  const openClearSheet = async () => {
    if (selectedDevice === "All Devices") return;
    setPickedDates([]);
    setClearSheet(true);
    setDatesLoading(true);
    try {
      const { dates } = await listUsageDates(auth.currentUser?.uid, selectedDevice);
      setUsageDates(dates);
    } catch {
      setUsageDates([]);
    } finally {
      setDatesLoading(false);
    }
  };

  const toggleDate = (d) =>
    setPickedDates((p) => (p.includes(d) ? p.filter((x) => x !== d) : [...p, d]));

  // Presets skip today on purpose: the device rewrites today within seconds.
  const pickPreset = (n) => {
    const past = usageDates.filter((d) => d < todayIso);
    setPickedDates(n === 0 ? past : past.slice(-n));
  };

  const proceedClear = (type, dates = []) => {
    setClearSheet(false);
    setPendingClear({ type, dates });
    setResetDialog({ kind: "confirm" });
  };

  const handleResetConfirm = async () => {
    const action = pendingClear;
    try {
      setResetting(true);
      const uid = auth.currentUser?.uid;
      let failed = [];
      let title = "";
      let lines = [];
      if (!action || action.type === "all") {
        ({ failed } = await resetDeviceHistory(uid, selectedDevice));
        title = "Device history cleared";
        lines = ["All readings, summaries and kWh for this device were removed."];
      } else if (action.type === "usage") {
        ({ failed } = await clearUsageNode(uid, selectedDevice));
        title = "Raw readings cleared";
        lines = ["The usage/ node was emptied. Summaries and kWh counters were kept."];
      } else {
        const r = await clearDeviceData(uid, selectedDevice, { dates: action.dates });
        failed = r.failed;
        title = `Cleared ${r.deleted} day(s)`;
        lines = [
          "Readings and daily summaries were removed for the selected days.",
          "Overlapping week/month summary buckets were reset too.",
        ];
      }
      if (failed.length === 0) {
        await refreshAfterClear();
        setResetDialog({ kind: "result", success: true, title, lines: [...lines, "The list below has been refreshed."] });
      } else {
        setResetDialog({ kind: "result", success: false, title: "Partially cleared", lines: ["These refused to delete:", ...failed] });
      }
    } catch (e) {
      console.error("Clear device data failed", e);
      setResetDialog({ kind: "result", success: false, title: "Clear failed", lines: [e?.code || e?.message || "Unknown error"] });
    } finally {
      setResetting(false);
    }
  };

  const confirmInfo = useMemo(() => {
    const a = pendingClear;
    if (!a || a.type === "all") {
      return {
        title: "Clear all device data?",
        lines: [
          "Deletes ALL history for this device (readings, summaries, kWh).",
          "Totals may keep residue.",
          "Cannot be undone.",
        ],
        confirm: "Clear all",
      };
    }
    if (a.type === "usage") {
      return {
        title: "Clear raw readings only?",
        lines: [
          "Deletes only the raw usage/ node for this device.",
          "Daily/weekly/monthly summaries and kWh counters are kept.",
          "Cannot be undone.",
        ],
        confirm: "Clear readings",
      };
    }
    return {
      title: `Clear ${a.dates.length} day(s)?`,
      lines: [
        `Days: ${a.dates.join(", ")}`,
        "Also resets the week/month summary buckets those days fall in.",
        "The device rewrites today's data within seconds.",
        "Cannot be undone.",
      ],
      confirm: "Clear days",
    };
  }, [pendingClear]);

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
          const [d, w, m, b, t] = await Promise.allSettled([
            fetchDailyTotals(uid),
            fetchWeeklyTotals(uid),
            fetchMonthlyTotals(uid),
            fetchAllBudget(uid),
            fetchTopAppliances(uid),
          ]);
          if (!active) return;
          setZoneError({
            daily: d.status === "rejected" ? String(d.reason?.message || d.reason) : null,
            weekly: w.status === "rejected" ? String(w.reason?.message || w.reason) : null,
            monthly: m.status === "rejected" ? String(m.reason?.message || m.reason) : null,
            budget: b.status === "rejected" ? String(b.reason?.message || b.reason) : null,
            top: t.status === "rejected" ? String(t.reason?.message || t.reason) : null,
          });

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
      const round = ++roundRef.current;
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
        if (!cancelled && roundRef.current === round) {
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
      if (!cancelled && roundRef.current === round) {
        setReportLoading(false);
        setLastUpdatedAt(new Date());
      }
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
  const lineData1 = useMemo(
    () => allMonthlyTotalConsumption.map((d) => ({ ...d, type: "consumption" })),
    [allMonthlyTotalConsumption]
  );
  const lineData2 = useMemo(
    () => allBudget.map((d) => ({ ...d, type: "budget" })),
    [allBudget]
  );

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
  return (
    <View className="flex-1 bg-gray-100">
      <ScrollView
        className="p-5"
        contentContainerStyle={{
          paddingBottom: insets.bottom + 150,
          paddingTop: insets.top,
        }}
        stickyHeaderIndices={[3]}
      >
        <Header />
        <Text className="text-xl font-bold text-green-800">Reports</Text>
        <Text className="text-sm text-gray-500 mb-4">Historical Usage & Insights</Text>

        {/* Category Filters (sticky: switcher stays reachable while
            scrolled down at the chart) */}
        <View
          className="flex-row gap-x-2 pt-2 pb-3 -mx-5 px-5 bg-gray-100 border-b border-gray-200"
          style={{ zIndex: 10 }}
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

        <AutoSkeletonView isLoading={isLoading}>
        {/* Device Picker */}
        <View
          style={styles.cardShadow}
          className="bg-white p-4 rounded-2xl mb-5 w-full"
        >
          <Text className="text-xs text-gray-500 font-semibold uppercase mb-3">
            Select Device
          </Text>
          <View className="flex-row items-center justify-between">
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
        </View>

        {/* Hero strip */}
        <View className="flex-row gap-x-3 mb-5">
          <View style={styles.cardShadow} className="flex-1 bg-white p-4 rounded-2xl min-h-[104px] justify-between">
            <Text className="text-xs text-gray-500 font-semibold uppercase">Today</Text>
            <View className="my-1 flex-row items-baseline">
              <Text className="text-xl font-extrabold text-green-800 leading-none">
                {heroStats.today ?? "—"}
              </Text>
              <Text className="text-xs font-semibold text-gray-500 ml-0.5">kWh</Text>
            </View>
            {heroStats.todayDelta !== null && heroStats.todayDelta !== 0 && (
              <View className={`self-start px-1.5 py-0.5 rounded-md ${heroStats.todayDelta < 0 ? "bg-green-50" : "bg-red-50"}`}>
                <Text className={`text-xs font-semibold ${heroStats.todayDelta < 0 ? "text-green-700" : "text-red-600"}`}>
                  {heroStats.todayDelta < 0 ? "↓" : "↑"} {Math.abs(heroStats.todayDelta)}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.cardShadow} className="flex-1 bg-white p-4 rounded-2xl min-h-[104px] justify-between">
            <Text className="text-xs text-gray-500 font-semibold uppercase">This week</Text>
            <View className="my-1 flex-row items-baseline">
              <Text className="text-xl font-extrabold text-green-800 leading-none">
                {heroStats.week ?? "—"}
              </Text>
              <Text className="text-xs font-semibold text-gray-500 ml-0.5">kWh</Text>
            </View>
            {heroStats.weekDelta !== null && heroStats.weekDelta !== 0 && (
              <View className={`self-start px-1.5 py-0.5 rounded-md ${heroStats.weekDelta < 0 ? "bg-green-50" : "bg-red-50"}`}>
                <Text className={`text-xs font-semibold ${heroStats.weekDelta < 0 ? "text-green-700" : "text-red-600"}`}>
                  {heroStats.weekDelta < 0 ? "↓" : "↑"} {Math.abs(heroStats.weekDelta)}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.cardShadow} className="flex-1 bg-white p-4 rounded-2xl min-h-[104px] justify-between">
            <Text className="text-xs text-gray-500 font-semibold uppercase">Top app.</Text>
            <View className="my-1">
              <Text className="text-base font-extrabold text-green-800 leading-none" numberOfLines={1}>
                {heroStats.topName ?? "—"}
              </Text>
            </View>
            <Text className="text-xs text-gray-500">
              {heroStats.topShare !== null ? `${heroStats.topShare}% total` : "—"}
            </Text>
          </View>
        </View>
        {lastUpdatedAt && (
          <Text className="text-xs text-gray-400 mb-4">
            Updated {lastUpdatedAt.toLocaleTimeString()}
          </Text>
        )}
        </AutoSkeletonView>

        {/* ------------------------- */}
        {/* ALL DEVICES VIEW */}
        {/* ------------------------- */}
        {selectedDevice === "All Devices" ? (
          <AutoSkeletonView isLoading={reportLoading}>
            <View
              style={styles.cardShadow}
              className="bg-white p-5 rounded-2xl mb-5 min-h-[320px] justify-center"
            >
              {/* Overall Chart */}
              <View className="flex-row items-start justify-between mb-4">
                <View>
                  <Text className="text-base font-bold text-gray-800">{chartMeta.title}</Text>
                  <Text className="text-xs text-gray-500 mt-0.5">{chartMeta.month}</Text>
                  {zoneError[reportCategory.toLowerCase()] && (
                    <Text className="text-xs text-red-600 mt-1">
                      Couldn't refresh — showing cached data.
                    </Text>
                  )}
                </View>
                {chartMeta.avg !== null && (
                  <View className="bg-gray-100 px-2.5 py-1.5 rounded-lg flex-row items-center">
                    <Text className="text-xs font-semibold text-green-800">
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
                <Text className="text-gray-500 text-center text-sm font-semibold">
                  No data yet…
                </Text>
              )}

              {/* Appliances List */}
              {allAppliancesForAllDevices.length === 0 ? (
                <View className="mt-6 items-center">
                  <Text className="text-gray-500 text-sm font-semibold">
                    No appliance usage data available.
                  </Text>
                </View>
              ) : (
                <View className="mt-6">
                  <Text className="text-green-800 font-semibold mb-4 text-center text-base">
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
                                  {powerUsed.toFixed(2)} <Text className="text-xs font-medium text-gray-500">kWh</Text>
                                </Text>
                                <Text className="text-xs text-gray-500 mt-0.5">{share}% share</Text>
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
          <>
          <AutoSkeletonView isLoading={reportLoading}>
            <Text className="text-base font-bold text-green-800 mb-4">
              Appliance Usage
            </Text>
            <View
              style={styles.cardShadow}
              className="bg-white p-5 rounded-2xl mb-5"
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
                              {powerUsed.toFixed(2)} <Text className="text-xs font-medium text-gray-500">kWh</Text>
                            </Text>
                            <Text className="text-xs text-gray-500 mt-0.5">{share}% share</Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  }}
                />
              ) : (
                <View className="h-40 items-center justify-center">
                  <Text className="text-gray-500 text-sm font-semibold">
                    No appliance usage data available.
                  </Text>
                </View>
              )}
            </View>
          </AutoSkeletonView>

          <View className="p-4 rounded-2xl border border-red-200 bg-white mb-5">
            <View className="flex-row items-center mb-1">
              <MaterialCommunityIcons name="alert-outline" size={16} color="#B91C1C" />
              <Text className="text-xs font-bold uppercase text-red-700 ml-2">
                Danger zone
              </Text>
            </View>
            <Text className="text-xs text-gray-500 mb-3">
              Remove history for{" "}
              {reportData.find((d) => d.device_id === selectedDevice)?.device_nickname || "this device"} — pick
              specific days, clear everything, or drop only the raw readings. Cannot be undone.
            </Text>
            <TouchableOpacity
              onPress={openClearSheet}
              disabled={resetting}
              accessibilityRole="button"
              accessibilityLabel="Clear device data"
              accessibilityHint="Choose which days to clear, or clear everything"
              accessibilityState={{ disabled: resetting, busy: resetting }}
              style={{ opacity: resetting ? 0.6 : 1 }}
              className="py-3 rounded-xl border border-red-300 bg-white flex-row items-center justify-center"
            >
              <MaterialCommunityIcons name="calendar-remove-outline" size={18} color="#DC2626" />
              <Text className="text-red-600 text-sm font-bold ml-2">
                {resetting ? "Working…" : "Clear data…"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setPendingClear({ type: "usage", dates: [] });
                setResetDialog({ kind: "confirm" });
              }}
              disabled={resetting}
              accessibilityRole="button"
              accessibilityLabel="Clear raw readings only"
              accessibilityHint="Deletes only the raw usage node, keeping summaries and kWh"
              accessibilityState={{ disabled: resetting }}
              style={{ opacity: resetting ? 0.6 : 1 }}
              className="py-3 mt-2 rounded-xl border border-amber-300 bg-white flex-row items-center justify-center"
            >
              <MaterialCommunityIcons name="database-remove-outline" size={18} color="#B45309" />
              <Text className="text-amber-700 text-sm font-bold ml-2">
                Clear raw readings only
              </Text>
            </TouchableOpacity>
          </View>
          </>
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
      <Modal
        visible={clearSheet}
        transparent
        animationType="fade"
        onRequestClose={() => setClearSheet(false)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-3xl p-5">
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-base font-bold text-gray-800">Clear device data</Text>
              <TouchableOpacity
                onPress={() => setClearSheet(false)}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <MaterialCommunityIcons name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <Text className="text-xs text-gray-500 mb-3">
              Choose what to remove for{" "}
              {reportData.find((d) => d.device_id === selectedDevice)?.device_nickname || "this device"}.
              Today is excluded — the device rewrites it within seconds.
            </Text>

            <View className="flex-row gap-x-2 mb-3">
              {[
                { label: "Last 7 days", n: 7 },
                { label: "Last 30 days", n: 30 },
                { label: "All days", n: 0 },
              ].map((p) => (
                <TouchableOpacity
                  key={p.label}
                  onPress={() => pickPreset(p.n)}
                  className="flex-1 py-2 rounded-lg bg-gray-100 items-center"
                >
                  <Text className="text-xs font-semibold text-gray-700">{p.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {datesLoading ? (
              <Text className="text-xs text-gray-400 py-6 text-center">Loading days…</Text>
            ) : usageDates.length === 0 ? (
              <Text className="text-xs text-gray-400 py-6 text-center">
                No raw readings found for this device.
              </Text>
            ) : (
              <ScrollView className="max-h-56">
                <View className="flex-row flex-wrap gap-2">
                  {[...usageDates].reverse().map((d) => {
                    const isToday = d === todayIso;
                    const on = pickedDates.includes(d);
                    return (
                      <TouchableOpacity
                        key={d}
                        disabled={isToday}
                        onPress={() => toggleDate(d)}
                        accessibilityRole="button"
                        accessibilityState={{ selected: on, disabled: isToday }}
                        className={`px-2.5 py-1.5 rounded-lg border ${
                          isToday
                            ? "bg-gray-50 border-gray-200"
                            : on
                            ? "bg-red-50 border-red-400"
                            : "bg-white border-gray-300"
                        }`}
                      >
                        <Text
                          className={`text-xs font-semibold ${
                            isToday ? "text-gray-300" : on ? "text-red-700" : "text-gray-700"
                          }`}
                        >
                          {d.slice(5)}
                          {isToday ? " (today)" : ""}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            )}

            <View className="flex-row gap-x-2 mt-4">
              <TouchableOpacity
                onPress={() => setClearSheet(false)}
                className="flex-1 py-3 rounded-xl border border-gray-300 items-center"
              >
                <Text className="text-sm font-bold text-gray-600">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={pickedDates.length === 0}
                onPress={() => proceedClear("days", pickedDates)}
                style={{ opacity: pickedDates.length === 0 ? 0.5 : 1 }}
                className="flex-1 py-3 rounded-xl bg-red-600 items-center"
              >
                <Text className="text-sm font-bold text-white">
                  {pickedDates.length ? `Delete ${pickedDates.length}` : "Select days"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => proceedClear("all")}
                className="flex-1 py-3 rounded-xl border border-red-300 items-center"
              >
                <Text className="text-sm font-bold text-red-600">Everything</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ResultModal
        visible={!!resetDialog}
        mode={resetDialog?.kind === "confirm" ? "confirm" : "result"}
        success={resetDialog?.success ?? true}
        title={resetDialog?.kind === "confirm" ? confirmInfo.title : resetDialog?.title ?? ""}
        lines={resetDialog?.kind === "confirm" ? confirmInfo.lines : resetDialog?.lines ?? []}
        confirmText={confirmInfo.confirm}
        onConfirm={handleResetConfirm}
        onClose={() => {
          setResetDialog(null);
          setPendingClear(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
});
