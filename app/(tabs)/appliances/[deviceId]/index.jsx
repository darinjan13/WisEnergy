import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import { Text, View, BackHandler, Alert, ScrollView, Modal, TextInput, TouchableOpacity } from "react-native";

import { auth, db } from "@/firebase/firebaseConfig"
import ApplianceCard from "@/components/appliances/ApplianceCard";
import { ActivityIndicator, RadioButton } from "react-native-paper";
import { useDeviceStore, useUsageStore } from "@/store/firebaseStore";
import Header from "@/components/ui/Header";
import useApplianceStreams from "@/hooks/useApplianceStreams";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { BlurView } from "expo-blur";
import { get, ref, remove, set, update } from "firebase/database";
import Toast from "react-native-toast-message";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AddApplianceModal from "@/components/appliances/AddApplianceModal";
import { format } from "date-fns-tz";

export default function DeviceDetails() {
    const insets = useSafeAreaInsets();
    const { devices, userAppliances, setDeviceApplianceName, setApplianceActive, setOnlyOneActive } = useDeviceStore();
    const { latestKwh, fetchLatestKwhOnce } = useUsageStore();

    const userId = auth?.currentUser.uid;
    const { deviceId } = useLocalSearchParams();

    const [isLoading, setIsLoading] = useState(false);
    const [action, setAction] = useState(null);
    const [applianceId, setApplianceId] = useState(null);
    const [applianceNickname, setApplianceNickname] = useState("");
    const [device, setDevice] = useState(null);

    const [applianceKWh, setApplianceKWh] = useState(0);
    const [appliancePower, setAppliancePower] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [addModal, setAddModal] = useState(false);

    const [selectedAppliance, setSelectedAppliance] = useState("");

    // derive appliances directly from store
    const deviceAppliances =
        userAppliances.find(d => d.id === deviceId)?.appliances || [];

    // keep device info in syncz
    useEffect(() => {
        const d = devices.find(d => d.id == deviceId);
        setDevice(d);
    }, [devices, deviceId]);

    useFocusEffect(
        useCallback(() => {
            const backHandler = BackHandler.addEventListener("hardwareBackPress", onBackPress);
            return () => {
                backHandler.remove();
                setAppliancesInActive();
            };
        }, [deviceAppliances])
    );

    useApplianceStreams({
        appliances: deviceAppliances,
        userId,
        deviceId,
        setAppliancePower,
        setApplianceKWh,
        latestKwh
    });

    const setAppliancesInActive = () => {
        deviceAppliances.forEach(appliance => {
            setApplianceActive(auth.currentUser.uid, deviceId, appliance.name, false);
        });
    };

    useEffect(() => {
        if (device && device.appliance_name) {
            setOnlyOneActive(auth.currentUser.uid, deviceId, device.appliance_name);
            setSelectedAppliance(device.appliance_name);
        }
    }, [device?.appliance_name]);

    const onBackPress = () => {
        router.back()
        return true;
    };

    const handleSelectedAppliance = async (value) => {
        setIsLoading(true);
        await setDeviceApplianceName(deviceId, value);
        setOnlyOneActive(auth.currentUser.uid, deviceId, value);
        setSelectedAppliance(value);
        setIsLoading(false);
    };

    const openConfirmModal = (applianceId, action) => {
        setAction(action);
        setApplianceId(applianceId);
        setShowConfirmModal(true);
    };

    const showEditModal = (appliance) => {
        setAction("edit");
        setApplianceId(appliance.name);
        setApplianceNickname(appliance.nickname);
        setModalVisible(true);
    };

    const handleDeleteConfirmed = async () => {
        const applianceRef = ref(db, `appliances/${userId}/${deviceId}/${applianceId}`)

        await remove(applianceRef)
        setShowConfirmModal(false)
    };

    const showAddModal = () => {
        setAddModal(true);
    };

    const onAdd = async ({ appliance_name, appliance_nickname }) => {
        const today = format(new Date(), "yyyy-MM-dd", { timeZone: "Asia/Manila" });
        let newApplianceName = appliance_name;
        let appliancesRef = ref(db, `appliances/${userId}/${deviceId}/${newApplianceName}`);

        let snapshot = await get(appliancesRef);
        let counter = 1;

        while (snapshot.exists()) {
            newApplianceName = `${appliance_name}_${counter}`;
            appliancesRef = ref(db, `appliances/${userId}/${deviceId}/${newApplianceName}`);
            snapshot = await get(appliancesRef);
            counter++;
        }

        // save with unique name
        await set(appliancesRef, {
            appliance_nickname,
            added_at: today,
            is_active: false,
        });
    };


    const handleEditConfirmed = async () => {
        try {
            setIsLoading(true);

            const userId = auth.currentUser?.uid;
            const newName = applianceNickname.trim();

            if (userId && applianceId && newName) {
                const appliancesRef = ref(db, `appliances/${userId}/${deviceId}/${applianceId}`);

                await update(appliancesRef, { appliance_nickname: newName });

                Toast.show({
                    type: "success",
                    text1: "Success",
                    text2: `Appliance nickname updated to "${newName}".`,
                });
            }

            setApplianceId("");
            setAction(null);
        } catch (error) {
            console.error("Rename failed", error);
            Alert.alert("Error", "Failed to update appliance name.");
        } finally {
            setIsLoading(false);
            setModalVisible(false);
        }
    };


    if (!device) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#166534" />
                <Text className="text-gray-500 mt-2">Loading Appliances...</Text>
            </View>
        );
    }

    return (
        <View className="px-4" style={{ paddingTop: insets.top }}>
            <Header />

            <Text className="text-xl font-bold text-[#2E4F4F]">Device: {deviceId}</Text>
            <Text className="text-gray-700 mt-2">Status: {device.status}</Text>
            <Text className="text-gray-700">Paired at: {device.paired_at}</Text>
            <Text className="text-gray-700">Last updated: asd</Text>

            <View className="flex-row items-center justify-between mt-10 mb-5">
                <Text className="text-2xl font-bold text-[#2E4F4F]">Appliances</Text>
                <TouchableOpacity onPress={showAddModal} className="rounded-3xl bg-white items-center justify-center">
                    <Feather className="p-1" name="plus" size={20} color="#136B1E" />
                </TouchableOpacity>
            </View>

            <ScrollView showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 150 }}>
                {deviceAppliances.length > 0 && (
                    <View className="mb-40">
                        <RadioButton.Group
                            onValueChange={handleSelectedAppliance}
                            value={selectedAppliance}
                        >
                            {isLoading ? (
                                <View className="flex-1 justify-center items-center mt-20">
                                    <ActivityIndicator size="large" color="#166534" />
                                    <Text className="text-gray-500 mt-2">Switching Appliance...</Text>
                                </View>
                            ) : (
                                deviceAppliances.map((appliance, index) => (
                                    <ApplianceCard
                                        key={index}
                                        power={appliancePower[appliance.name] || 0}
                                        appliance={appliance}
                                        applianceKWH={latestKwh[appliance.name] || 0}
                                        onEdit={() => showEditModal(appliance)}
                                        onDelete={() => openConfirmModal(appliance.name, "delete")}
                                        selectedAppliance={selectedAppliance}
                                        onChange={handleSelectedAppliance}
                                    />
                                ))
                            )}
                        </RadioButton.Group>
                    </View>
                )}
            </ScrollView>

            <AddApplianceModal visible={addModal} onClose={() => setAddModal(false)} onAdd={onAdd} />

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <BlurView intensity={100} tint="dark" className="flex-1 justify-center items-center">
                    <View className="bg-white rounded-xl p-6 w-11/12">
                        <Text className="text-xl font-bold mb-4 text-[#2E4F4F]">
                            {action === "edit" ? "Edit Appliance" : "Add Appliance"}
                        </Text>
                        <TextInput
                            editable={!isLoading}
                            placeholder="Enter Appliance name"
                            value={applianceNickname}
                            onChangeText={setApplianceNickname}
                            className="border border-gray-300 rounded-lg p-4 mb-4 bg-gray-50"
                        />

                        <View className="flex-row justify-end">
                            <TouchableOpacity
                                className="px-4 py-2 bg-gray-300 rounded-lg mr-4"
                                onPress={() => { setModalVisible(false); setAction(null); setApplianceId(""); setApplianceNickname("") }}
                            >
                                <Text className="text-gray-700 font-semibold">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                disabled={isLoading}
                                className="px-4 py-2 bg-green-700 rounded-lg"
                                onPress={() => {
                                    if (action === "edit") {
                                        handleEditConfirmed();
                                    }
                                }}
                            >
                                <Text className="text-white font-semibold">
                                    {action === "edit" ? "Confirm" : "Add"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </BlurView>
            </Modal>

            <ConfirmModal
                visible={showConfirmModal}
                onCancel={() => {
                    setShowConfirmModal(false);
                    setApplianceName(null);
                }}
                onConfirm={handleDeleteConfirmed}
                action={action}
            />
        </View>
    );
}
