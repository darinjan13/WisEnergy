import { Modal, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';

export default function ResultModal({ visible, success, title, lines = [], onClose }) {
    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <BlurView intensity={100} tint="dark" className="flex-1 justify-center items-center">
                <View className="bg-white rounded-xl p-6 w-10/12 max-h-[70%]">
                    <View className="items-center mb-3">
                        <MaterialCommunityIcons
                            name={success ? "check-circle" : "alert-circle"}
                            size={44}
                            color={success ? "#16A34A" : "#DC2626"}
                        />
                    </View>
                    <Text className="text-lg font-bold text-[#2E4F4F] mb-2 text-center">
                        {title}
                    </Text>
                    <ScrollView className="mb-4 max-h-40">
                        {lines.map((line, i) => (
                            <Text key={i} className="text-gray-600 text-sm mb-1">
                                {line}
                            </Text>
                        ))}
                    </ScrollView>
                    <View className="flex-row justify-end">
                        <TouchableOpacity
                            className="bg-green-700 py-2 px-6 rounded-lg"
                            onPress={onClose}
                        >
                            <Text className="text-white font-semibold">OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </BlurView>
        </Modal>
    );
}
