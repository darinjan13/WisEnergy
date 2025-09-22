import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Privacy from "../../components/ui/Privacy";

export default function PrivacyPolicy() {
    const router = useRouter();

    return (
        <View className="flex-1 bg-white p-6">
            {/* Header */}
            <View className="flex-row items-center mb-6">
                <TouchableOpacity onPress={() => router.back()}>
                    <Feather name="arrow-left" size={24} color="#23403A" />
                </TouchableOpacity>
                <Text className="ml-3 text-2xl font-bold text-[#23403A]">
                    Privacy Policy
                </Text>
            </View>

            <Privacy />
        </View>
    );
}
