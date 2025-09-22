import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, Image, TouchableWithoutFeedback } from 'react-native';
import { Portal } from 'react-native-paper';
import { auth } from '../../firebase/firebaseConfig';

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

            <View className="flex-row items-center">
                {/* Notification Bell */}
                <TouchableOpacity
                    onPress={() => {
                        setNotificationDropdownVisible(!notificationDropdownVisible);
                        setHasUnread(false);
                    }}
                >
                    <View
                        className="w-12 h-12 rounded-2xl bg-white items-center justify-center"
                        style={{
                            shadowColor: '#136B1E', // green glow
                            shadowOffset: { width: 0, height: 3 },
                            shadowOpacity: 0.35,
                            shadowRadius: 5,
                            elevation: 6,
                        }}
                    >
                        <Ionicons name="notifications-outline" size={24} color="black" />
                    </View>
                </TouchableOpacity>

                {/* User Avatar */}
                <TouchableOpacity
                    onPress={() => router.replace('/(settings)/settings')}
                    className="ml-3"
                >
                    <View className="w-12 h-12 rounded-2xl bg-[#136B1E] items-center justify-center">
                        <Text className="text-white text-lg font-bold">
                            {auth.currentUser?.displayName
                                ? auth.currentUser.displayName.substring(0, 2).toUpperCase()
                                : "U"}
                        </Text>
                    </View>
                </TouchableOpacity>

                {/* Notification Dropdown */}
                <Portal>
                    {notificationDropdownVisible && (
                        <TouchableWithoutFeedback onPress={handleCloseDropdown}>
                            <View className="absolute inset-0 z-40">
                                <View className="absolute top-[60px] right-4 bg-white border border-gray-300 rounded-xl shadow-md w-64 p-3 z-50">
                                    <Text className="text-sm text-gray-800">🔌 New usage report is ready!</Text>
                                    <Text className="text-sm text-gray-800 mt-2">⚡ You saved 12% this week!</Text>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    )}
                </Portal>
            </View>
        </View>
    );
};

export default Header;
