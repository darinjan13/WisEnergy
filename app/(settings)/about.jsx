import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AboutWisEnergy() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    return (
        <View className="flex-1 bg-white p-10" style={{ paddingTop: insets.top + 10 }}>
            {/* Header */}
            <TouchableOpacity
                onPress={() => router.back()}
                className="w-10 -ml-5"
            >
                <Feather name='arrow-left' size={30} color="#095333" />
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Logo */}
                <View className="items-center mb-2">
                    <Image
                        source={require("../../assets/images/About_Logo.png")} // replace with your actual logo path
                        className="h-20"
                        resizeMode="center"
                    />
                </View>

                {/* Description */}
                <Text className="text-gray-700 mb-4 leading-6">
                    WisEnergy is your all-in-one smart energy management companion designed to
                    help households in <Text className="font-semibold">Mandaue City</Text> and{" "}
                    <Text className="font-semibold">Lapu-Lapu City</Text> monitor, manage, and
                    optimize their electricity usage in real-time.
                </Text>
                <Text className="text-gray-700 mb-4 leading-6">
                    Powered by IoT technology and AI-driven insights, WisEnergy detects
                    appliance-level energy consumption, forecasts your bills, suggests
                    energy-saving tips, and helps you stay within your monthly budget — all from
                    your smartphone.
                </Text>

                {/* Key Features */}
                <Text className="text-lg font-bold text-[#23403A] mb-2">Key Features:</Text>
                {[
                    "Real-Time Monitoring: Track live energy usage per appliance.",
                    "AI-Powered Analysis: Detect inefficiencies and get smart recommendations to save more.",
                    "Monthly Budgeting: Set your budget and estimate bills based on actual consumption.",
                    "Energy Usage Forecasting: Predict your electricity trends using Facebook’s Prophet model.",
                    "Smart Alerts: Get notified when you exceed your energy budget or when an appliance consumes unusually high energy.",
                    "Detailed Reports: View historical data to better understand and manage your household’s consumption patterns.",
                ].map((item, index) => (
                    <Text key={index} className="text-gray-700 mb-2 ml-4">• {item}</Text>
                ))}

                {/* Why Choose */}
                <Text className="text-lg font-bold text-[#23403A] mt-4 mb-2">
                    Why Choose WisEnergy?
                </Text>
                {[
                    "Reduce electricity bills effortlessly.",
                    "Get AI-generated, actionable energy-saving tips.",
                    "Make smarter choices with real-time and forecasted insights.",
                    "Empower your household toward sustainable living.",
                ].map((item, index) => (
                    <Text key={index} className="text-gray-700 mb-2 ml-4">• {item}</Text>
                ))}

                {/* Designed For */}
                <Text className="text-lg font-bold text-[#23403A] mt-4 mb-2">Designed For</Text>
                {[
                    "Households in Mandaue City and Lapu-Lapu City",
                    "Budget-conscious families",
                    "Environmentally-aware consumers aiming for greener living",
                ].map((item, index) => (
                    <Text key={index} className="text-gray-700 mb-2 ml-4">• {item}</Text>
                ))}
            </ScrollView>
        </View>
    );
}
