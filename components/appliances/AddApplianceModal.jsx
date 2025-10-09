import { Modal, View, Text, TextInput, TouchableOpacity, useColorScheme } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useState } from "react";

export default function AddApplianceModal({ visible, onClose, onAdd }) {
    const scheme = useColorScheme();
    const isDark = scheme === "dark";
    const [selectedAppliance, setSelectedAppliance] = useState("Refrigerator");
    const [nickname, setNickname] = useState("");

    const appliances = [
        "Fridge", "Refrigerator", "Freezer", "Air Conditioner", "Washing Machine", "Clothes Dryer",
        "Rice Cooker", "Electric Fan", "Microwave Oven", "Induction Cooker",
        "Blender", "Electric Kettle", "Toaster", "Coffee Maker", "Water Dispenser",
        "Television", "Desktop Computer", "Laptop", "Wi-Fi Router", "Speaker System",
        "Electric Iron", "Hair Dryer", "Vacuum Cleaner", "Humidifier", "Water Pump", "LED Light"
    ];

    const handleAdd = () => {
        onAdd({
            appliance_name: selectedAppliance.replace(' ', "_"),
            appliance_nickname: nickname.trim() || selectedAppliance,
        });

        onClose();
        setNickname(""); // reset after submit
        setSelectedAppliance("Refrigerator");
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View className="flex-1 bg-black/50 justify-center items-center">
                <View className="bg-white w-11/12 rounded-2xl p-6">
                    <Text className="text-xl font-bold mb-4 text-center">Add Appliance</Text>

                    {/* Dropdown */}
                    <Text className="text-gray-700 mb-2">Select Appliance</Text>
                    <View className="border border-gray-300 rounded-xl mb-4 overflow-hidden">
                        <Picker
                            dropdownIconColor={isDark ? "#000" : "#000"}
                            style={{
                                color: "#000",
                                backgroundColor: "#fff",
                            }}
                            itemStyle={{
                                color: "#000",
                                backgroundColor: "#fff",
                            }}
                            selectedValue={selectedAppliance}
                            onValueChange={(itemValue) => setSelectedAppliance(itemValue)}
                        >
                            {appliances.map((appliance, idx) => (
                                <Picker.Item key={idx} label={appliance} value={appliance} />
                            ))}
                        </Picker>
                    </View>

                    {/* Nickname input */}
                    <Text className="text-gray-700 mb-2">Nickname (optional)</Text>
                    <TextInput
                        placeholder="Enter nickname"
                        placeholderTextColor="#9CA3AF"
                        value={nickname}
                        onChangeText={setNickname}
                        className="border border-gray-300 rounded-xl p-5 mb-4"
                    />

                    {/* Buttons */}
                    <View className="flex-row justify-between">
                        <TouchableOpacity
                            className="flex-1 bg-gray-300 rounded-xl py-3 mr-2"
                            onPress={onClose}
                        >
                            <Text className="text-center font-semibold text-gray-700">Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="flex-1 bg-green-600 rounded-xl py-3 ml-2"
                            onPress={handleAdd}
                        >
                            <Text className="text-center font-semibold text-white">Add</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
