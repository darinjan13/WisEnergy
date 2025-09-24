import { useCallback, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from "react-native";
import { router, useFocusEffect } from "expo-router";
import Toast from 'react-native-toast-message';
import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
import { ActivityIndicator, IconButton } from "react-native-paper";

import ConfirmModal from "../../components/ui/ConfirmModal.jsx";
import DeviceCard from "../../components/appliances/DeviceCard";
import Header from "../../components/ui/Header.jsx";
import { useDeviceStore } from "../../store/firebaseStore.js";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";

export default function devices() {
    const insets = useSafeAreaInsets();

    const { devices, setDevices, userDevices, unpairedDevices, addDevice, userAppliances, updateDeviceNickname, deleteDevice } = useDeviceStore();

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
    const [disableDevice, setDisableDevice] = useState(false);

    useFocusEffect(
        useCallback(() => {
            if (devices.length === 0) setDevices();
            // if (userAppliances.length === 0) fetchUserAppliances();
            const timeout = setTimeout(() => {
                if (devices.length > 0 && userAppliances.length > 0) {
                    setIsLoading(false);
                }
            }, 250);
            setIsLoading(false);
            return () => {
                clearTimeout(timeout)
                setIsLoading(true)
                setDisableDevice(false)
            };

        }, [devices.length, userAppliances.length])
    );

    const showAddDeviceModal = () => {
        setModalVisible(true);
    }
    const handleAddDevice = async () => {
        setIsLoading(true);
        try {
            setModalVisible(false);
            const addDeviceStatus = await addDevice(deviceCode, selectedUnpairedDevice, device_nickname);
            if (addDeviceStatus && addDeviceStatus.success) {
                Toast.show({
                    type: "success",
                    text1: "Success",
                    text2: "Device successfully paired!",
                });
                setDeviceCode("");
                setDeviceNickname("");
                setSelectedUnpairedDevice("");
                setAction(null);
            } else {
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: addDeviceStatus?.error || "Failed to add device.",
                });
            }
        } catch (error) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "An unexpected error occurred. Please try again.",
            });
            console.error("Error in handleAddDevice:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const showEditModal = (device) => {
        setAction("edit");
        setDeviceId(device.id);

        setDeviceNickname(device.device_nickname);
        setModalVisible(true);
    };

    const handleEditConfirmed = async () => {
        if (!deviceId) return;
        try {
            setIsLoading(true);
            setModalVisible(false);
            await updateDeviceNickname(deviceId, device_nickname);
            Toast.show({
                type: "success",
                text1: "Success",
                text2: "Device name successfully updated.",
            });
            setDeviceId(null);
            setDeviceNickname("");
            setAction(null);
        } catch (error) {
            Alert.alert("Error", "Failed to update device name.");
        } finally {
            setIsLoading(false);
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
            setIsLoading(true);
            setShowConfirmModal(false);
            await deleteDevice(deviceId);
            Toast.show({
                type: "success",
                text1: "Deleted",
                text2: "Device successfully unpaired.",
            });
            setDeviceId(null);
            setSelectedUnpairedDevice("");
        } catch (error) {
            Alert.alert("Error", "Failed to unpair device.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDecivcePressed = (userDevice) => {
        setDisableDevice(true);
        router.push(`/appliances/${userDevice.id}`)
    }

    return (
        <View className="bg-gray-100">
            <ScrollView className="p-4" showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 150 }}>
                <Header />
                {isLoading || disableDevice ? (
                    <View className="h-screen -mt-36 items-center justify-center">
                        <ActivityIndicator size="large" color="#166534" />
                        <Text className="text-gray-500 mt-4 text-lg font-semibold">
                            Loading devices...
                        </Text>
                    </View>
                ) : (
                    <>
                        < View className="flex-row items-center justify-between mb-10">
                            <Text className="text-2xl font-bold text-[#2E4F4F]">Devices</Text>
                            <TouchableOpacity className=" rounded-3xl bg-white items-center justify-center">
                                <Feather className="p-1" onPress={showAddDeviceModal} name="plus" size={20} color="#2E4F4F" />

                            </TouchableOpacity>
                        </View>
                        {userDevices.length > 0 ? (
                            <View>
                                {userDevices.map((userDevice, index) => (
                                    <DeviceCard key={index} disabled={disableDevice} onPress={() => handleDecivcePressed(userDevice)} deviceData={userDevice} editDevice={() => showEditModal(userDevice)} deleteDevice={() => openConfirmModal(userDevice.id, "delete")} />
                                ))}
                            </View>
                        ) : (
                            <View className="flex-1 justify-center items-center">
                                <IconButton icon="lightning-bolt-outline" size={64} iconColor="#9CA3AF" />
                                <Text className="text-gray-500 mt-4 text-lg font-semibold">
                                    No devices added yet
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
                            editable={!isLoading}
                            placeholder="Enter Device name"
                            value={device_nickname}
                            onChangeText={setDeviceNickname}
                            className="border border-gray-300 rounded-lg p-4 mb-4 bg-gray-50"
                        />
                        {action !== "edit" ? (<>
                            <View className="border border-gray-300 rounded-xl mb-4 overflow-hidden">
                                <Picker
                                    selectedValue={selectedUnpairedDevice}
                                    onValueChange={(itemValue) => setSelectedUnpairedDevice(itemValue)}
                                >
                                    <Picker.Item label="Select Device" value={null} />
                                    {unpairedDevices.map((device, idx) => (
                                        <Picker.Item
                                            key={idx}
                                            label={device.label || device.name || `Device ${idx + 1}`}
                                            value={device.value || device.id || device}
                                        />
                                    ))}
                                </Picker>

                            </View>
                            <View className="border border-gray-300 rounded-lg mb-6 bg-gray-50 flex-row items-center">
                                <TextInput
                                    editable={!isLoading}
                                    className="flex-1 p-4 text-base text-gray-800"
                                    placeholder="Enter Device password"
                                    secureTextEntry={!showPassword}
                                    value={deviceCode}
                                    onChangeText={setDeviceCode}
                                />
                                <IconButton className="" onPress={() => setShowPassword(!showPassword)} icon={showPassword ? "eye-off" : "eye-outline"} iconColor="gray" />

                            </View></>
                        ) : null}

                        <View className="flex-row justify-end">
                            <TouchableOpacity
                                className="px-4 py-2 bg-gray-300 rounded-lg mr-4"
                                onPress={() => { setModalVisible(false); setAction(null); setDeviceNickname(""); setSelectedUnpairedDevice(""); setDeviceCode(""); }}
                            >
                                <Text className="text-gray-700 font-semibold">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                disabled={isLoading}
                                className="px-4 py-2 bg-green-700 rounded-lg"
                                onPress={() => {
                                    if (action === "edit") {
                                        handleEditConfirmed();
                                    } else {
                                        handleAddDevice();
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
            }} onConfirm={handleDeleteConfirmed} action={action} />
        </View >
    );
}
