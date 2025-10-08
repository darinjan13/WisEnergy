import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal } from "react-native";
import { BlurView } from "expo-blur";
import { get, ref, serverTimestamp, set, update } from "firebase/database";
import { auth, db } from "../../firebase/firebaseConfig";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function BudgetModal({
    visible,
    onClose,
    rate,
}) {
    const [budgetInput, setBudgetInput] = useState(0);
    const [loading, setLoading] = useState(false);

    const handleSetMonthlyBudget = async () => {
        setLoading(true);
        if (!budgetInput || budgetInput <= 0) {
            alert("Enter a valid budget.");
            setLoading(false)
            return
        }
        try {
            const budget_php = Number(budgetInput);
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, "0");
            const budget_kwh = Number((budget_php / rate).toFixed(2));

            const budgetRef = ref(db, `user_monthly_budget/${auth.currentUser.uid}/${year}/${month}`);
            const snapshot = await get(budgetRef);

            let set_attempted = 0;
            if (snapshot.exists()) {
                set_attempted = snapshot.val().set_attempted || 0;
            }

            if (set_attempted < 3) {
                await set(budgetRef, {
                    budget_php,
                    budget_kwh,
                    rate,
                    set_at: serverTimestamp(),
                    set_attempted: set_attempted + 1,
                });

                // also update the current user’s budget_kwh in /users
                await update(ref(db), {
                    [`users/${auth.currentUser.uid}/budget_kwh`]: budget_kwh,
                });
                setBudgetInput(0)
                onClose();
            } else {
                alert("You have already set your budget 3 times this month.");
                onClose()
            }
        } catch (error) {
            console.error("Error setting budget:", error);
        }
        setLoading(false);
    };

    return (
        <GestureHandlerRootView>
            <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
                <BlurView intensity={100} tint="dark" className="flex-1 justify-center items-center">
                    <View className="bg-white rounded-xl p-6 w-11/12">
                        <Text className="text-lg font-semibold mb-2">Set Monthly Budget</Text>
                        <TextInput
                            className="border border-gray-300 rounded-md p-2 mb-4"
                            placeholder="Enter budget amount"
                            keyboardType="numeric"
                            placeholderTextColor="#9CA3AF"
                            value={budgetInput}
                            onChangeText={setBudgetInput}
                            editable={!loading}
                        />
                        <View className="flex-row justify-center">
                            <TouchableOpacity
                                onPress={handleSetMonthlyBudget}
                                className="bg-green-700 p-5 rounded-md mr-4"
                                disabled={loading}
                            >
                                <Text className="text-white font-semibold text-center">
                                    {loading ? "Setting..." : "Set Budget"}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={onClose}
                                className="bg-green-700 p-5 rounded-md"
                                disabled={loading}
                            >
                                <Text className="text-white font-semibold text-center">
                                    Cancel
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </BlurView>
            </Modal>
        </GestureHandlerRootView>

    );
}