import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, Image, TouchableWithoutFeedback } from 'react-native';
import { Portal } from 'react-native-paper';

const Header = () => {
    const [notificationDropdownVisible, setNotificationDropdownVisible] = useState(false);
    const [hasUnread, setHasUnread] = useState(true);

    useFocusEffect(
        useCallback(() => {
            return () => {
                setNotificationDropdownVisible(false);
            };
        }, [])
    );

    const handleCloseDropdown = () => {
        setNotificationDropdownVisible(false);
    }

    return (
        <View className="flex-row justify-between items-center h-16 mb-4">
            <View className="w-10 h-10 justify-center -ml-2">
                <Image
                    source={require('@/assets/images/WisEnergy_LOGO2.png')}
                    className="max-h-40 max-w-40"
                    resizeMode="contain"
                />
            </View>

            <View className="">
                {/* Notification Bell */}
                <TouchableOpacity
                    onPress={() => {
                        setNotificationDropdownVisible(!notificationDropdownVisible);
                        setHasUnread(false); // Mark as read when clicked
                    }}
                >
                    <Ionicons name="notifications-outline" size={24} color="black" />
                    {hasUnread && (
                        <View className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full" />
                    )}
                </TouchableOpacity>

                {/* Dropdown Panel */}
                <Portal>
                    {notificationDropdownVisible && (
                        <TouchableWithoutFeedback onPress={handleCloseDropdown}>
                            <View className="absolute inset-0 z-40">
                                <View className="absolute top-[60px] right-4 bg-white border border-gray-300 rounded shadow w-64 p-3 z-50">
                                    <Text className="text-sm text-gray-800">🔌 New usage report is ready!</Text>
                                    <Text className="text-sm text-gray-800 mt-2">⚡ You saved 12% this week!</Text>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    )}
                </Portal>
            </View>
            {/* 
            {notificationDropdownVisible && (
                <TouchableWithoutFeedback onPress={handleCloseDropdown}>
                    <View className="absolute inset-0 z-40 bg-black h-fi" />
                </TouchableWithoutFeedback>
            )} */}
        </View>
    );
};

export default Header;
