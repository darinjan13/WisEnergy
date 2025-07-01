import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import { Text, View, BackHandler, Alert, ScrollView } from "react-native";

import { auth } from "../../../firebase/firebaseConfig";
import ApplianceCard from "../../../components/appliances/ApplianceCard";
import { ActivityIndicator, RadioButton } from "react-native-paper";
import { useDeviceStore, useUsageStore } from "../../../store/firebaseStore";
import Header from "../../../components/ui/Header";
import useApplianceStreams from "../../../hooks/useApplianceStreams";

export default function DeviceDetails() {

    const { devices, userAppliances, setDeviceApplianceName, setApplianceActive, setOnlyOneActive } = useDeviceStore();
    const { latestKwh, fetchLatestKwhOnce } = useUsageStore();

    const userId = auth.currentUser.uid;
    const { deviceId } = useLocalSearchParams();

    const [isLoading, setIsLoading] = useState(false);

    const [appliances, setAppliances] = useState([]);
    const [device, setDevice] = useState([]);

    const [applianceKWh, setApplianceKWh] = useState(0);
    const [appliancePower, setAppliancePower] = useState(0);

    const [selectedAppliance, setSelectedAppliance] = useState("");

    useFocusEffect(
        useCallback(() => {
            BackHandler.addEventListener("hardwareBackPress", onBackPress);
            return () => {
                BackHandler.removeEventListener("hardwareBackPress", onBackPress);
                setAppliancesInActive();
            };
        }, [appliances])
    );

    useApplianceStreams({ appliances, userId, deviceId, setAppliancePower, setApplianceKWh, latestKwh });

    const setAppliancesInActive = () => {
        setAppliances([])
        appliances.forEach(appliance => {
            setApplianceActive(auth.currentUser.uid, deviceId, appliance.name, false);
        });
    }

    useEffect(() => {
        setDevice(devices.find(device => device.id == deviceId));

        if (userAppliances.length > 0) {
            const device = userAppliances.find(device => device.id == deviceId);
            if (device) {
                device.appliances.forEach(appliance => {
                    fetchLatestKwhOnce(auth.currentUser.uid, deviceId, appliance.name);
                })
                setAppliances(device.appliances);
                setIsLoading(false);
            }
        }
    }, [])

    useEffect(() => {
        if (device && device.appliance_name) {
            setOnlyOneActive(auth.currentUser.uid, deviceId, device.appliance_name);
            setSelectedAppliance(device.appliance_name);
        }
    }, [device.appliance_name])

    const onBackPress = () => {
        Alert.alert("Hold on!", "Are you sure you want to go back?", [
            { text: "Cancel", style: "cancel" },
            { text: "Yes", onPress: () => router.back() },
        ]);
        return true;
    };

    const handleSelectedAppliance = async (value) => {
        setIsLoading(true);
        await setDeviceApplianceName(deviceId, value);
        setOnlyOneActive(auth.currentUser.uid, deviceId, value);
        setSelectedAppliance(value);
        setIsLoading(false);
    }

    if (!devices) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#166534" />
                <Text className="text-gray-500 mt-2">Loading Appliances...</Text>
            </View>
        );
    }

    return (
        <View className="p-4">
            <Header />
            <Text className="text-xl font-bold text-[#2E4F4F]">Device: {deviceId}</Text>
            <Text className="text-gray-700 mt-2">Status: {device.status}</Text>
            <Text className="text-gray-700">Paired at: {device.paired_at}</Text>
            <Text className="text-gray-700" >Last updated: asd</Text>
            <ScrollView className="mt-4 p-5 mb-10">
                {(appliances.length > 0 && deviceId != null) && (
                    <View className="mb-40">
                        <RadioButton.Group
                            onValueChange={handleSelectedAppliance}
                            value={selectedAppliance}
                        >
                            {isLoading ? (
                                <View className="flex-1 justify-center items-center mt-20">
                                    <ActivityIndicator size="large" color="#166534" />
                                    <Text className="text-gray-500 mt-2">Switching Appliance...</Text>
                                </View>) : appliances?.map((appliance, index) => (
                                    <ApplianceCard key={index}
                                        power={appliancePower[appliance.name] || 0}
                                        appliance={appliance}
                                        editDevice={() => showEditModal(item)}
                                        resetDevice={() => openConfirmModal(item.id, "reset")}
                                        deleteDevice={() => openConfirmModal(item.id, "delete")}
                                        applianceKWH={latestKwh[appliance.name] || 0}
                                        selectedAppliance={selectedAppliance}
                                        onChange={handleSelectedAppliance} />
                                ))}
                        </RadioButton.Group>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
