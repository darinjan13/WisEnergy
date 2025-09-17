import { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import useAuth from "../../hooks/useAuth";

export default function Settings() {
    const { logout } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const handleLogout = () => {
        setIsLoading(true);
        setTimeout(() => {
            logout(setIsLoading);
        }, 1000);
    }
    return (
        <View className="flex-1 bg-white px-4 pt-8">
            <Text className="text-xl font-bold text-gray-800">SETTINGS</Text>

            <View className="mt-6">
                <TouchableOpacity className="py-4 border-b border-gray-200 flex-row justify-between">
                    <Text className="text-gray-800">Edit Profile</Text>
                    <Text className="text-gray-500">{">"}</Text>
                </TouchableOpacity>
                <TouchableOpacity className="py-4 border-b border-gray-200 flex-row justify-between">
                    <Text className="text-gray-800">Change Password</Text>
                    <Text className="text-gray-500">{">"}</Text>
                </TouchableOpacity>
                <TouchableOpacity className="py-4 border-b border-gray-200 flex-row justify-between">
                    <Text className="text-gray-800">Delete Account</Text>
                    <Text className="text-gray-500">{">"}</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={handleLogout} disabled={isLoading} className="mt-6 self-center bg-red-700 px-6 py-2 rounded-md">
                <View className="h-8 w-16 items-center justify-center">
                    {!isLoading ? (
                        <Text className="text-white font-semibold">Log Out</Text>
                    ) : (
                        <ActivityIndicator size="small" color="white" />
                    )}
                </View>
            </TouchableOpacity>
        </View>
    );
}
