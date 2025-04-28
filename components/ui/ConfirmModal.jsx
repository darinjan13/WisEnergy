import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { BlurView } from 'expo-blur';
import React from 'react';

export default function ConfirmModal({ visible, onCancel, onConfirm, action }) {
    const isReset = action === 'reset';
    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onCancel}
        >
            <BlurView intensity={100} tint="dark" className="flex-1 justify-center items-center">
                <View className="bg-white rounded-xl p-6 w-10/12">
                    <Text className="text-lg font-bold text-[#2E4F4F] mb-4">
                        {isReset ? 'Reset Appliance?' : 'Delete Appliance?'}
                    </Text>
                    <Text className="text-gray-600 mb-6">
                        {isReset ? 'Are you sure you want to reset this appliance?' : 'Are you sure you want to delete this appliance? This action cannot be undone.'}
                    </Text>
                    <View className="flex-row justify-end">
                        <TouchableOpacity
                            className="bg-gray-300 py-2 px-6 rounded-lg mr-4"
                            onPress={onCancel}
                        >
                            <Text className="text-gray-700 font-semibold">Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="bg-red-600 py-2 px-6 rounded-lg"
                            onPress={onConfirm}
                        >
                            <Text className="text-white font-semibold">Delete</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </BlurView>
        </Modal>
    );
}
