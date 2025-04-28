import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, TextInput, Alert } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import Toast from 'react-native-toast-message';
import { BlurView } from "expo-blur";

import Header from "../../components/ui/Header";
import { auth, db } from "../../firebase/firebaseConfig";
import { get, off, onValue, ref, update } from "firebase/database";
import ConfirmModal from "../../components/ui/ConfirmModal";



const ApplianceCard = ({ item, resetDevice, deleteDevice }) => (

    <View style={styles.cardShadow} className="bg-white rounded-xl p-4 mb-10 flex-row items-start space-x-3 overflow-hidden">
        <View className="w-10 h-10 my-auto mx-2 justify-center items-center">
            {item.icon}
        </View>
        <View className="flex-1">
            <Text className="font-semibold text-[#2E4F4F] text-base">{item.name}</Text>
            <Text className="text-xs text-gray-600">
                Added on {item.dates.join(", ")}
            </Text>
            <View className="flex-row mt-2">
                <TouchableOpacity style={styles.cardShadow} className="bg-white px-3 py-1 mr-5 rounded border border-gray-300">
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

export default function appliances() {
    const [deviceName, setDeviceName] = useState("");
    const [deviceCode, setDeviceCode] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [applianceName, setApplianceName] = useState("");

    const [modalVisible, setModalVisible] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [deviceId, setDeviceId] = useState(null);
    const [action, setAction] = useState(null);

    const [appliancesData, setAppliancesData] = useState([]);

    useEffect(() => {
        const devicesRef = ref(db, "devices");

        const unsubscribe = onValue(devicesRef, (snapshot) => {
            const devices = [];
            snapshot.forEach((child) => {
                const deviceData = child.val();
                if (deviceData.owner === auth.currentUser.uid) {
                    devices.push({
                        id: deviceData.deviceID,
                        name: deviceData.applianceName,
                        icon: <MaterialCommunityIcons name="lightning-bolt" size={30} color="black" />,
                        dates: [deviceData.dateAdded],
                    });
                }
            });
            setAppliancesData(devices);
        });

        return () => off(devicesRef);
    }, []);

    const fetchDevices = async () => {
        try {
            const devicesRef = ref(db, "devices");
            const snapshot = await get(devicesRef);
            const devices = [];
            snapshot.forEach((child) => {
                const deviceData = child.val();
                if (deviceData.owner === auth.currentUser.uid) {
                    devices.push({
                        id: deviceData.deviceID,
                        name: deviceData.applianceName,
                        icon: <MaterialCommunityIcons name="lightning-bolt" size={30} color="black" />,
                        dates: [deviceData.dateAdded],
                    });
                }
            });
            setAppliancesData(devices);
        } catch (error) {
            console.error("Error fetching devices:", error);
            Alert.alert("Error", "Failed to fetch devices. Please try again.");
        }
    };

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
                const deviceKey = child.key;
                const deviceData = child.val();

                if (
                    deviceData.deviceID === deviceName.trim() &&
                    deviceData.pairingCode === deviceCode.trim() &&
                    deviceData.status === "unpaired"
                ) {
                    matchedDeviceKey = deviceKey;
                }
            });

            if (matchedDeviceKey) {
                const today = new Date().toLocaleDateString();
                await update(ref(db, `devices/${matchedDeviceKey}`), {
                    owner: auth.currentUser.uid,
                    status: "paired",
                    applianceName: applianceName,
                    dateAdded: today,
                });
                await fetchDevices();

                Toast.show({
                    type: "success",
                    text1: "Success",
                    text2: "Device successfully paired!",
                });
                setDeviceCode("");
                setDeviceName("");
                setApplianceName("");
                setModalVisible(false);
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
                owner: null,
                applianceName: null,
                dateAdded: null,
            });
            await fetchDevices();
            setShowConfirmModal(false);
            setDeviceId(null);

            Toast.show({
                type: "success",
                text1: "Deleted",
                text2: "Device successfully unpaired.",
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
        <View className="flex-1 bg-gray-100 p-4">
            <ScrollView className="" showsVerticalScrollIndicator={false}>
                <Header />
                <View className="flex-row items-center justify-between mb-5">
                    <Text className="text-2xl font-bold text-[#2E4F4F]">Appliances</Text>
                    <TouchableOpacity onPress={showAddDeviceModal} className="p-2">
                        <Feather name="plus-circle" size={28} color="#166534" />
                    </TouchableOpacity>
                </View>

                {appliancesData.length > 0 ? (
                    <View className="px-5">
                        {appliancesData.map((item, index) => (
                            <ApplianceCard key={index} item={item} resetDevice={() => openConfirmModal(item.id, "reset")} deleteDevice={() => openConfirmModal(item.id, "delete")} />

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
                )}
            </ScrollView >
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <BlurView intensity={100} tint="dark" className="flex-1 justify-center items-center">
                    <View className="bg-white rounded-xl p-6 w-11/12">
                        <Text className="text-xl font-bold mb-4 text-[#2E4F4F]">Add Appliance</Text>
                        <TextInput
                            placeholder="Enter Appliance name"
                            value={applianceName}
                            onChangeText={setApplianceName}
                            className="border border-gray-300 rounded-lg px-4 py-2 mb-6 bg-gray-50"
                        /><TextInput
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
                        </View>
                        <View className="flex-row justify-end">
                            <TouchableOpacity
                                className="px-4 py-2 bg-gray-300 rounded-lg mr-4"
                                onPress={() => setModalVisible(false)}
                            >
                                <Text className="text-gray-700 font-semibold">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="px-4 py-2 bg-green-700 rounded-lg"
                                onPress={addDevice}
                            >
                                <Text className="text-white font-semibold">Add</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </BlurView>
            </Modal>
            <ConfirmModal visible={showConfirmModal} onCancel={() => {
                setShowConfirmModal(false);
                setDeviceId(null);
            }} onConfirm={action === "delete" ? handleDeleteConfirmed : handleResetConfirmed} action={action} />
        </View>
    );
}
