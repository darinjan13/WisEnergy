import { View, Text, TouchableOpacity, StatusBar } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function PaymentFailed() {
    const router = useRouter();
    const { plan } = useLocalSearchParams();

    return (
        <SafeAreaProvider>
            <StatusBar barStyle='dark-content' />
            <View className="flex-1 bg-white items-center justify-center px-6">
                <Text className="text-2xl font-bold text-red-600 mb-2">Payment Failed ❌</Text>
                <Text className="text-base text-gray-600 mb-6">
                    Your {plan} plan could not be processed.
                </Text>
                <TouchableOpacity
                    className="bg-gray-800 px-6 py-3 rounded-lg"
                    onPress={() => router.replace("/(tabs)/dashboard")}
                >
                    <Text className="text-white font-semibold text-base">Back to Dashboard</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaProvider>
    );
}
