import { useCallback, useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import Toast from 'react-native-toast-message';
import { BlurView } from "expo-blur";

import Header from "../../components/ui/Header.jsx";
import { auth, db } from "../../firebase/firebaseConfig.jsx";
import { get, ref, set, update } from "firebase/database";
import ConfirmModal from "../../components/ui/ConfirmModal.jsx";
import { ActivityIndicator } from "react-native-paper";
import { router, useFocusEffect } from "expo-router";
import DropDownPicker from "react-native-dropdown-picker";
import DeviceCard from "../../components/appliances/DeviceCard";

export default function devices() {

    const [deviceCode, setDeviceCode] = useState("");
    const [device_nickname, setDeviceNickname] = useState("");

    const [deviceId, setDeviceId] = useState(null);
    const [action, setAction] = useState(null);
    const [selectedUnpairedDevice, setSelectedUnpairedDevice] = useState(null);

    const [isLoading, setIsLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [dropDownOpen, setDropDownOpen] = useState(false);

    const [unPaired, setUnpairedDevices] = useState([]);
    const [devices, setDevices] = useState([]);

    useFocusEffect(
        useCallback(() => {
            fetchDevices();
            return () => {
                setModalVisible(false);
                setIsLoading(true);
                setUnpairedDevices([]);
                setDevices([]);
                setDeviceCode("");
                setSelectedUnpairedDevice("");
                setDeviceId(null);
                setAction(null);
            };
        }, [])
    )

    const fetchUnpairedDevices = async () => {
        try {
            const devicesRef = ref(db, "devices");
            const snapshot = await get(devicesRef);
            const unpairedDevices = [];
            snapshot.forEach((child) => {
                const deviceData = child.val();
                if (deviceData.status === "unpaired") {
                    unpairedDevices.push(
                        {
                            label: child.key,
                            value: child.key,
                        }
                    );
                }
            });
            setUnpairedDevices(unpairedDevices);
            setIsLoading(false);
        } catch (error) {
            Alert.alert("Error", "Failed to fetch unpaired devices. Please try again.");
        }
    }

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
                        ...deviceData,
                        id: child.key,
                    });
                }
            });
            setDevices(devices);
            setIsLoading(false);
        } catch (error) {
            console.error("Error fetching devices:", error);
            Alert.alert("Error", "Failed to fetch devices. Please try again.");
        }
    };

    const showAddDeviceModal = () => {
        fetchUnpairedDevices();
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
                    child.key === selectedUnpairedDevice.trim() &&
                    deviceData.pairing_code === deviceCode.trim() &&
                    deviceData.status === "unpaired"
                ) {
                    matchedDeviceKey = child.key;
                }
            });

            if (matchedDeviceKey) {
                const today = new Date().toLocaleDateString();

                await update(ref(db, `devices/${matchedDeviceKey}`), {
                    device_nickname: device_nickname,
                    owner: auth.currentUser.uid,
                    status: "paired",
                    paired_at: today,
                }).then(() => {
                    fetchDevices();
                    fetchUnpairedDevices();
                    setDeviceCode("");
                    setSelectedUnpairedDevice("");
                    setDeviceNickname("");
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
        console.log(device);

        setDeviceNickname(device.name);
        setModalVisible(true);
    };

    const handleEditConfirmed = async () => {
        console.log(device_nickname);

        if (!deviceId) return;
        try {
            const deviceRef = ref(db, `devices/${deviceId}`);
            await update(deviceRef, {
                device_nickname: device_nickname,
            });
            await fetchDevices();
            setShowConfirmModal(false);
            setDeviceId(null);
            setDeviceNickname("");
            setAction(null);
            Toast.show({
                type: "success",
                text1: "Success",
                text2: "Device name successfully updated.",
            });
            setModalVisible(false);
        } catch (error) {
            Alert.alert("Error", "Failed to update device name.");
        }
    };

    const openConfirmModal = (deviceId, action) => {
        setAction(action);
        setDeviceId(deviceId);
        setShowConfirmModal(true);
    };

    const handleDeleteConfirmed = async () => {
        console.log(deviceId);

        if (!deviceId) return;

        try {
            const deviceRef = ref(db, `devices/${deviceId}`);
            await update(deviceRef, {
                status: "unpaired",
                owner: "",
                device_nickname: "",
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
                            Loading devices...
                        </Text>
                    </View>
                ) : (
                    <>
                        < View className="flex-row items-center justify-between mb-5">
                            <Text className="text-2xl font-bold text-[#2E4F4F]">Devices</Text>
                            <TouchableOpacity onPress={showAddDeviceModal} className="p-2">
                                <Feather name="plus-circle" size={28} color="#166534" />
                            </TouchableOpacity>
                        </View>
                        {devices.length > 0 ? (
                            <View className="px-5">
                                {devices?.map((device, index) => (
                                    <DeviceCard key={index} onPress={() => router.push(`/appliances/${device.id}`)} deviceData={device} editDevice={() => showEditModal(device.id)} deleteDevice={() => openConfirmModal(device.id, "delete")} />
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
                        <Text className="text-xl font-bold mb-4 text-[#2E4F4F]">{action === "edit" ? "Edit Device" : "Add Device"}</Text>
                        <TextInput
                            placeholder="Enter Device name"
                            value={device_nickname}
                            onChangeText={setDeviceNickname}
                            className="border border-gray-300 rounded-lg p-4 mb-4 bg-gray-50"
                        />
                        {action !== "edit" ? (<>
                            <View className="mb-4">
                                <DropDownPicker
                                    open={dropDownOpen}
                                    value={selectedUnpairedDevice}
                                    items={unPaired}
                                    setOpen={setDropDownOpen}
                                    setValue={setSelectedUnpairedDevice}
                                    setItems={setUnpairedDevices}
                                    placeholder="Select Device"
                                    style={{
                                        borderColor: "#d1d5db",
                                    }}
                                    placeholderStyle={{
                                        color: "#6b7280",
                                    }}
                                    dropDownContainerStyle={{
                                        borderColor: "#d1d5db",
                                    }}
                                    selectedItemLabelStyle={{
                                        color: '#36a25e',
                                    }}
                                />
                            </View>
                            <View className="border border-gray-300 rounded-lg mb-6 px-4 bg-gray-50 flex-row items-center">
                                <TextInput
                                    className="flex-1 py-4 text-base text-gray-800"
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
