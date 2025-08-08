import React, { useCallback, useEffect, useState } from "react";
import { View, Text, Modal, TouchableOpacity, TextInput, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PieChart } from 'react-native-gifted-charts';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Header from "../../components/ui/Header";
import { get, ref, set, update } from "firebase/database";
import { db, auth } from "../../firebase/firebaseConfig";
import { useFocusEffect } from "expo-router";
import { ActivityIndicator } from "react-native-paper";
import { BlurView } from "expo-blur";

export default function Budget() {
  const insets = useSafeAreaInsets();

  const [rate, setRate] = useState(0);
  const [budgetInput, setBudgetInput] = useState("");
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [usedKWh, setUsedKWh] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  const estimatedCost = usedKWh * rate;
  const remaining = monthlyBudget - estimatedCost;
  const budgetKWh = monthlyBudget / rate;
  const remainingKWh = budgetKWh - usedKWh;
  const percentUsed = Math.min((estimatedCost / monthlyBudget) * 100, 100);

  useFocusEffect(
    useCallback(() => {
      getUserLocationRate();
      if (rate > 0) {
        getUserMonthlyBudget();
      }
      return () => {
        setModalVisible(false);
        setLoading(true);
      };
    }, [rate])
  )

  const getUserMonthlyBudget = async () => {
    const budgetRef = ref(db, `users/${auth.currentUser.uid}/budget_kwh`);
    const budgetSnapshot = await get(budgetRef);

    const usedKwhRef = ref(db, `users/${auth.currentUser.uid}/total_energy_consumption`);
    const usedKwhSnapshot = await get(usedKwhRef);
    if (budgetSnapshot.exists() && usedKwhSnapshot.exists()) {
      const usedKwh = usedKwhSnapshot.val();
      const budgetKwh = budgetSnapshot.val();
      const formattedBudgetKwh = Math.round(budgetKwh * rate);
      setMonthlyBudget(formattedBudgetKwh);
      setUsedKWh(usedKwh);
      setLoading(false);
    } else {
      setMonthlyBudget(0);
      setUsedKWh(0);
    }
  }

  const getUserLocationRate = async () => {
    const userRef = ref(db, `users/${auth.currentUser.uid}/location`);
    const location = await get(userRef);
    const formattedLocation = location.val().replace(/ /g, "_");
    const rateRef = ref(db, `city/${formattedLocation}/rate`);
    const getRate = await get(rateRef);
    setRate(getRate.val());
  }

  const onClickSetBudget = () => {
    handleSetMonthlyBudget(budgetInput.replace(/,/, ''));
    setBudgetInput("");
    setModalVisible(false);
  }

  const handleSetMonthlyBudget = async (budget) => {

    const budget_kwh = budget / rate;
    const budgetRef = ref(db, `users/${auth.currentUser.uid}`);
    console.log(budget_kwh);

    await update(budgetRef, {
      budget_kwh: budget_kwh.toFixed(1),
    });
    setMonthlyBudget(budget);
  }

  return (
    <View className="bg-gray-100">
      <ScrollView className="p-4" scrollEnabled={loading ? false : true} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        <Header />
        {loading ? (
          <View className="h-screen -mt-36 items-center justify-center">
            <ActivityIndicator size="large" color="#166534" />
            <Text className="text-gray-500 mt-4 text-lg font-semibold">Loading your budget data....</Text>
          </View>
        ) : (
          <View>
            <View style={styles.cardShadow} className="bg-white mb-4 rounded-2xl p-4">
              <Text className="text-2xl font-bold text-[#23403A] mb-1">Monthly Budget</Text>
              <Text className="text-sm text-gray-600">Track and manage your monthly energy usage.</Text>
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
              <Text className="absolute text-3xl font-bold text-[#23403A]">{usedKWh > 0 ? `${Math.round(percentUsed)}%` : "0%"}</Text>
            </View>

            <Text className="text-center font-bold text-[#23403A] text-lg">UNDER BUDGET</Text>
            {usedKWh > 0 ? (
              <Text className="text-center text-md text-gray-600 mb-4">
                You have used <Text className="font-bold text-lg">{usedKWh.toFixed(1)}</Text> kWh this month.
              </Text>
            ) : (
              <Text className="text-center text-sm text-gray-600 mb-4">
                No usage data available yet.
              </Text>
            )
            }
            {
              budgetKWh > 0 && (
                <View className="flex-row justify-between mb-4">
                  <Text className="text-sm text-gray-700">Set on: March 14, 2025</Text>
                  <Text className="text-sm text-gray-700">Resets on: April 14, 2025</Text>
                </View>
              )
            }

            <TouchableOpacity onPress={() => setModalVisible(true)} className="bg-green-700 py-3 rounded-md mb-6">
              <Text className="text-white font-semibold text-center">{budgetKWh > 0 ? "Adjust Budget" : "Set Budget"}</Text>
            </TouchableOpacity>

            <View className="flex-row justify-between mb-6">
              <View style={styles.cardShadow} className="flex-1 bg-white px-4 py-3 rounded-xl mr-2">
                <Text className="text-xs text-gray-500">Budget</Text>
                <Text className="text-green-700 font-bold text-lg">₱{monthlyBudget.toLocaleString()}</Text>
                <Text className="text-xs text-gray-400">{budgetKWh.toFixed(1)} kWh</Text>
              </View>
              <View style={styles.cardShadow} className="flex-1 bg-white px-4 py-3 rounded-xl mx-1">
                <Text className="text-xs text-gray-500">Used</Text>
                <Text className="text-orange-600 font-bold text-lg">₱{estimatedCost.toLocaleString()}</Text>
                <Text className="text-xs text-gray-400">{usedKWh.toFixed(1)} kWh</Text>
              </View>
              <View style={styles.cardShadow} className="flex-1 bg-white px-4 py-3 rounded-xl ml-2">
                <Text className="text-xs text-gray-500">Remaining</Text>
                <Text className="text-blue-700 font-bold text-lg">₱{remaining.toLocaleString()}</Text>
                <Text className="text-xs text-gray-400">{remainingKWh.toFixed(1)} kWh</Text>
              </View>
            </View>

            <View className="bg-white px-4 py-3 rounded-xl mb-6" style={styles.cardShadow}>
              <Text className="text-sm text-gray-500 mb-1">Electricity Rate</Text>
              <View className="flex-row items-center">
                <Text className="text-lg font-semibold text-green-700">₱{rate}/kWh</Text>

              </View>
            </View>

            <View className="bg-white px-4 py-3 rounded-xl flex-row items-start space-x-3" style={styles.cardShadow}>
              <MaterialCommunityIcons name="lightbulb-on-outline" size={24} color="#16a34a" />
              <View className="flex-1">
                <Text className="text-sm text-gray-800 font-semibold mb-1">Smart Tip</Text>
                <Text className="text-sm text-gray-600">
                  Reduce air conditioner usage from 2PM-6PM to stay under budget.
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView >
      <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <BlurView intensity={100} tint="dark" className="flex-1 justify-center items-center">
          <View className="bg-white rounded-xl p-6 w-11/12">
            <Text className="text-lg font-semibold mb-2">Set Monthly Budget</Text>
            <TextInput
              className="border border-gray-300 rounded-md p-2 mb-4"
              placeholder="Enter budget amount"
              keyboardType="numeric"
              value={budgetInput}
              onChangeText={setBudgetInput}
            />
            <TouchableOpacity
              onPress={onClickSetBudget}
              className="bg-green-700 py-3 rounded-md"
            >
              <Text className="text-white font-semibold text-center">Set Budget</Text>
            </TouchableOpacity>
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
    elevation: 4,
  },
});
