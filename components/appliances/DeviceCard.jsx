import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
export default function DeviceCard({ onPress, deviceData, editDevice, deleteDevice }) {
    return (
        <TouchableOpacity className="bg-white p-4 rounded-xl mb-4 shadow-md" onPress={() => onPress(deviceData)} style={styles.cardShadow}>
            <View className="flex-1">
                <Text className="font-semibold text-[#2E4F4F] text-base">Device ID: {deviceData?.id}</Text>
                <Text className="font-semibold text-[#2E4F4F] text-base">Device Name: {deviceData?.device_nickname}</Text>
                <Text className="text-sm text-gray-600">
                    Added on {deviceData?.paired_at}
                </Text>
                <View className="flex-row mt-2">
                    <TouchableOpacity onPress={editDevice} style={styles.cardShadow} className="bg-white px-3 py-1 mr-5 rounded border border-gray-300">
                        <Text className="text-sm text-[#2E4F4F] font-medium">Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={deleteDevice} style={styles.cardShadow} className="bg-white px-3 py-1 rounded border border-gray-300">
                        <Text className="text-sm text-[#2E4F4F] font-medium">Delete</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    cardShadow: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 6,

        elevation: 10,
    },
});