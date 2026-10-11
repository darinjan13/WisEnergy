import { Modal, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';

export default function ResultModal({
    visible,
    mode = 'result', // 'result' | 'confirm'
    success = true,
    title = '',
    lines = [],
    confirmText = 'Delete',
    onConfirm,
    onClose,
}) {
    const isConfirm = mode === 'confirm';
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
                            name={isConfirm ? "help-circle" : success ? "check-circle" : "alert-circle"}
                            size={44}
                            color={isConfirm ? "#2E4F4F" : success ? "#16A34A" : "#DC2626"}
                        />
                    </View>
                    <Text className="text-lg font-bold text-[#2E4F4F] mb-2 text-center">
                        {title}
                    </Text>
                    <ScrollView className="mb-4 max-h-40">
                        {lines.map((line, i) => (
                            <Text key={i} className="text-gray-600 text-sm mb-1 text-center">
                                {line}
                            </Text>
                        ))}
                    </ScrollView>
                    {isConfirm ? (
                        <View className="flex-row justify-end">
                            <TouchableOpacity
                                className="bg-gray-300 py-2 px-6 rounded-lg mr-4"
                                onPress={onClose}
                            >
                                <Text className="text-gray-700 font-semibold">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="bg-red-600 py-2 px-6 rounded-lg"
                                onPress={onConfirm}
                            >
                                <Text className="text-white font-semibold">{confirmText}</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View className="flex-row justify-end">
                            <TouchableOpacity
                                className="bg-green-700 py-2 px-6 rounded-lg"
                                onPress={onClose}
                            >
                                <Text className="text-white font-semibold">OK</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </BlurView>
        </Modal>
    );
}
