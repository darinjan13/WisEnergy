import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import AuthHeader from '../../../components/ui/AuthHeader';
import { router, useLocalSearchParams } from 'expo-router';
import { reset_password } from '../../../services/apiService';

export default function ResetPasswordScreen() {
    const { email } = useLocalSearchParams();
    const [isLoading, setIsLoading] = useState(false)
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleUpdate = async () => {
        setIsLoading(true)

        if (!password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in both fields.');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match.');
            return;
        }
        const result = await reset_password(email, password);
        if (result.success) {
            Alert.alert('Success', result.message);
            router.navigate("/(auth)/login")
        } else {
            Alert.alert('Error', result.message)
        }
    };

    return (
        <View className="flex-1 bg-white px-6">
            <AuthHeader textHeader={"Enter New Password"} />

            <TextInput
                className="w-full border border-gray-300 rounded-md p-5 mb-4"
                placeholder="New Password"
                secureTextEntry
                autoCapitalize="none"
                value={password}
                onChangeText={setPassword}
            />

            <TextInput
                className="w-full border border-gray-300 rounded-md p-5 mb-6"
                placeholder="Confirm Password"
                secureTextEntry
                autoCapitalize="none"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
            />

            <TouchableOpacity
                className="bg-green-700 py-5 rounded-md w-full mb-3"
                onPress={handleUpdate}
            >
                <Text className="text-white text-center font-semibold">Update Password</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.navigate("/(auth)/login")} className="border py-5 rounded-md w-full">
                <Text className="text-gray-700 text-center font-semibold">Cancel</Text>
            </TouchableOpacity>
        </View>
    );
}
