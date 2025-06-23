import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import { Text, View, BackHandler, Alert, ScrollView } from "react-native";

import { ref, get, update, onValue } from "firebase/database";
import { auth, db } from "../../../firebase/firebaseConfig";
import { useApplianceStreams } from "../../../hooks/useApplianceStreams";
import ApplianceCard from "../../../components/appliances/ApplianceCard";
import { ActivityIndicator, RadioButton } from "react-native-paper";
import Header from "../../../components/ui/Header";

export default function DeviceDetails() {

    const userId = auth.currentUser.uid;
    const { deviceId } = useLocalSearchParams();

    const [isLoading, setIsLoading] = useState(true);

    const [deviceData, setDeviceData] = useState(null);
    const [appliances, setAppliances] = useState([]);
    const [applianceKWh, setApplianceKWh] = useState(0);
    const [appliancePower, setAppliancePower] = useState(0);

    const [selectedAppliance, setSelectedAppliance] = useState("");

    useFocusEffect(
        useCallback(() => {
            fetchDeviceData();
            fetchAppliances();
            BackHandler.addEventListener("hardwareBackPress", onBackPress);
            return () => {
                BackHandler.removeEventListener("hardwareBackPress", onBackPress)
                setDeviceData(null);
            }
        }, [])
    );

    useEffect(() => {
        setIsLoading(false);
    }, [appliances]);

    useEffect(() => {
        fetchSelectedAppliance();
    }, [selectedAppliance])

    const fetchSelectedAppliance = async () => {
        const deviceRef = ref(db, `devices/${deviceId}`);

        onValue(deviceRef, (snapshot) => {

            if (snapshot.exists()) {
                if (snapshot.val()) {
                    setSelectedAppliance(snapshot.val().appliance_name || "");

                }
            }
        });
    };

    const onBackPress = () => {
        Alert.alert("Hold on!", "Are you sure you want to go back?", [
            { text: "Cancel", style: "cancel" },
            { text: "Yes", onPress: () => router.back() },
        ]);
        return true;
    };

    const fetchDeviceData = async () => {
        const snapshot = await get(ref(db, `devices/${deviceId}`));
        if (snapshot.exists()) {
            setDeviceData(snapshot.val());
            setIsLoading(false);
        }
    };

    const fetchAppliances = async () => {
        setIsLoading(true);
        const snapshot = await get(ref(db, `usage/${userId}/${deviceId}`));
        const appliances = [];
        if (snapshot.exists()) {
            snapshot.forEach((applianceSnap) => {
                const dateKeys = [];
                applianceSnap.forEach((dateSnap) => {
                    dateKeys.push(dateSnap.key);
                })
                const sortedDateKeys = dateKeys.sort();
                appliances.push({
                    ...applianceSnap.val(),
                    name: applianceSnap.key,
                    added_at: sortedDateKeys[0],
                })
            })
        }
        setAppliances(appliances);
        setIsLoading(false);
    }
    useApplianceStreams(isLoading, deviceId, appliances, userId, setAppliancePower, setApplianceKWh);


    const handleSelectedAppliance = async (value) => {
        console.log(value);

        const deviceRef = ref(db, `devices/${deviceId}`);

        await update(deviceRef, {
            appliance_name: value,
        }).then(() => {
            setSelectedAppliance(value);
        }).catch((error) => {
            console.error("Error updating appliance:", error);
        });
    }

    if (!deviceData) {
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
            <Text className="text-gray-700 mt-2">Status: {deviceData.status}</Text>
            <Text className="text-gray-700">Paired at: {deviceData.paired_at}</Text>
            <ScrollView className="mt-4 p-5">
                {appliances.length > 0 && deviceId != null ? (
                    <View className="mb-40">
                        <RadioButton.Group
                            onValueChange={newValue => handleSelectedAppliance(newValue)}
                            value={selectedAppliance}
                        >
                            {appliances?.map((appliance, index) => (
                                <ApplianceCard key={index}
                                    power={appliancePower[appliance.name] || 0}
                                    appliance={appliance}
                                    editDevice={() => showEditModal(item)}
                                    resetDevice={() => openConfirmModal(item.id, "reset")}
                                    deleteDevice={() => openConfirmModal(item.id, "delete")}
                                    applianceKWH={applianceKWh[appliance.name] || 0}
                                    selectedAppliance={selectedAppliance}
                                    onChange={setSelectedAppliance} />
                            ))}
                        </RadioButton.Group>
                    </View>
                ) : (
                    <Text className="text-gray-500 mt-2">No appliances found for this device.</Text>
                )}
            </ScrollView>
        </View>
    );
}
