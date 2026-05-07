import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { reset_password } from '../../../services/apiService';
import { Feather, Fontisto } from '@expo/vector-icons';

export default function ResetPasswordScreen() {
    const { email } = useLocalSearchParams();
    const [errors, setErrors] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false)
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const validateForm = () => {
        const newErrors = {};
        setIsLoading(true);
        if (!password) newErrors.password = "Password is required";
        if (!confirmPassword) newErrors.confirmPassword = "Confirm Password is required";
        if (password.length < 8) newErrors.password = "Password must be at least 8 characters long";
        if (confirmPassword.length < 8) newErrors.confirmPassword = "Password must be at least 8 characters long";
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
            behavior={Platform.OS === "android" ? "padding" : "height"}
            className="flex-1"
        >
            <View className="h-full p-6 bg-white">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 -ml-1 my-10"
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
                            className="ml-2 flex-1 text-black"
                            placeholder="Enter Password"
                            placeholderTextColor="#9CA3AF"
                            secureTextEntry={!showPassword}
                            autoCapitalize='none'
                            value={password}
                            onChangeText={setPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            <Feather name={showPassword ? "eye-off" : "eye"} size={20} color="gray" />
                        </TouchableOpacity>
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
                            className="ml-2 flex-1 text-black"
                            placeholder="Confirm Password"
                            placeholderTextColor="#9CA3AF"
                            secureTextEntry={!showConfirmPassword}
                            autoCapitalize="none"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                        />
                        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                            <Feather name={showConfirmPassword ? "eye-off" : "eye"} size={20} color="gray" />
                        </TouchableOpacity>
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
