import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";

const LoginForm = () => {


    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({ email: "", password: "" });

    const validateForm = () => {
        let isValid = true;
        const newErrors = { email: "", password: "" };

        if (!email) {
            newErrors.email = "Email is required";
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = "Email is invalid";
            isValid = false;
        }

        if (!password) {
            newErrors.password = "Password is required";
            isValid = false;
        } else if (password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = () => {
        if (validateForm()) {
        }
    };

    return (
        <View className="w-full max-w-[350px] bg-white p-6 rounded-lg shadow-md">
            <Text className="text-2xl font-bold text-center mb-6 text-blue-600">
                Login
            </Text>

            {/* Email Input */}
            <View className="mb-4">
                <Text className="text-sm font-medium mb-1 text-gray-700">Email</Text>
                <View className="flex-row items-center border border-gray-300 rounded-md px-3 py-2">
                    <Feather name="mail" size={20} color="#6B7280" />
                    <TextInput
                        className="flex-1 ml-2 text-base text-gray-800"
                        placeholder="Enter your email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>
                {errors.email ? (
                    <Text className="text-red-500 text-xs mt-1">{errors.email}</Text>
                ) : null}
            </View>

            {/* Password Input */}
            <View className="mb-4">
                <Text className="text-sm font-medium mb-1 text-gray-700">Password</Text>
                <View className="flex-row items-center border border-gray-300 rounded-md px-3 py-2">
                    <Feather name="lock" size={20} color="#6B7280" />
                    <TextInput
                        className="flex-1 ml-2 text-base text-gray-800"
                        placeholder="Enter your password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Feather name={showPassword ? "eye-off" : "eye"} size={20} color="#6B7280" />
                    </TouchableOpacity>
                </View>
                {errors.password ? (
                    <Text className="text-red-500 text-xs mt-1">{errors.password}</Text>
                ) : null}
            </View>

            {/* Forgot Password */}
            <TouchableOpacity className="mb-6">
                <Text className="text-blue-600 text-right text-sm">Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity onPress={handleSubmit} className="bg-blue-600 py-3 rounded-md mb-6">
                <Text className="text-white text-center font-semibold">Login</Text>
            </TouchableOpacity>
        </View>
    );
};

export default LoginForm;
