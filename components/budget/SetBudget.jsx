import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal, ActivityIndicator, Alert } from "react-native";
import { BlurView } from "expo-blur";
import { get, ref, serverTimestamp, set, update } from "firebase/database";
import { auth, db } from "../../firebase/firebaseConfig";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";

export default function BudgetModal({ visible, onClose, rate }) {
  const [budgetInput, setBudgetInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSetMonthlyBudget = async () => {
    setLoading(true);
    setErrorMsg("");

    // 🧠 VALIDATION BLOCK
    const trimmedInput = budgetInput.trim();
    const numericValue = Number(trimmedInput);

    if (
      trimmedInput === "" ||              // empty input
      isNaN(numericValue) ||             // not a number
      numericValue <= 0                  // zero or negative
    ) {
      setErrorMsg("Please enter a valid budget amount.");
      setLoading(false);
      return;
    }

    try {
      const budget_php = numericValue;
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const budget_kwh = Number((budget_php / rate).toFixed(2));

      const budgetRef = ref(db, `user_monthly_budget/${auth.currentUser.uid}/${year}/${month}`);
      const snapshot = await get(budgetRef);

      let set_attempted = snapshot.exists() ? snapshot.val().set_attempted || 0 : 0;

      if (set_attempted < 3) {
        await set(budgetRef, {
          budget_php,
          budget_kwh,
          rate,
          set_at: serverTimestamp(),
          set_attempted: set_attempted + 1,
        });

        await update(ref(db), {
          [`users/${auth.currentUser.uid}/budget_kwh`]: budget_kwh,
        });

        Toast.show({
          type: "success",
          text1: "Setting budget.",
          text2: " Successful setting budget!"
        })
        setBudgetInput("");
        onClose();
      } else {
        setErrorMsg("You have already set your budget 3 times this month.");
      }
    } catch (error) {
      console.error("Error setting budget:", error);
      setErrorMsg("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <GestureHandlerRootView>
      <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
        <BlurView intensity={100} tint="dark" className="flex-1 justify-center items-center px-6">
          <View className="bg-white rounded-2xl w-full max-w-md p-6 shadow-lg">
            <Text className="text-2xl font-bold text-center text-[#14532d] mb-2">
              Set Monthly Budget
            </Text>
            <Text className="text-gray-500 text-center mb-6 text-sm">
              Enter your monthly energy budget to track and optimize usage.
            </Text>

            <View className="flex-row items-center border border-gray-300 rounded-lg px-3 mb-3">
              <Text className="text-gray-500 text-lg mr-1">₱</Text>
              <TextInput
                className="flex-1 text-lg py-3"
                placeholder="Enter amount"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={budgetInput}
                onChangeText={setBudgetInput}
                editable={!loading}
              />
            </View>

            {errorMsg ? (
              <Text className="text-red-500 text-center text-sm mb-3">{errorMsg}</Text>
            ) : null}

            <View className="flex-row justify-between mt-2">
              <TouchableOpacity
                onPress={onClose}
                disabled={loading}
                className="flex-1 py-3 rounded-lg bg-gray-300 mr-2 items-center"
              >
                <Text className="text-gray-800 font-semibold text-base">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                testID="set-budget"
                onPress={handleSetMonthlyBudget}
                disabled={loading}
                className={`flex-1 py-3 rounded-lg items-center ${loading ? "bg-green-400" : "bg-green-700"
                  }`}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-semibold text-base">Set Budget</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </Modal>
    </GestureHandlerRootView>
  );
}
