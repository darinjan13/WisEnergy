import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { auth } from "@/firebase/firebaseConfig";
import { api } from "@/services/apiService.js"; // 👈 your axios instance file

export default function PremiumPlans() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [isLoading, setIsLoading] = useState(false);
    const [qrModal, setQrModal] = useState({
        visible: false,
        image: "",
        label: "",
        amount: 0,
        id: "",
    })
    const plans = [
        {
            title: "Monthly",
            price: "₱249 / month",
            amount: 20,
            description: "WisEnergy Monthly Plan",
            features: [
                "Unlimited number of devices",
                "Daily, weekly and monthly reports",
                "No ads",
                "Full forecasting",
                "Smart recommendations every 4 hours",
            ],
        },
        {
            title: "Yearly",
            price: "₱2,499 / year",
            amount: 20,
            description: "WisEnergy Yearly Plan",
            features: [
                "Includes all Premium features —",
                "save ₱489 with annual billing.",
            ],
        },
    ];

    useEffect(() => {
        let interval;

        if (qrModal.visible && qrModal.id) {
            // Start polling every 10s
            interval = setInterval(async () => {
                try {
                    const res = await api.get(`/check-payment-status/${qrModal.id}`);
                    const { status, payment_id, amount } = res.data;

                    console.log("QR Status:", status);

                    if (status === "paid") {
                        clearInterval(interval);

                        alert(`✅ Payment Successful! Ref: ${payment_id}`);

                        // Mark user as premium in Firebase
                        await update(ref(db, `users/${auth.currentUser.uid}`), {
                            is_premium: true,
                            premium_payment_id: payment_id,
                            premium_amount: amount,
                            premium_date: new Date().toISOString(),
                        });

                        setQrModal({ visible: false });
                    }
                } catch (err) {
                    console.error("Polling Error:", err.message);
                }
            }, 10000);
        }

        // Cleanup when modal closes or component unmounts
        return () => clearInterval(interval);
    }, [qrModal.visible, qrModal.id]);


    // ---------- Payment ----------
    const handleSubscribe = async (plan) => {
        setIsLoading(true);
        try {
            const email = auth.currentUser?.email ?? "user@wisenergy.app";
            const payload = {
                amount: plan.amount,
                description: plan.description,
                email,
                payment_method: "qrph",
            };

            const res = await api.post("/create-payment-intent", payload);
            const qrData = res.data?.data?.attributes?.next_action.code;
            if (qrData?.image_url) {
                setQrModal({
                    visible: true,
                    image: qrData.image_url,
                    label: qrData.label,
                    amount: qrData.amount / 100,
                    id: qrData.id,
                });
                setIsLoading(false);
            } else {
                alert("QRPH payment data not found.");
            }

            // if (redirectUrl) {
            //     const result = await WebBrowser.openBrowserAsync(redirectUrl);
            //     if (result.type === "cancel") console.log("Checkout closed manually.");
            // } else {
            //     alert("Unable to start payment.");
            // }
        } catch (err) {
            console.error("Payment Error:", err.message);
            alert("Something went wrong. Please try again later.");
        }
    };

    // ---------- UI ----------
    return (
        <ScrollView
            className="flex-1 bg-white px-6"
            contentContainerStyle={{
                paddingTop: insets.top + 10,
                paddingBottom: insets.bottom + 40,
            }}
        >
            {/* Header */}
            <View className="flex-row items-center mb-6">
                <TouchableOpacity onPress={() => router.back()} className="mr-3">
                    <Feather name="arrow-left" size={28} color="#23403A" />
                </TouchableOpacity>
                <Text className="text-2xl font-bold text-[#23403A]">Premium Plans</Text>
            </View>

            {plans.map((plan, index) => (
                <View key={index} className="rounded-xl mb-6 overflow-hidden shadow-md">
                    <LinearGradient
                        colors={["#166534", "#16a34a"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="p-6"
                    >
                        <View className="flex-row justify-between items-start mb-3">
                            <View>
                                <Text className="text-white text-lg font-bold">{plan.title}</Text>
                                <Text className="text-white text-xl font-extrabold mt-1">
                                    {plan.price}
                                </Text>
                            </View>
                            <FontAwesome5 name="gem" size={22} color="#FDE047" />
                        </View>

                        <View className="mt-2 mb-4">
                            {plan.features.map((f, i) => (
                                <View key={i} className="flex-row items-start mb-2">
                                    <Feather
                                        name="check"
                                        size={16}
                                        color="#BBF7D0"
                                        style={{ marginTop: 3 }}
                                    />
                                    <Text
                                        className={`ml-2 text-white text-sm ${f.includes("save") ? "text-[#FDE047] font-semibold" : ""
                                            }`}
                                    >
                                        {f}
                                    </Text>
                                </View>
                            ))}
                        </View>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            disabled={isLoading}
                            className={`${isLoading ? "bg-gray-300" : "bg-white"} rounded-full px-6 py-2 self-end`}
                            onPress={() => handleSubscribe(plan)}
                        >
                            <Text className="text-[#047857] font-semibold text-sm">
                                Subscribe
                            </Text>
                        </TouchableOpacity>
                    </LinearGradient>
                </View>
            ))}
            {qrModal.visible && (
                <Modal visible={qrModal.visible} transparent animationType="slide">
                    <View className="flex-1 bg-black/50 justify-center items-center">
                        <View className="bg-white rounded-xl p-5 w-80">
                            <Text className="text-lg font-bold text-center mb-2">Scan to Pay (QRPH)</Text>
                            <Text className="text-center text-gray-500 mb-4">
                                {qrModal.label} — ₱249.00
                            </Text>
                            <Image
                                source={{ uri: qrModal.image }}
                                style={{ width: 250, height: 250, alignSelf: "center" }}
                                resizeMode="contain"
                            />
                            <TouchableOpacity
                                onPress={() => setQrModal({ visible: false })}
                                className="mt-5 bg-red-700 py-2 rounded-md"
                            >
                                <Text className="text-white text-center font-semibold">Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>)}

        </ScrollView>
    );
}
