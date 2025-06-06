import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default ApplianceCard = ({ power, item, editDevice, resetDevice, deleteDevice, applianceKWH }) => (

    <View style={styles.cardShadow} className="bg-white rounded-xl p-4 mb-10 flex-row items-start space-x-3 overflow-hidden">
        <View className="w-10 h-10 my-auto mx-2 justify-center items-center">
            {item.icon}
        </View>
        <View className="flex-1">
            <Text className="font-semibold text-[#2E4F4F] text-base">{item.name}</Text>
            <Text className="text-xs text-gray-600">
                Added on {item.dates.join(", ")}
            </Text>
            <Text className="text-sm text-[#2E4F4F] mt-1">
                Current Power: <Text className="font-semibold">{power?.toFixed(2)} W | {applianceKWH?.toFixed(2)}KWH</Text>
            </Text>
            <View className="flex-row mt-2">
                <TouchableOpacity onPress={editDevice} style={styles.cardShadow} className="bg-white px-3 py-1 mr-5 rounded border border-gray-300">
                    <Text className="text-sm text-[#2E4F4F] font-medium">Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={resetDevice} style={styles.cardShadow} className="bg-white px-3 py-1 mr-5 rounded border border-gray-300">
                    <Text className="text-sm text-[#2E4F4F] font-medium">Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={deleteDevice} style={styles.cardShadow} className="bg-white px-3 py-1 rounded border border-gray-300">
                    <Text className="text-sm text-[#2E4F4F] font-medium">Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    </View>
);

const styles = StyleSheet.create({
    cardShadow: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 6,

        elevation: 10,
    },
});