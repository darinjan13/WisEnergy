import { View, Text, ScrollView } from "react-native";
import AdminHeader from "../../components/ui/AdminHeader";

export default function Energy() {
    const reports = Array(10).fill({
        id: "XAF09281",
        appliances: 5,
        saved: "560 kWh",
    });

    return (
        <View className="flex-1 bg-white">
            <AdminHeader />
            <Text className="text-2xl font-bold text-gray-800 mt-10 text-center">ENERGY</Text>

            <ScrollView className="mt-4 p-6">
                {reports.map((r, i) => (
                    <View
                        key={i}
                        className="flex-row justify-between py-3 border-b border-gray-200"
                    >
                        <Text className="w-[30%] text-gray-700">{r.id}</Text>
                        <Text className="w-[30%] text-gray-700">{r.appliances}</Text>
                        <Text className="w-[40%] text-gray-700">{r.saved}</Text>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}
