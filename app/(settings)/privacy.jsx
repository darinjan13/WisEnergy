import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Privacy from "../../components/ui/Privacy";

export default function PrivacyPolicy() {
    const router = useRouter();

    return (
        <View className="flex-1 bg-white p-6">
            {/* Header */}
            <Privacy />
        </View>
    );
}
