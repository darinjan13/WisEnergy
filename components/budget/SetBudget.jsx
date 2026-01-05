import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal, ActivityIndicator } from "react-native";
import { BlurView } from "expo-blur";
import { get, ref, set, update } from "firebase/database";
import { auth, db } from "../../firebase/firebaseConfig";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";

export default function BudgetModal({
  visible,
  onClose,
  rate,
  showPrompt = false,
  currentBudgetPhp = 0,
  required = false, // ✅ new
}) {
  const [budgetInput, setBudgetInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const mustSet = required

  useEffect(() => {
    if (visible) {
      setErrorMsg("");
      setBudgetInput(currentBudgetPhp > 0 ? String(currentBudgetPhp) : "");
    }
  }, [visible, currentBudgetPhp]);

  const handleSetMonthlyBudget = async () => {
    setLoading(true);
    setErrorMsg("");

    const trimmedInput = budgetInput.trim();
    const numericValue = Number(trimmedInput);

    if (trimmedInput === "" || Number.isNaN(numericValue) || numericValue <= 0) {
      setErrorMsg("Please enter a valid budget amount.");
      setLoading(false);
      return;
    }

    try {
      const budget_php = numericValue;

      const now = new Date();
      now.setDate(1);
      now.setHours(0, 0, 0, 0);

      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");

      const safeRate = Number(rate);
      if (!Number.isFinite(safeRate) || safeRate <= 0) {
        setErrorMsg("Rate is not available yet. Please try again.");
        setLoading(false);
        return;
      }

      const budget_kwh = Number((budget_php / safeRate).toFixed(2));

      const budgetRef = ref(db, `user_monthly_budget/${auth.currentUser.uid}/${year}/${month}`);
      const snapshot = await get(budgetRef);
      const set_attempted = snapshot.exists() ? snapshot.val().set_attempted || 0 : 0;

      if (set_attempted < 3) {
        await set(budgetRef, {
          budget_php,
          budget_kwh,
          rate: safeRate,
          set_at: new Date(year, Number(month) - 1, 1).toISOString(),
          set_attempted: set_attempted + 1,
        });

        await update(ref(db), {
          [`users/${auth.currentUser.uid}/budget_kwh`]: budget_kwh,
        });

        Toast.show({
          type: "success",
          text1: "Budget set.",
          text2: "You can change it anytime later.",
        });

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

  const title = currentBudgetPhp > 0 ? "Adjust Monthly Budget" : "Set Monthly Budget";

  return (
    <GestureHandlerRootView>
      <Modal
        animationType="fade"
        transparent
        visible={visible}
        onRequestClose={mustSet ? undefined : onClose}
      >
        <BlurView intensity={100} tint="dark" className="flex-1 justify-center items-center px-6">
          <View className="bg-white rounded-2xl w-full max-w-md p-6 shadow-lg">
            <Text className="text-2xl font-bold text-center text-[#14532d] mb-2">
              {title}
            </Text>

            {showPrompt && currentBudgetPhp <= 0 ? (
              <Text className="text-gray-600 text-center mb-4 text-sm">
                This is required to estimate your bill and track progress. You can change it anytime later.
              </Text>
            ) : (
              <Text className="text-gray-500 text-center mb-6 text-sm">
                Enter your monthly energy budget to track and optimize usage.
              </Text>
            )}

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
              {!mustSet && (
                <TouchableOpacity
                  onPress={onClose}
                  disabled={loading}
                  className="flex-1 py-3 rounded-lg bg-gray-300 mr-2 items-center"
                >
                  <Text className="text-gray-800 font-semibold text-base">Not now</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                testID="set-budget"
                onPress={handleSetMonthlyBudget}
                disabled={loading}
                className={`py-3 rounded-lg items-center ${loading ? "bg-green-400" : "bg-green-700"} ${mustSet ? "flex-1" : "flex-1"
                  }`}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-semibold text-base">
                    {currentBudgetPhp > 0 ? "Update" : "Set Budget"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </Modal>
    </GestureHandlerRootView>
  );
}
