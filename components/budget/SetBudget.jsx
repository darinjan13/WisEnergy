import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal } from "react-native";
import { BlurView } from "expo-blur";
import { ref, serverTimestamp, set, update } from "firebase/database";
import { auth, db } from "../../firebase/firebaseConfig";

export default function BudgetModal({
    visible,
    onClose,
    rate,
}) {
    const [budgetInput, setBudgetInput] = useState(0);
    const [loading, setLoading] = useState(false);

    const handleSetMonthlyBudget = async () => {
        setLoading(true);
        try {
            const budget_php = Number(budgetInput);
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, "0");
            const budget_kwh = Number((budget_php / rate).toFixed(2));

            const budgetRef = ref(db, `user_monthly_budget/${auth.currentUser.uid}/${year}/${month}`);
            await set(budgetRef, {
                budget_php,
                budget_kwh,
                rate,
                set_at: serverTimestamp(),
            });

            await update(ref(db), {
                [`users/${auth.currentUser.uid}/budget_kwh`]: budget_kwh,
            });
            onClose();
        } catch (error) {
            console.error("Error setting budget:", error);
        }
        setLoading(false);
    };
    return (
        <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
            <BlurView intensity={100} tint="dark" className="flex-1 justify-center items-center">
                <View className="bg-white rounded-xl p-6 w-11/12">
                    <Text className="text-lg font-semibold mb-2">Set Monthly Budget</Text>
                    <TextInput
                        className="border border-gray-300 rounded-md p-2 mb-4"
                        placeholder="Enter budget amount"
                        keyboardType="numeric"
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
    );
}