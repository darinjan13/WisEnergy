import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import AuthHeader from '../../../components/ui/AuthHeader';
import { router, useLocalSearchParams } from 'expo-router';
import { reset_password } from '../../../services/apiService';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Fontisto } from '@expo/vector-icons';

export default function ResetPasswordScreen() {
    const { email } = useLocalSearchParams();
    const [errors, setErrors] = useState("");
    const [isLoading, setIsLoading] = useState(false)
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const validateForm = () => {
        const newErrors = {};
        setIsLoading(true);
        if (!password) newErrors.password = "Password is required";
        if (!confirmPassword) newErrors.confirmPassword = "Confirm Password is required";
        if (password.length < 6) newErrors.password = "Min. 8 characters";
        if (confirmPassword.length < 6) newErrors.confirmPassword = "Min. 8 characters";
        if (password !== confirmPassword)
            newErrors.confirmPassword = "Passwords do not match";

        setErrors(newErrors);
        setIsLoading(false);
        return Object.keys(newErrors).length === 0;
    };
    const handleUpdate = async () => {
        setIsLoading(true)
        if (!validateForm()) return;
        const result = await reset_password(email, password);
        if (result.success) {
            Alert.alert('Success', result.message);
            router.navigate("/(auth)/login")
        } else {
            Alert.alert('Error', result.message)
        }
    };

    return (

        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            className="flex-1"
        >
            <View className="h-full p-6 bg-white">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 -ml-1 mb-10"
                >
                    <Feather name='arrow-left' size={30} color="#095333" />
                </TouchableOpacity>
                <Text className="text-2xl font-bold text-gray-800 mb-2">
                    Reset Your Password
                </Text>
                <Text className="text-gray-500 mb-6">
                    Please enter your new password
                </Text>

                <View className=" mb-10">
                    <Text className="mb-2 text-gray-700 font-bold text-lg">Password</Text>
                    <View className={`flex-row items-center border ${errors.password ? "border-red-500" : "border-gray-300"} rounded-md p-3 bg-gray-100`}>
                        <Fontisto name='locked' size={18} color="gray" />
                        <TextInput
                            className="ml-2 flex-1"
                            placeholder="Enter Password"
                            placeholderTextColor="#9CA3AF"
                            value={password}
                            onChangeText={setPassword}
                        />
                    </View>
                    {errors.password && (
                        <Text className="text-red-500 text-xs mt-1">{errors.password}</Text>
                    )}
                </View>
                <View className="mb-6">
                    <Text className="mb-2 text-gray-700 font-bold text-lg">Confirm Password</Text>
                    <View className={`flex-row items-center border ${errors.password ? "border-red-500" : "border-gray-300"} rounded-md p-3 bg-gray-100`}>
                        <Fontisto name='locked' size={18} color="gray" />
                        <TextInput
                            className="ml-2 flex-1"
                            placeholder="Confirm Password"
                            secureTextEntry
                            autoCapitalize="none"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                        />
                    </View>
                    {errors.confirmPassword && (
                        <Text className="text-red-500 text-xs mt-1">{errors.confirmPassword}</Text>
                    )}
                </View>
                <View className="flex-1 justify-end mb-8">

                    <TouchableOpacity
                        className="bg-green-700 py-4 rounded-xl mb-3 mt-6 "
                        onPress={handleUpdate}
                    >
                        {!isLoading ? (
                            <Text className="text-white text-center font-bold text-xl">Update Password</Text>

                        ) : (
                            <ActivityIndicator size="small" color="white" />
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView >
    );
}
