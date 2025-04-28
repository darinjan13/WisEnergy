import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    ActivityIndicator
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AuthHeader from "../../components/ui/AuthHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import useAuth from "../../hooks/useAuth";

export default function LoginForm() {
    const router = useRouter();
    const { login } = useAuth();

    const [isLoading, setIsLoading] = useState(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({ email: "", password: "" });

    const validateForm = () => {
        setIsLoading(true);
        let isValid = true;
        const newErrors = { email: "", password: "" };

        if (!email) {
            newErrors.email = "Email is required";
            isValid = false;
            setIsLoading(false);
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
        if (!validateForm()) return;
        login(setIsLoading, email, password);
    };

    return (
        <SafeAreaView className="h-full">
            <View className="h-full md:w-1/3 md:mx-auto bg-white px-6">
                <AuthHeader textHeader="Login" />

                <View className="flex-1 items-center">
                    <View className="mb-4 w-full max-w-sm">
                        <View className="flex-row items-center border border-gray-300 rounded-md px-3 py-2">
                            <Feather name="user" size={18} color="gray" />
                            <TextInput
                                className="ml-2 flex-1"
                                placeholder="Enter your email"
                                autoCapitalize="none"
                                keyboardType="email-address"
                                value={email}
                                onChangeText={setEmail}
                            />
                        </View>
                        {errors.email && (
                            <Text className="text-red-500 text-xs mt-1">{errors.email}</Text>
                        )}
                    </View>

                    <View className="mb-4 w-full max-w-sm">
                        <View className="flex-row items-center border border-gray-300 rounded-md px-3 py-2">
                            <Feather name="lock" size={18} color="gray" />
                            <TextInput
                                className="ml-2 flex-1"
                                placeholder="Enter your password"
                                secureTextEntry={!showPassword}
                                value={password}
                                onChangeText={setPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <Feather
                                    name={showPassword ? "eye-off" : "eye"}
                                    size={18}
                                    color="gray"
                                />
                            </TouchableOpacity>
                        </View>
                        {errors.password && (
                            <Text className="text-red-500 text-xs mt-1">{errors.password}</Text>
                        )}
                    </View>

                    {/* Remember Me */}
                    <TouchableOpacity
                        onPress={() => setRememberMe(!rememberMe)}
                        className="flex-row items-center mb-4 w-full max-w-sm"
                    >
                        <View
                            className={`w-4 h-4 mr-2 border border-gray-400 rounded-sm ${rememberMe ? "bg-green-600" : "bg-white"
                                }`}
                        />
                        <Text className="text-sm text-gray-700">Remember me</Text>
                    </TouchableOpacity>

                    {/* Log In Button */}
                    <TouchableOpacity
                        onPress={handleSubmit}
                        className="bg-green-700 py-3 rounded-md w-full max-w-sm mb-4"
                        disabled={isLoading}
                    >
                        {!isLoading ? (
                            <Text className="text-white text-center font-semibold">Log in</Text>) : (
                            <ActivityIndicator size="small" color="white" />
                        )}
                    </TouchableOpacity>
                    {/* Forgot Password */}
                    <TouchableOpacity>
                        <Text className="text-green-700 text-sm mb-4 text-center">Forgot password?</Text>
                    </TouchableOpacity>

                    {/* Divider */}
                    <View className="flex-row items-center my-3 w-full max-w-sm">
                        <View className="flex-1 h-px bg-gray-300" />
                        <Text className="mx-2 text-gray-500">or</Text>
                        <View className="flex-1 h-px bg-gray-300" />
                    </View>

                    {/* Google Sign In */}
                    <TouchableOpacity className="bg-gray-100 border border-gray-300 w-full max-w-sm py-3 rounded-md flex-row items-center justify-center mb-4">
                        <Image
                            source={{
                                uri: "https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg",
                            }}
                            className="w-5 h-5 mr-2"
                        />
                        <Text className="text-sm font-medium">Continue with Google</Text>
                    </TouchableOpacity>

                    {/* Register */}
                    <View className="flex-row justify-center mt-4">
                        <Text className="text-sm text-gray-700">
                            Don’t have an account?{" "}
                        </Text>
                        <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
                            <Text className="text-sm text-green-700 font-semibold">
                                Sign up
                            </Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
        </SafeAreaView>
    );
}
