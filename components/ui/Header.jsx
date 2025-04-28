import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import useAuth from '../../hooks/useAuth';

const Header = () => {
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const { logout } = useAuth();

    return (
        <View className="flex-row justify-between items-center h-16 mb-4">
            <View className="w-10 h-10 justify-center -ml-2">
                <Image
                    source={require('@/assets/images/WisEnergy_LOGO2.png')}
                    className="max-h-40 max-w-40"
                    resizeMode="contain"
                />
            </View>
            <View className="relative">
                <TouchableOpacity onPress={() => setDropdownVisible(!dropdownVisible)}>
                    <Text className="text-2xl">👤</Text>
                </TouchableOpacity>
                {dropdownVisible && (
                    <View className="absolute top-8 right-0 bg-white border border-gray-300 rounded shadow z-50 h-fit w-24">
                        <TouchableOpacity onPress={logout}>
                            <Text className="p-2 text-base text-gray-700 w-full">Sign Out</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
};

export default Header;
