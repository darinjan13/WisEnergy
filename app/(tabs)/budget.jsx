import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PieChart } from "react-native-gifted-charts";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import Header from "@/components/ui/Header";
import { auth } from "@/firebase/firebaseConfig";
import { useFocusEffect } from "expo-router";
import {
  useAiGeneratedStore,
  useBudgetStore,
  useUsageStore,
} from "@/store/firebaseStore";
import { db } from "@/firebase/firebaseConfig";
import { get, off, onValue, ref, update } from "firebase/database";

import BudgetModal from "@/components/budget/SetBudget";
import AIInsightsCarousel from "@/components/ai/Messages";
import Tooltip from "@/components/ui/Tooltip";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  AutoSkeletonIgnoreView,
  AutoSkeletonView,
} from "react-native-auto-skeleton";
import { getMonthName } from "../../utils/dateHelper";

export default function Budget() {
  const insets = useSafeAreaInsets();
  const { recommendations } = useAiGeneratedStore();
  const {
    locationRate,
    fetchLocationRate,
    monthlyBudget,
    fetchPercentUsed,
    percentUsed,
  } = useBudgetStore();
  const { monthlyTotalConsumption } = useUsageStore();

  const [budget, setBudget] = useState(0);
  const [usedKWh, setUsedKWh] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toolTip, setToolTip] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [estimatedCost, setEstimatedCost] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [budgetKWh, setBudgetKWh] = useState(0);
  const [remainingKWh, setRemainingKWh] = useState(0);
  const [lastThreeRates, setLastThreeRates] = useState([]);

  const fetchLastThreeRates = async (cityName) => {
    const formattedCity = cityName.replace(/ /g, "_");
    const yearRef = ref(db, `city/${formattedCity}`);
    const yearSnap = await get(yearRef);

    if (!yearSnap.exists()) return [];

    const years = Object.keys(yearSnap.val()).sort();
    const latestYear = years[years.length - 1];

    const monthsRef = ref(db, `city/${formattedCity}/${latestYear}`);
    const monthsSnap = await get(monthsRef);

    if (!monthsSnap.exists()) return [];

    const monthsData = monthsSnap.val();
    const monthKeys = Object.keys(monthsData).sort(); // "06", "07", "08" ...

    const lastThreeMonths = monthKeys.slice(-3);

    return lastThreeMonths.map((mon) => ({
      year: latestYear,
      month: mon,
      rate: monthsData[mon].rate,
      set_at: monthsData[mon].set_at,
    }));
  };

  const fetchUserLocation = async (userId) => {
    const userRef = ref(db, `users/${userId}/location`);
    const snap = await get(userRef);

    if (!snap.exists()) return null;

    const rawLocation = snap.val(); // "Mandaue City"
    const formatted = rawLocation.replace(/ /g, "_"); // "Mandaue_City"

    return {
      raw: rawLocation,
      formatted: formatted,
    };
  };

  useEffect(() => {
    const loadLocationAndRates = async () => {
      const loc = await fetchUserLocation(auth.currentUser.uid);
      if (!loc) return;

      const lastRates = await fetchLastThreeRates(loc.formatted);
      setLastThreeRates(lastRates); // ⭐ store in state
    };

    loadLocationAndRates();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (locationRate == 0) {
        fetchLocationRate(auth.currentUser.uid);
      }
      const timeout = setTimeout(() => {
        if (locationRate > 0) {
          setLoading(false);
        }
      }, 1000);
      return () => {
        setModalVisible(false);
        setToolTip(false);
        setLoading(true);
        clearTimeout(timeout);
      };
    }, [locationRate])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setLoading(true);
    fetchLocationRate(auth.currentUser.uid);
    setTimeout(() => {
      setRefreshing(false);
      setLoading(false);
    }, 1500);
  }, []);
  useEffect(() => {
    const est = usedKWh * locationRate;
    const budKwh = budget / locationRate;
    const remCost = budget - est;
    const remKwh = budKwh - usedKWh;

    setEstimatedCost(est);
    setRemaining(remCost);
    setBudgetKWh(budKwh);
    setRemainingKWh(remKwh);

    fetchPercentUsed(monthlyTotalConsumption);
  }, [budget, usedKWh, locationRate, monthlyTotalConsumption]);

  useEffect(() => {
    if (monthlyBudget?.budget_php > 0) {
      setBudget(monthlyBudget?.budget_php || 0);
    } else {
      setModalVisible(true);
    }
  }, [monthlyBudget]);

  useEffect(() => {
    if (monthlyTotalConsumption > 0) {
      setUsedKWh(monthlyTotalConsumption);
    }
  }, [monthlyTotalConsumption]);
  return (
    <GestureHandlerRootView>
      <ScrollView
        className="p-5"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{
          paddingBottom: insets.bottom + 150,
          paddingTop: insets.top,
        }}
      >
        <Header />
        <AutoSkeletonView isLoading={loading}>
          <View className="mb-4 rounded-2xl flex-row gap-x-2">
            <AutoSkeletonIgnoreView>
              <Text className="text-xl font-bold text-green-800 mb-1">
                Monthly Budget
              </Text>
            </AutoSkeletonIgnoreView>
            <AutoSkeletonIgnoreView>
              <TouchableOpacity
                disabled={loading}
                onPress={() => setToolTip(!toolTip)}
                className="p-1"
              >
                <Feather name="info" size={18} color="gray" />
              </TouchableOpacity>
            </AutoSkeletonIgnoreView>
          </View>
          <View className="items-center justify-center my-6">
            <PieChart
              donut
              radius={70}
              innerRadius={50}
              data={[
                { value: percentUsed, color: "#10b981" },
                { value: 100 - percentUsed, color: "#E5E7EB" },
              ]}
            />
            <Text className="absolute text-4xl font-bold">
              {usedKWh > 0 ? `${Math.round(percentUsed)}%` : "0%"}
            </Text>
          </View>

          <Text
            className={`text-center font-bold text-xl mb-5 ${
              estimatedCost <= budget ? "text-green-800" : "text-red-700"
            }`}
          >
            {estimatedCost <= budget ? "UNDER BUDGET" : "OVER BUDGET"}
          </Text>

          {budgetKWh > 0 && (
            <View className="flex-row justify-between mb-4">
              <Text className="text-sm text-gray-700">
                Set on:{" "}
                {monthlyBudget?.set_at?.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
              <Text className="text-sm text-gray-700">
                Resets on:{" "}
                {monthlyBudget?.reset_at?.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            </View>
          )}

          <TouchableOpacity
            disabled={loading}
            onPress={() => setModalVisible(true)}
            className="bg-green-700 py-3 rounded-md mb-6"
          >
            <Text className="text-white font-semibold text-center">
              {budgetKWh > 0 ? "Adjust Budget" : "Set Budget"}
            </Text>
          </TouchableOpacity>

          <View className="flex-row justify-between mb-6">
            <View
              style={styles.cardShadow}
              className="flex-1 bg-white px-4 py-3 rounded-xl mr-2"
            >
              <Text className="text-xs text-gray-500">Budget</Text>
              <Text className="text-green-700 font-bold text-lg">
                ₱{budget.toLocaleString()}
              </Text>
              <Text className="text-xs text-gray-400">
                {budgetKWh?.toFixed(1)} kWh
              </Text>
            </View>
            <View
              style={styles.cardShadow}
              className="flex-1 bg-white px-4 py-3 rounded-xl mx-1"
            >
              <Text className="text-xs text-gray-500">Estimated Cost</Text>
              <Text className="text-orange-600 font-bold text-lg">
                ₱{estimatedCost.toFixed(2)}
              </Text>
              <Text className="text-xs text-gray-400">
                {usedKWh?.toFixed(1)} kWh
              </Text>
            </View>
            <View
              style={styles.cardShadow}
              className="flex-1 bg-white px-4 py-3 rounded-xl ml-2"
            >
              <Text className="text-xs text-gray-500">Remaining</Text>
              <Text className="text-blue-700 font-bold text-lg">
                ₱{remaining?.toFixed(2)}
              </Text>
              <Text className="text-xs text-gray-400">
                {remainingKWh?.toFixed(1)} kWh
              </Text>
            </View>
          </View>

          <View
            className="bg-white px-4 py-3 rounded-xl mb-6"
            style={styles.cardShadow}
          >
            <Text className="text-sm text-gray-500 mb-2">
              Last 3 Monthly Rates
            </Text>

            {lastThreeRates.length === 0 ? (
              <Text className="text-gray-400 text-sm">
                No rate history found
              </Text>
            ) : (
              lastThreeRates.map((item, index) => (
                <View key={index} className="flex-row justify-between py-1">
                  <Text className="text-gray-600">
                    {item.year}-{getMonthName(item.month)}
                  </Text>
                  <Text className="text-green-700 font-semibold">
                    ₱{item.rate.toFixed(4)}
                  </Text>
                </View>
              ))
            )}
          </View>

          <View className="bg-white rounded-2xl p-4" style={styles.cardShadow}>
            <View className=" flex-row">
              <MaterialCommunityIcons
                name="lightbulb-on-outline"
                size={20}
                color="#16a34a"
              />
              <Text className="text-xl font-extrabold mb-4">
                Smart Recommendations
              </Text>
            </View>
            {recommendations && recommendations.length > 0 ? (
              <View className="" style={{ maxHeight: 600 }}>
                <AIInsightsCarousel insights={recommendations} from="budget" />
              </View>
            ) : (
              <Text className="text-gray-400">No insights available</Text>
            )}
          </View>
        </AutoSkeletonView>
      </ScrollView>
      <Tooltip
        toolTip={toolTip}
        setToolTip={setToolTip}
        content={`The Energy Budget lets you set a monthly spending goal for electricity.\n WisEnergy estimates your costs based on device data and current rates.`}
        from="Budget"
      />
      <BudgetModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        rate={locationRate}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
});
