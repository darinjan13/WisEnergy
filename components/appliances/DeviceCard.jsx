// import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
// export default function DeviceCard({ onPress, deviceData, editDevice, deleteDevice }) {
//     return (
//         <TouchableOpacity className="bg-white p-4 rounded-xl mb-4 shadow-md" onPress={() => onPress(deviceData)} style={styles.cardShadow}>
//             <View className="flex-1">
//                 <Text className="font-semibold text-[#2E4F4F] text-base">Device ID: {deviceData.id}</Text>
//                 <Text className="font-semibold text-[#2E4F4F] text-base">Device Name: {deviceData.device_nickname}</Text>
//                 <Text className="text-sm text-gray-600">
//                     Added on {deviceData.paired_at}
//                 </Text>
//                 <View className="flex-row mt-2">
//                     <TouchableOpacity onPress={editDevice} style={styles.cardShadow} className="bg-white px-3 py-1 mr-5 rounded border border-gray-300">
//                         <Text className="text-sm text-[#2E4F4F] font-medium">Edit</Text>
//                     </TouchableOpacity>
//                     <TouchableOpacity onPress={deleteDevice} style={styles.cardShadow} className="bg-white px-3 py-1 rounded border border-gray-300">
//                         <Text className="text-sm text-[#2E4F4F] font-medium">Delete</Text>
//                     </TouchableOpacity>
//                 </View>
//             </View>
//         </TouchableOpacity>
//     );
// }

// const styles = StyleSheet.create({
//     cardShadow: {
//         shadowColor: "#000",
//         shadowOffset: { width: 0, height: 10 },
//         shadowOpacity: 0.2,
//         shadowRadius: 6,

//         elevation: 10,
//     },
// });

import { Card, Text, IconButton } from "react-native-paper";
import { View, StyleSheet } from "react-native";

export default function DeviceCard({ onPress, deviceData, editDevice, deleteDevice }) {
    return (
        <Card style={[styles.cardShadow, { marginBottom: 16 }]} onPress={() => onPress(deviceData)}>
            <Card.Title
                title={`Device Name: ${deviceData.device_nickname}`}
                titleStyle={styles.title}
                subtitleStyle={styles.subtitle}
                right={() => (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <IconButton icon="pencil" iconColor="#2E4F4F" onPress={editDevice} />
                        <IconButton icon="delete" iconColor="red" onPress={deleteDevice} />
                    </View>
                )}
            />
            <Card.Content style={styles.cardContent}>
                <Text style={styles.contentText} variant="bodyMedium" >Device ID: {deviceData.id}</Text>
                <Text style={styles.contentText} >Paired on: {deviceData.paired_at}</Text>
            </Card.Content>
        </Card>
    );
}

const styles = StyleSheet.create({
    cardShadow: {
        elevation: 4,
        borderRadius: 12,
        backgroundColor: "white",
    },
    title: {
        fontWeight: "bold",
        color: "#2E4F4F",
    },
    subtitle: {
        color: "gray",
        fontSize: 13,
    },
    cardContent: {
        marginTop: -20
    },
    contentText: {
        color: "#5f5f5f",
    }
});
