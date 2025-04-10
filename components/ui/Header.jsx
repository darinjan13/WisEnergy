import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import { router } from 'expo-router';

const Header = () => {
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const auth = getAuth();

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            console.log('User signed out');
            router.replace('/(auth)/login'); // Redirect to login page after sign out
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <View className="flex-row justify-between items-center h-16 mb-4">
            <View className="h-40 w-40 -ml-2">
                <Image
                    source={require('../../assets/images/WisEnergy_LOGO2.png')}
                    className="w-full h-full relative"
                    resizeMode="contain"
                />
            </View>
            <View className="relative">
                <TouchableOpacity onPress={() => setDropdownVisible(!dropdownVisible)}>
                    <Text className="text-2xl">👤</Text>
                </TouchableOpacity>
                {dropdownVisible && (
                    <View className="absolute top-8 right-0 bg-white border border-gray-300 rounded shadow z-50 h-fit w-24">
                        <TouchableOpacity onPress={handleSignOut}>
                            <Text className="p-2 text-base text-gray-700 w-full">Sign Out</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
};

export default Header;
