import { View, Text, ScrollView } from "react-native";
import AdminHeader from "../../components/ui/AdminHeader";

export default function Feedback() {
    const feedbacks = Array(8).fill({
        id: "XAF09281",
        message: "The app is very helpful for saving energy costs.",
        rating: 5,
    });

    return (
        <View className="flex-1 bg-white">
            <AdminHeader />
            <Text className="text-2xl font-bold text-gray-800 mt-10 text-center">FEEDBACK</Text>

            <ScrollView className="mt-4 p-6">
                {feedbacks.map((f, i) => (
                    <View
                        key={i}
                        className="flex-row justify-between py-3 border-b border-gray-200"
                    >
                        <Text className="w-[20%] text-gray-700">{f.id}</Text>
                        <Text className="w-[60%] text-gray-700">{f.message}</Text>
                        <Text className="w-[20%] text-yellow-500">
                            {"★".repeat(f.rating)}
                        </Text>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}
