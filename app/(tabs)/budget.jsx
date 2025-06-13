import React, { useCallback, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PieChart } from 'react-native-gifted-charts';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Header from "../../components/ui/Header";
import { get, ref } from "firebase/database";
import { db, auth } from "../../firebase/firebaseConfig";
import { useFocusEffect } from "expo-router";

export default function Budget() {
  const insets = useSafeAreaInsets();

  const [rate, setRate] = useState(12);

  const monthlyBudget = 3000;
  const usedKWh = 187.5;
  const estimatedCost = usedKWh * rate;
  const remaining = monthlyBudget - estimatedCost;
  const budgetKWh = monthlyBudget / rate;
  const remainingKWh = budgetKWh - usedKWh;
  const percentUsed = Math.min((estimatedCost / monthlyBudget) * 100, 100);

  useFocusEffect(
    useCallback(() => {
      getUserLocationRate();
    }, [])
  )

  const getUserLocationRate = async () => {
    
    const userRef = ref(db, `users/${auth.currentUser.uid}/location`);
    const location = await get(userRef);
    const formattedLocation = location.val().replace(/ /g, "_"); 
    console.log(formattedLocation);
    const rateRef = ref(db, `city/${formattedLocation}`);
    console.log(rateRef);
    const getRate = await get(rateRef);
    console.log(getRate.val());
    
    
    setRate(getRate.val());
  }

  return (
    <ScrollView className="bg-gray-100 p-4" contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
      <Header />

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
        <Text className="absolute text-3xl font-bold text-[#23403A]">{Math.round(percentUsed)}%</Text>
      </View>

      <Text className="text-center font-bold text-[#23403A] text-lg">UNDER BUDGET</Text>
      <Text className="text-center text-gray-600 mb-6">You've used {Math.round(percentUsed)}% of your ₱{monthlyBudget.toLocaleString()} budget.</Text>

      <View className="flex-row justify-between mb-4">
        <Text className="text-sm text-gray-700">Set on: March 14, 2025</Text>
        <Text className="text-sm text-gray-700">Resets on: April 14, 2025</Text>
      </View>

      <TouchableOpacity className="bg-green-700 py-3 rounded-md mb-6">
        <Text className="text-white font-semibold text-center">Adjust Budget</Text>
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

      {/* Smart Tips */}
      <View className="bg-white px-4 py-3 rounded-xl flex-row items-start space-x-3" style={styles.cardShadow}>
        <MaterialCommunityIcons name="lightbulb-on-outline" size={24} color="#16a34a" />
        <View className="flex-1">
          <Text className="text-sm text-gray-800 font-semibold mb-1">Smart Tip</Text>
          <Text className="text-sm text-gray-600">
            Reduce air conditioner usage from 2PM-6PM to stay under budget.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
});
