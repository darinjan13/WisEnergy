import React, { useCallback, useEffect, useState } from "react";
import { View, Text, Modal, TouchableOpacity, TextInput, ScrollView, StyleSheet, TouchableWithoutFeedback, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PieChart } from 'react-native-gifted-charts';
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import Header from "../../components/ui/Header";
import { get, ref, serverTimestamp, set, update } from "firebase/database";
import { db, auth } from "../../firebase/firebaseConfig";
import { useFocusEffect } from "expo-router";
import { ActivityIndicator } from "react-native-paper";
import { BlurView } from "expo-blur";
import { useAiGeneratedStore, useBudgetStore, useUsageStore } from "../../store/firebaseStore";
import BudgetModal from "../../components/budget/SetBudget";
import AIInsightsCarousel from "../../components/ai/Messages";
import Tooltip from "../../components/ui/Tooltip";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function Budget() {
  const insets = useSafeAreaInsets();
  const { recommendations } = useAiGeneratedStore();
  const { locationRate, fetchLocationRate, monthlyBudget, percentUsed } = useBudgetStore();
  const { monthlyTotalConsumption } = useUsageStore();

  const [rate, setRate] = useState(0);
  const [budget, setBudget] = useState(0);
  const [usedKWh, setUsedKWh] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toolTip, setToolTip] = useState(false);


  const estimatedCost = usedKWh * rate;
  const remaining = budget - estimatedCost;
  const budgetKWh = budget / rate;
  const remainingKWh = budgetKWh - usedKWh;

  useFocusEffect(
    useCallback(() => {
      if (locationRate == 0) {
        fetchLocationRate(auth.currentUser.uid);
      }
      return () => {
        setModalVisible(false);
        setToolTip(false)
      };
    }, [])
  )

  useEffect(() => {
    if (monthlyBudget?.budget_php > 0) {
      setBudget(monthlyBudget?.budget_php || 0);
      setLoading(false);
    } else {
      setModalVisible(true)
    }
  }, [monthlyBudget]);

  useEffect(() => {
    if (monthlyTotalConsumption > 0) {
      setUsedKWh(monthlyTotalConsumption)
    }
  }, [monthlyTotalConsumption]);

  useEffect(() => {
    if (locationRate > 0) {
      setRate(locationRate)
    }
  }, [locationRate])
  return (
    <GestureHandlerRootView>
      <Pressable className="bg-gray-100" onPress={toolTip ? () => setToolTip(false) : undefined}>
        <ScrollView className="p-5" contentContainerStyle={{ paddingBottom: insets.bottom + 150, paddingTop: insets.top }}>
          <Header />
          {loading ? (
            <View className="h-screen -mt-36 items-center justify-center">
              <ActivityIndicator size="large" color="#166534" />
              <Text className="text-gray-500 mt-4 text-lg font-semibold">Loading your budget data....</Text>
            </View>
          ) : (
            <View>
              <View className="mb-4 rounded-2xl p-4 flex-row gap-x-2">
                <Text className="text-3xl font-extrabold text-green-700 mb-1">Monthly Budget</Text>
                <TouchableOpacity
                  onPress={() => setToolTip(!toolTip)}
                  className="p-1"
                >
                  <Feather name="info" size={18} color="gray" />
                </TouchableOpacity>
                <Tooltip toolTip={toolTip} setToolTip content={`The Energy Budget lets you set a monthly spending goal for electricity.\n WisEnergy estimates your costs based on device data and current rates.`} />

              </View>

              <View className="items-center justify-center my-6">
                <PieChart
                  donut
                  radius={70}
                  innerRadius={50}
                  data={[
                    { value: percentUsed, color: '#10b981' },
                    { value: 100 - percentUsed, color: '#E5E7EB' },
                  ]}
                />
                <Text className="absolute text-4xl font-bold">{usedKWh > 0 ? `${Math.round(percentUsed)}%` : "0%"}</Text>
              </View>

              <Text className="text-center font-bold text-green-800 text-2xl mb-5">UNDER BUDGET</Text>
              {
                budgetKWh > 0 && (
                  <View className="flex-row justify-between mb-4">
                    <Text className="text-sm text-gray-700">Set on: {monthlyBudget?.set_at?.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}</Text>
                    <Text className="text-sm text-gray-700">Resets on: {monthlyBudget?.reset_at?.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}</Text>
                  </View>
                )
              }

              <TouchableOpacity onPress={() => setModalVisible(true)} className="bg-green-700 py-3 rounded-md mb-6">
                <Text className="text-white font-semibold text-center">{budgetKWh > 0 ? "Adjust Budget" : "Set Budget"}</Text>
              </TouchableOpacity>

              <View className="flex-row justify-between mb-6">
                <View style={styles.cardShadow} className="flex-1 bg-white px-4 py-3 rounded-xl mr-2">
                  <Text className="text-xs text-gray-500">Budget</Text>
                  <Text className="text-green-700 font-bold text-lg">₱{budget.toLocaleString()}</Text>
                  <Text className="text-xs text-gray-400">{budgetKWh.toFixed(1)} kWh</Text>
                </View>
                <View style={styles.cardShadow} className="flex-1 bg-white px-4 py-3 rounded-xl mx-1">
                  <Text className="text-xs text-gray-500">Estimated Cost</Text>
                  <Text className="text-orange-600 font-bold text-lg">₱{estimatedCost.toFixed(2)}</Text>
                  <Text className="text-xs text-gray-400">{usedKWh.toFixed(1)} kWh</Text>
                </View>
                <View style={styles.cardShadow} className="flex-1 bg-white px-4 py-3 rounded-xl ml-2">
                  <Text className="text-xs text-gray-500">Remaining</Text>
                  <Text className="text-blue-700 font-bold text-lg">₱{remaining.toFixed(2)}</Text>
                  <Text className="text-xs text-gray-400">{remainingKWh.toFixed(1)} kWh</Text>
                </View>
              </View>

              <View className="bg-white px-4 py-3 rounded-xl mb-6" style={styles.cardShadow}>
                <Text className="text-sm text-gray-500 mb-1">Electricity Rate</Text>
                <View className="flex-row items-center">
                  <Text className="text-lg font-semibold text-green-700">₱{rate}/kWh</Text>

                </View>
              </View>

              <View className="bg-white p-4 rounded-xl flex-row" style={styles.cardShadow}>
                <MaterialCommunityIcons name="lightbulb-on-outline" size={20} color="#16a34a" />
                <View className="flex">
                  <Text className="text-2xl font-extrabold mb-4">Smart Recommendations</Text>
                  {recommendations && recommendations.length > 0 ? (
                    <View style={{ maxHeight: 200 }}>
                      <AIInsightsCarousel insights={recommendations} from="budget" />
                    </View>
                  ) : (
                    <Text className="text-gray-400">No insights available</Text>
                  )}
                </View>
              </View>
            </View>
          )}
        </ScrollView >
        <BudgetModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          rate={locationRate}
        />
      </Pressable>
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
