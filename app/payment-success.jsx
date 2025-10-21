import { View, Text, TouchableOpacity, StatusBar } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function PaymentSuccess() {
    const router = useRouter();
    const { plan } = useLocalSearchParams();

    return (
        <SafeAreaProvider>
            <StatusBar barStyle='dark-content' />
            <View className="flex-1 h-full bg-white items-center justify-center px-6">
                <Text className="text-2xl font-bold text-green-700 mb-2">Payment Successful 🎉</Text>
                <Text className="text-base text-gray-600 mb-6">
                    Your {plan} plan is now active.
                </Text>
                <TouchableOpacity
                    className="bg-green-600 px-6 py-3 rounded-lg"
                    onPress={() => router.replace("/(tabs)/dashboard")}
                >
                    <Text className="text-white font-semibold text-base">Go to Dashboard</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaProvider>
    );
}
