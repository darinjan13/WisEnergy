import { useCallback, useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import Toast from 'react-native-toast-message';
import { BlurView } from "expo-blur";

import Header from "../../components/ui/Header";
import { auth, db } from "../../firebase/firebaseConfig";
import { get, ref, update } from "firebase/database";
import ConfirmModal from "../../components/ui/ConfirmModal";
import ApplianceCard from "../../components/appliances/ApplianceCard.jsx";
import { useApplianceStreams } from "../../hooks/useApplianceStreams.jsx";
import { ActivityIndicator } from "react-native-paper";
import { useFocusEffect } from "expo-router";

export default function appliances() {
    const [deviceName, setDeviceName] = useState("");
    const [deviceCode, setDeviceCode] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [appliance_name, setApplianceName] = useState("");
    const [appliancePower, setAppliancePower] = useState("");
    const [applianceKWH, setApplianceKWH] = useState(0);

    const [isLoading, setIsLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [deviceId, setDeviceId] = useState(null);
    const [action, setAction] = useState(null);

    const [appliancesData, setAppliancesData] = useState([]);

    const [devices, setDevices] = useState([]);

    useFocusEffect(
        useCallback(() => {
            fetchDevices();
            return () => {
                setModalVisible(false);
                setIsLoading(true);
            };
        }, [])
    )

    const fetchDevices = async () => {
        setIsLoading(true);
        try {
            const devicesRef = ref(db, "devices");
            const snapshot = await get(devicesRef);
            const devices = [];
            snapshot.forEach((child) => {
                const deviceData = child.val();
                if (deviceData.owner === auth.currentUser.uid) {
                    devices.push({
                        id: child.key,
                        name: deviceData.appliance_name.replace(/_/g, " "),
                        icon: <MaterialCommunityIcons name="lightning-bolt" size={30} color="black" />,
                        dates: [deviceData.paired_at],
                    });
                }
            });
            setAppliancesData(devices);
            setIsLoading(false);
        } catch (error) {
            console.error("Error fetching devices:", error);
            Alert.alert("Error", "Failed to fetch devices. Please try again.");
        }
    };

    useApplianceStreams(isLoading, appliancesData, auth.currentUser?.uid, setAppliancePower, setApplianceKWH);

    const showAddDeviceModal = () => {
        setModalVisible(true);
    }
    const addDevice = async () => {
        if (!deviceCode.trim()) {
            Alert.alert("Error", "Please enter a device pairing code.");
            return;
        }
        try {
            const devicesRef = ref(db, "devices");
            const snapshot = await get(devicesRef);
            let matchedDeviceKey = null;

            snapshot.forEach((child) => {
                const deviceData = child.val();
                if (
                    child.key === deviceName.trim() &&
                    deviceData.pairing_code === deviceCode.trim() &&
                    deviceData.status === "unpaired"
                ) {
                    matchedDeviceKey = child.key;
                }
            });

            if (matchedDeviceKey) {
                const today = new Date().toLocaleDateString();

                await update(ref(db, `devices/${matchedDeviceKey}`), {
                    owner: auth.currentUser.uid,
                    status: "paired",
                    appliance_name: appliance_name.replace(/[ ]/g, "_"),
                    paired_at: today,
                }).then(() => {
                    fetchDevices();
                    setDeviceCode("");
                    setDeviceName("");
                    setApplianceName("");
                    setModalVisible(false);
                    Toast.show({
                        type: "success",
                        text1: "Success",
                        text2: "Device successfully paired!",
                    });
                });
            } else {
                setModalVisible(false);
                setTimeout(() => {

                    Toast.show({
                        type: "error",
                        text1: "Error",
                        text2: "No matching device found or device is already paired.",
                    });
                }, 1000);
            }
        } catch (error) {
            Alert.alert("Error", "Failed to add device. Please try again.");
        }
    };
    const showEditModal = (device) => {
        setAction("edit");
        setDeviceId(device.id);
        setApplianceName(device.name);
        setModalVisible(true);
    };

    const handleEditConfirmed = async () => {

        if (!deviceId) return;
        try {
            const deviceRef = ref(db, `devices/${deviceId}`);
            await update(deviceRef, {
                appliance_name: appliance_name.replace(/[ ]/g, "_"),
            });
            await fetchDevices();
            setShowConfirmModal(false);
            setDeviceId(null);
            setApplianceName("");
            setAction(null);
            Toast.show({
                type: "success",
                text1: "Success",
                text2: "Device name successfully updated.",
            });
            setModalVisible(false);
        } catch (error) {
            console.error("Error updating device name:", error);
            Alert.alert("Error", "Failed to update device name.");
        }
    };

    const openConfirmModal = (deviceId, action) => {
        setAction(action);
        setDeviceId(deviceId);
        setShowConfirmModal(true);
    };

    const handleDeleteConfirmed = async () => {
        if (!deviceId) return;

        try {
            const deviceRef = ref(db, `devices/${deviceId}`);
            await update(deviceRef, {
                status: "unpaired",
                owner: "",
                appliance_name: "",
                paired_at: null,
            })
                .then(() => {
                    fetchDevices();
                    setShowConfirmModal(false);
                    setDeviceId(null);

                    Toast.show({
                        type: "success",
                        text1: "Deleted",
                        text2: "Device successfully unpaired.",
                    });
                });

        } catch (error) {
            console.error("Error unpairing device:", error);
            Alert.alert("Error", "Failed to unpair device.");
        }
    };
    const handleResetConfirmed = async () => {
        if (!deviceId) return;
        console.log("Resetting device with ID:", deviceId);

    }

    return (
        <View className="bg-gray-100">
            <ScrollView className=" p-4">
                <Header />
                {isLoading ? (
                    <View className="h-screen -mt-36 items-center justify-center">
                        <ActivityIndicator size="large" color="#166534" />
                        <Text className="text-gray-500 mt-4 text-lg font-semibold">
                            Loading appliances...
                        </Text>
                    </View>
                ) : (
                    <>
                        < View className="flex-row items-center justify-between mb-5">
                            <Text className="text-2xl font-bold text-[#2E4F4F]">Appliances</Text>
                            <TouchableOpacity onPress={showAddDeviceModal} className="p-2">
                                <Feather name="plus-circle" size={28} color="#166534" />
                            </TouchableOpacity>
                        </View>
                        {appliancesData.length > 0 ? (
                            <View className="px-5">
                                {appliancesData.map((item, index) => (
                                    <ApplianceCard key={index} power={appliancePower[item.name] || 0} item={item} editDevice={() => showEditModal(item)} resetDevice={() => openConfirmModal(item.id, "reset")} deleteDevice={() => openConfirmModal(item.id, "delete")} applianceKWH={applianceKWH[item.name] || 0} />
                                ))}
                            </View>
                        ) : (
                            <View className="flex-1 justify-center items-center">
                                <MaterialCommunityIcons name="lightning-bolt-outline" size={64} color="#9CA3AF" />
                                <Text className="text-gray-500 mt-4 text-lg font-semibold">
                                    No appliances added yet
                                </Text>
                                <Text className="text-gray-400 mt-1 text-sm">
                                    Tap the plus icon to add one
                                </Text>
                            </View>
                        )
                        }
                    </>)}
            </ScrollView >
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <BlurView intensity={100} tint="dark" className="flex-1 justify-center items-center">
                    <View className="bg-white rounded-xl p-6 w-11/12">
                        <Text className="text-xl font-bold mb-4 text-[#2E4F4F]">{action === "edit" ? "Edit Appliance" : "Add Device"}</Text>
                        <TextInput
                            placeholder="Enter Appliance name"
                            value={appliance_name}
                            onChangeText={setApplianceName}
                            className="border border-gray-300 rounded-lg px-4 py-2 mb-6 bg-gray-50"
                        />
                        {action !== "edit" ? (<>
                            <TextInput
                                placeholder="Enter Device name"
                                value={deviceName}
                                onChangeText={setDeviceName}
                                className="border border-gray-300 rounded-lg px-4 py-2 mb-6 bg-gray-50"
                            />
                            <View className="border border-gray-300 rounded-lg mb-6 px-4 bg-gray-50 flex-row items-center">
                                <TextInput
                                    className="flex-1 py-2 text-base text-gray-800"
                                    placeholder="Enter Device password"
                                    secureTextEntry={!showPassword}
                                    value={deviceCode}
                                    onChangeText={setDeviceCode}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Feather
                                        name={showPassword ? "eye-off" : "eye"}
                                        size={20}
                                        color="gray"
                                    />
                                </TouchableOpacity>
                            </View></>
                        ) : null}

                        <View className="flex-row justify-end">
                            <TouchableOpacity
                                className="px-4 py-2 bg-gray-300 rounded-lg mr-4"
                                onPress={() => { setModalVisible(false); setAction(null) }}
                            >
                                <Text className="text-gray-700 font-semibold">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="px-4 py-2 bg-green-700 rounded-lg"
                                onPress={() => {
                                    if (action === "edit") {
                                        handleEditConfirmed();
                                    } else {
                                        addDevice();
                                    }
                                }}>
                                <Text className="text-white font-semibold">{action === "edit" ? "Confirm" : "Add"}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </BlurView>
            </Modal>
            <ConfirmModal visible={showConfirmModal} onCancel={() => {
                setShowConfirmModal(false);
                setDeviceId(null);
            }} onConfirm={action === "delete" ? handleDeleteConfirmed : handleResetConfirmed} action={action} />
        </View >
    );
}
