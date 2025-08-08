import { Card, Text, IconButton } from "react-native-paper";
import { View, StyleSheet } from "react-native";

export default function DeviceCard({ disabled, onPress, deviceData, editDevice, deleteDevice }) {
    return (
        <Card style={[styles.cardShadow, { marginBottom: 16 }]} onPress={() => onPress(deviceData)} disabled={disabled}>
            <Card.Title
                title={`Device Name: ${deviceData.device_nickname}`}
                titleStyle={styles.title}
                subtitleStyle={styles.subtitle}
                right={() => (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <IconButton disabled={deviceData.status === "unpaired"} icon="pencil" iconColor="#2E4F4F" onPress={editDevice} />
                        <IconButton disabled={deviceData.status === "unpaired"} icon="delete" iconColor="red" onPress={deleteDevice} />
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
