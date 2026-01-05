import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
} from "react-native";
import {
  AntDesign,
  Feather,
  FontAwesome6,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { BarChart, PieChart } from "react-native-gifted-charts";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { format } from "date-fns-tz";

import Header from "@/components/ui/Header";
import { auth } from "@/firebase/firebaseConfig";
import {
  useAiGeneratedStore,
  useBudgetStore,
  useDeviceStore,
  useUsageStore,
} from "@/store/firebaseStore";
import CustomProgressBar from "@/components/reports/CustomProgressBar";
import AIInsightsCarousel from "@/components/ai/Messages";
import Tooltip from "@/components/ui/Tooltip";
import BudgetModal from "@/components/budget/SetBudget";
import {
  AutoSkeletonIgnoreView,
  AutoSkeletonView,
} from "react-native-auto-skeleton";

export default function Dashboard() {
  const screenWidth = Dimensions.get("window").width;
  const insets = useSafeAreaInsets();
  const { devices, userDevices, setDevices, listenToUserAppliances } =
    useDeviceStore();
  const { insights, fetchDailyAiGeneratedContent } = useAiGeneratedStore();
  const {
    monthlyTotalConsumption,
    fetchLatestMonthlyTotalConsumption,
    fetchTodayTrend,
    todayTrend,
    topAppliances,
    fetchTopAppliances,
    fetchAllMonthlyTotalConsumption,
    allMonthlyTotalConsumption,
    dailyData,
    weeklyData,
    fetchDailyTotals,
    fetchWeeklyTotals,
  } = useUsageStore();
  const {
    locationRate,
    fetchLocationRate,
    monthlyBudget,
    percentUsed,
    fetchPercentUsed,
    subscribeToBudget,
  } = useBudgetStore();
  const [efficiency, setEfficiency] = useState(0);
  const [efficiencyColor, setEfficiencyColor] = useState("#16a34a");
  const [totalEnergyConsumption, setTotalEnergyConsumption] = useState(0);
  const [selectedBar, setSelectedBar] = useState(null);
  const [hourlyData, setHourlyData] = useState([]);
  const [toolTip, setToolTip] = useState(false);
  const [userName, setUserName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [weeklySavings, setWeeklySavings] = useState(null);
  const [lastMonthKwh, setLastMonthKwh] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const userId = auth?.currentUser?.uid;
      let active = true;
      if (!userId) return;

      const setupData = async () => {
        if (devices.length === 0) {
          await setDevices();
        }
        await calculateWeeklySavings(userId);

        listenToUserAppliances(userId);

        await Promise.allSettled([
          fetchDailyTotals(userId),
          fetchWeeklyTotals(userId),
        ]);
        if (
          locationRate === 0 ||
          monthlyBudget === null ||
          monthlyTotalConsumption === 0
        ) {
          await fetchLocationRate(userId);
          subscribeToBudget(userId);
          await fetchLatestMonthlyTotalConsumption(userId);
        }

        if (!todayTrend) {
          await fetchTodayTrend(userId);
        }

        if (allMonthlyTotalConsumption.length === 0) {
          await fetchAllMonthlyTotalConsumption(userId);
        }
      };
      if (!monthlyBudget || Number(monthlyBudget?.budget_php) <= 0) {
        setModalVisible(true);
      }
      if (!active) return;
      setupData();
      const timeout = setTimeout(() => {
        if (locationRate > 0 && monthlyBudget) {
          setIsLoading(false);
        }
      }, 1000);
      return () => {
        active = false;
        setIsLoading(true);
        clearTimeout(timeout);
        setToolTip(false);
      };
    }, [locationRate, monthlyBudget])
  );

  const calculateWeeklySavings = async (userId) => {
    try {
      if (!userId) return;

      const weeklyDatas = weeklyData?.weeklyTotals[0]?.barData || [];
      const dailyDatas = dailyData?.dailyTotals[0]?.barData || [];
      if (!weeklyDatas.length || !dailyDatas.length) return;

      // 🔹 Sort week labels chronologically
      const sortedWeeks = [...weeklyDatas].sort((a, b) => {
        const endA = a.date?.split(" - ")[1]?.trim().replace("–", "-");
        const endB = b.date?.split(" - ")[1]?.trim().replace("–", "-");
        if (!endA || !endB) return 0;

        const year = new Date().getFullYear();
        const dateA = new Date(`${year}-${endA}T23:59:59+08:00`);
        const dateB = new Date(`${year}-${endB}T23:59:59+08:00`);
        return dateA - dateB;
      });

      // 🔹 Convert to PH time
      const now = new Date();
      const nowPH = new Date(now.getTime() + 8 * 60 * 60 * 1000);

      // ✅ Get last full week (Mon–Sun)
      const lastWeekTotal = sortedWeeks.at(-2)?.value || 0;

      // 🔹 Get Monday of current week
      const todayPH = new Date(nowPH);
      const dayOfWeek = todayPH.getDay(); // 0=Sun
      const mondayThisWeek = new Date(todayPH);
      mondayThisWeek.setDate(
        todayPH.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)
      );
      mondayThisWeek.setHours(0, 0, 0, 0);

      // 🔹 Filter daily data (Mon → today)
      const currentWeekDays = dailyDatas.filter((d) => {
        if (!d.date) return false;
        const dDate = new Date(`${d.date}T00:00:00+08:00`);
        return dDate >= mondayThisWeek && dDate <= todayPH;
      });

      const currentWeekTotal = currentWeekDays.reduce(
        (sum, d) => sum + (d.value || 0),
        0
      );

      // 🔹 Compute peso savings
      const pesoRate = Number(locationRate);
      if (!Number.isFinite(pesoRate) || pesoRate <= 0) {
        setWeeklySavings(null);
        return;
      }

      const diffKwh = lastWeekTotal - currentWeekTotal;
      const diffPeso = diffKwh * pesoRate;

      if (!Number.isFinite(diffPeso)) {
        setWeeklySavings(null);
        return;
      }

      setWeeklySavings(Number(diffPeso.toFixed(2)));
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

      setTotalEnergyConsumption(total);
    }
    if (allMonthlyTotalConsumption.length > 1) {
      // Sort chronologically by month index (Jan–Dec)
      const monthOrder = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const sorted = [...allMonthlyTotalConsumption].sort(
        (a, b) => monthOrder.indexOf(a.label) - monthOrder.indexOf(b.label)
      );

      // Last month’s total (previous item before current)
      const last = sorted[sorted.length - 2]?.value || 0;
      setLastMonthKwh(last);
    }
  }, [allMonthlyTotalConsumption]);

  useEffect(() => {
    const user = auth?.currentUser;
    if (user) {
      setUserName(user.displayName);
    }
  }, []);

  useEffect(() => {
    if (lastMonthKwh > 0 && monthlyTotalConsumption > 0) {
      fetchPercentUsed(monthlyTotalConsumption);

      const pctVsLast = (monthlyTotalConsumption / lastMonthKwh) * 100;
      const rawEff = 100 - pctVsLast;
      const finalEff = Math.max(0, Math.min(100, Math.round(rawEff)));

      setEfficiency(finalEff);
      setEfficiencyColor(
        finalEff > 90
          ? "#22c55e"
          : finalEff > 70
            ? "#86efac"
            : finalEff > 50
              ? "#facc15"
              : finalEff > 25
                ? "#fb923c"
                : "#ef4444"
      );
    } else {
      // no previous data or first-time user
      setEfficiency(null);
      setEfficiencyColor("#d1d5db"); // neutral gray
    }
  }, [locationRate, monthlyTotalConsumption, lastMonthKwh]);

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

  return (
    <View>
      <ScrollView
        className="p-5 bg-white"
        contentContainerStyle={{
          paddingBottom: insets.bottom + 150,
          paddingTop: insets.top,
        }}
      >
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
                  <Text className="text-4xl font-bold">{efficiency || "--"}</Text>
                  <Text className="text-md text-center">
                    Energy Efficiency Index
                  </Text>
                  <TouchableOpacity
                    onPress={() => setToolTip(!toolTip)}
                    className="p-1"
                  >
                    <Feather name="info" size={18} color="gray" />
                  </TouchableOpacity>
                </View>
              )}
              textColor="black"
            />
            <View className={`${isLoading ? "hidden" : "visible"}`}>
              {efficiency === null && (
                <Text className="text-gray-500 text-xs mt-2 text-center">
                  Not enough data yet — energy efficiency will be shown after
                  your first full month of usage.
                </Text>
              )}
              {efficiency > 90 && (
                <Text className="text-green-600 text-xs mt-2 text-center">
                  Outstanding! You’ve used much less energy than last month.
                </Text>
              )}
              {efficiency > 70 && efficiency <= 90 && (
                <Text className="text-lime-600 text-xs mt-2 text-center">
                  Great work! Your energy usage is improving compared to last
                  month.
                </Text>
              )}
              {efficiency > 40 && efficiency <= 70 && (
                <Text className="text-yellow-600 text-xs mt-2 text-center">
                  You’re using slightly more energy than before. Try saving a
                  bit more.
                </Text>
              )}
              {efficiency > 0 && efficiency <= 40 && (
                <Text className="text-orange-600 text-xs mt-2 text-center">
                  Your consumption increased this month. Review your high-usage
                  appliances.
                </Text>
              )}
              {efficiency === 0 && (
                <Text className="text-red-600 text-xs mt-2 text-center">
                  You’ve used more energy than last month. Consider cutting back
                  to save.
                </Text>
              )}
            </View>
          </View>
          <Tooltip
            toolTip={toolTip}
            setToolTip={setToolTip}
            content={`Compares this month's energy use to last month. 100% means you're using less, lower values mean higher usage. If no data, shows “--”.`}
            from="Dashboard"
          />
          <View className="flex-row justify-between items-center mb-6">
            <View
              className="bg-white rounded-2xl p-4 w-[54%] h-full"
              style={styles.cardShadow}
            >
              <Text className="text-md font-extrabold mb-6">
                Welcome Back, {userName}!
              </Text>
              {weeklySavings === null ? (
                <Text className="text-gray-500 text-sm">
                  Keep tracking your usage to see weekly changes!
                </Text>
              ) : weeklySavings > 0 ? (
                <View className="flex-row items-center">
                  <Feather name="trending-down" size={15} color="#16a34a" />
                  <Text className="text-green-700 ml-2 text-sm font-sm">
                    You've saved ₱{weeklySavings} this week compared to last!
                  </Text>
                </View>
              ) : weeklySavings < 0 ? (
                <View className="flex-row items-center">
                  <Feather name="trending-up" size={15} color="#dc2626" />
                  <Text className="text-red-600 ml-2 text-sm font-sm">
                    You spent ₱{Math.abs(weeklySavings).toFixed(2)} more this week.
                  </Text>
                </View>
              ) : (
                <Text className="text-gray-500 text-sm">
                  No change so far this week.
                </Text>
              )}
            </View>
            <View className="w-[45%] flex-col h-full">
              <View
                className="bg-white rounded-xl p-4 mb-3 items-center"
                style={styles.cardShadow}
              >
                <View className="flex-row items-center">
                  <MaterialCommunityIcons
                    name="power-plug-outline"
                    size={30}
                    color="gray"
                  />
                  <Text className="text-xl font-bold text-green-600">
                    {userDevices?.length}
                  </Text>
                </View>
                <Text className="text-gray-500 text-sm">Devices</Text>
              </View>
              <View
                className="bg-white rounded-xl p-4 items-center"
                style={styles.cardShadow}
              >
                <View className="flex-row items-center">
                  <MaterialCommunityIcons
                    name="lightning-bolt-outline"
                    size={30}
                    color="gray"
                  />
                  <Text className="text-xl font-bold text-green-600">
                    {totalEnergyConsumption.toFixed(2)}
                  </Text>
                </View>
                <Text className="text-gray-500 text-[9px] italic">
                  Energy Consumption(kWh)
                </Text>
              </View>
            </View>
          </View>
          <View
            className="bg-white rounded-2xl p-4 mb-6"
            style={styles.cardShadow}
          >
            <Text className="text-xl font-semibold mb-2">
              Today's Energy Trend
            </Text>
            <Text className="text-gray-500 text-sm mb-4">
              Tap a bar to see exact time range & kWh
            </Text>
            <View
              className={`flex-row justify-between items-end ${todayTrend?.buckets &&
                Object.keys(todayTrend.buckets).length > 0
                ? "h-32"
                : ""
                }`}
            >
              {todayTrend?.buckets &&
                Object.keys(todayTrend.buckets).length > 0 ? (
                Object.entries(todayTrend.buckets).map(([label, value], i) => (
                  <TouchableOpacity
                    key={i}
                    className="items-center mx-3"
                    onPress={() => handleBarPress(label)}
                  >
                    <View
                      className="w-6 bg-green-600 rounded-md"
                      style={{ height: value * 10 }}
                    />
                    <Text className="text-md mt-1 text-gray-500">
                      {value.toFixed(2)}
                    </Text>
                    <Text className="text-sm mt-1 text-gray-500">
                      {label.split("-")[0]}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <View className="items-center justify-center">
                  <Text className="text-gray-500 text-md">
                    No data available for today.
                  </Text>
                </View>
              )}
            </View>
          </View>
          <View
            className="bg-white rounded-2xl p-4 mb-6"
            style={styles.cardShadow}
          >
            <Text className="text-xl font-extrabold mb-2">Monthly Goals</Text>
            <Text className="text-sm text-black mb-4">
              Monitor your estimated monthly energy bills against your set
              target.
            </Text>
            {monthlyBudget !== null ? (
              <View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-500 mb-2">
                    Current: ₱
                    {(monthlyTotalConsumption * locationRate).toFixed(2)}
                  </Text>
                  <Text>Goal: ₱{monthlyBudget?.budget_php}</Text>
                </View>
                <CustomProgressBar
                  progress={(monthlyTotalConsumption * locationRate).toFixed(2)}
                  maxProgress={monthlyBudget?.budget_php}
                  color="#4CAF50"
                  backgroundColor="#D9D9D9"
                />
              </View>
            ) : (
              <View className="">
                <Text className="text-gray-500 text-md">
                  No data budget is set, set it at budget page.
                </Text>
              </View>
            )}
          </View>
          <View
            className="bg-white rounded-2xl p-4 mb-6"
            style={styles.cardShadow}
          >
            <Text className="text-xl font-extrabold mb-4">Top Appliances</Text>
            <Text className="text-sm text-black mb-4">
              See which appliances are consuming the most energy
            </Text>
            {topAppliances.length > 0 ? (
              topAppliances.map((appliance, i) => (
                <View
                  key={i}
                  className="relative flex-row items-center justify-between mb-2 mx-10"
                >
                  {/* Left side */}
                  <View className="flex-row items-center">
                    <MaterialCommunityIcons
                      name={`numeric-${i + 1}-circle`}
                      size={22}
                      color="#136B1E"
                    />
                    <Text className="ml-2 text-gray-700 font-medium">
                      {appliance.name}
                    </Text>
                  </View>
                  {/* Right side */}
                  <Text className="font-semibold text-gray-800">
                    {appliance.kwh} kWh
                  </Text>
                </View>
              ))
            ) : (
              <Text className="text-gray-400">No usage data available</Text>
            )}
          </View>
          <View className="bg-white rounded-2xl p-4" style={styles.cardShadow}>
            <Text className="text-xl font-extrabold mb-4">AI Insights</Text>
            {insights && insights.length > 0 ? (
              <AIInsightsCarousel insights={insights} />
            ) : (
              <Text className="text-gray-400">
                AI will give you personalized tips to save energy when data is
                available
              </Text>
            )}
          </View>
        </AutoSkeletonView>
      </ScrollView>
      <BudgetModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        rate={locationRate}
        showPrompt
        required
        currentBudgetPhp={Number(monthlyBudget?.budget_php) || 0}
      />
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
            <TouchableOpacity
              onPress={() => setSelectedBar(null)}
              className="absolute top-3 right-3 z-10"
            >
              <View className="bg-red-600 w-10 h-10 rounded-full items-center justify-center">
                <AntDesign name="close" size={12} color="white" />
              </View>
            </TouchableOpacity>
            {hourlyData.length > 0 ? (
              <View
                style={{ width: "100%", alignItems: "center" }}
                className="max-w-[420px]"
              >
                <BarChart
                  data={hourlyData}
                  barWidth={35}
                  spacing={24}
                  disableScroll
                  frontColor="#16a34a"
                  yAxisTextStyle={{ color: "#6B7280", fontSize: 11 }}
                  xAxisLabelTextStyle={{ color: "#6B7280", fontSize: 11 }}
                  noOfSections={4}
                  animationDuration={800}
                  yAxisThickness={0}
                  xAxisThickness={0}
                  width={screenWidth * 0.65} // responsive width (85% of screen)
                  maxValue={
                    Math.max(...hourlyData.map((d) => d.value)) * 1.2 || 1
                  }
                  initialSpacing={20}
                  barBorderRadius={6}
                  xAxisLabelsVerticalShift={8}
                  yAxisLabelWidth={32}
                />
              </View>
            ) : (
              <Text className="text-center text-gray-400">No hourly data</Text>
            )}
          </View>
        </View>
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
