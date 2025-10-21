import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { Picker } from "@react-native-picker/picker";

// Static mock data (moved outside to stabilize useEffect deps)
const userDevices = [
    { id: "device1", device_nickname: "Device 1" },
    { id: "device2", device_nickname: "Device 2" },
];

const userAppliances = [
    { id: "device1", appliances: [{ applianceName: "Appliance 1", latestKwh: 5 }] },
    { id: "device2", appliances: [{ applianceName: "Appliance 2", latestKwh: 3 }] },
];

export default function TemporaryReports() {
    const [selectedDevice, setSelectedDevice] = useState("All Devices");
    const [deviceData, setDeviceData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Simulate fetching and processing device/appliance data (now stable deps)
    useEffect(() => {
        setLoading(true);
        const mappedData = userDevices.map((device) => {
            const match = userAppliances.find((a) => a.id === device.id);
            return {
                device_id: device.id,
                device_nickname: device.device_nickname,
                appliances: match ? match.appliances : [],
            };
        });
        setDeviceData(mappedData);
        setLoading(false);
    }, []); // Empty deps: data is static, no recreation

    // Handle device selection
    const handleDeviceChange = (deviceId) => {
        setSelectedDevice(deviceId);
    };

    // For "All Devices", aggregate all appliances
    const consolidatedData =
        selectedDevice === "All Devices"
            ? deviceData.flatMap((data) => data.appliances)
            : deviceData.find((data) => data.device_id === selectedDevice)?.appliances || [];

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" testID="activity-indicator" />
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={{ padding: 20 }}>
            <Text>Select Device</Text>
            <Picker
                testID="device-picker"
                selectedValue={selectedDevice}
                onValueChange={handleDeviceChange}
                style={{ height: 50, width: 200 }}
            >
                <Picker.Item label="All Devices" value="All Devices" />
                {deviceData.map((device) => (
                    <Picker.Item
                        key={device.device_id}
                        label={device.device_nickname}
                        value={device.device_id}
                    />
                ))}
            </Picker>

            {consolidatedData.length > 0 ? (
                <View style={{ marginTop: 20 }}>
                    <Text>Consolidated Energy Report</Text>
                    {consolidatedData.map((appliance, index) => (
                        <View key={index} style={{ marginTop: 10 }}>
                            <Text>{appliance.applianceName}</Text>
                            <Text>Energy Consumption: {appliance.latestKwh} kWh</Text>
                        </View>
                    ))}
                </View>
            ) : (
                <View style={{ marginTop: 20 }}>
                    <Text>No appliance data available.</Text>
                </View>
            )}
        </View>
    );
}