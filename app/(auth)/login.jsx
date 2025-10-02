import { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform
} from "react-native";
import { Feather, Fontisto, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AuthHeader from "../../components/ui/AuthHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import useAuth from "../../hooks/useAuth";
import { Checkbox } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginForm() {
    const router = useRouter();
    const { login } = useAuth();

    const [isLoading, setIsLoading] = useState(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({ email: "", password: "" });

    useEffect(() => {
        const checkRememberedUser = async () => {
            const rememberedUser = await AsyncStorage.getItem('rememberedUser')

            if (rememberedUser) {
                setIsLoading(true)
                const { email, password } = JSON.parse(rememberedUser)
                login(setIsLoading, email, password)
            } else {
                setIsLoading(false)
            }
        }
        checkRememberedUser()
    }, [])

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
        setIsLoading(false);
        return isValid;
    };

    const handleSubmit = () => {
        setIsLoading(true);
        if (!validateForm()) return;
        login(setIsLoading, email, password, rememberMe);
    };

    return (
        <View>
            <AuthHeader />
            <KeyboardAvoidingView behavior={Platform.OS === "android" ? "padding" : "padding"} className="h-full bg-white rounded-t-[40px] p-6">
                <Text className="text-2xl font-bold text-center text-gray-800 mb-2">
                    Login
                </Text>
                <Text className="text-gray-500 text-center mb-8">
                    Sign in to continue to your dashboard
                </Text>

                {/* Email Input */}
                <View className="mb-4">
                    <View className={`flex-row items-center border ${errors.email ? "border-red-500" : "border-gray-300"} rounded-md p-3 bg-gray-100`}>
                        <MaterialIcons name='email' size={18} color="gray" />
                        <TextInput
                            className="ml-2 flex-1 p-3 text-black"
                            placeholder="Enter Email Address"
                            placeholderTextColor="#9CA3AF"
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

                {/* Password Input */}
                <View className="mb-4">
                    <View className={`flex-row items-center border ${errors.password ? "border-red-500" : "border-gray-300"} rounded-md p-3 bg-gray-100`}>
                        <Fontisto name='locked' size={18} color="gray" />
                        <TextInput
                            className="ml-2 flex-1 p-3 text-black"
                            placeholder="Enter Password"
                            placeholderTextColor="#9CA3AF"
                            secureTextEntry={!showPassword}
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

                {/* Remember Me + Forgot Password */}
                <View className="flex-row justify-between items-center mb-4">
                    <TouchableOpacity onPress={() => setRememberMe(!rememberMe)} className="flex-row items-center">
                        <Checkbox
                            color="#15803d"
                            status={rememberMe ? "checked" : "unchecked"}
                        />
                        <Text className="text-sm text-gray-700 ml-2">Remember Password</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push("/(auth)/forgotPassword")}>
                        <Text className="text-green-700 text-sm font-medium">
                            Forgot Password?
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Login Button */}
                <TouchableOpacity
                    onPress={handleSubmit}
                    className="bg-green-700 py-5 rounded-lg mb-4 justify-center h-16"
                    disabled={isLoading}
                >
                    {!isLoading ? (
                        <Text className="text-white text-center font-semibold">Sign In</Text>
                    ) : (
                        <ActivityIndicator color="white" />
                    )}
                </TouchableOpacity>

                {/* Divider */}
                <View className="flex-row items-center">
                    <View className="flex-1 h-px bg-gray-300" />
                    <Text className="mx-2 text-gray-500">or</Text>
                    <View className="flex-1 h-px bg-gray-300" />
                </View>

                {/* Register */}
                <View className="flex-row justify-center mt-4">
                    <Text className="text-gray-700">Don’t have an account? </Text>
                    <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
                        <Text className="text-green-700 font-semibold">Register Now</Text>
                    </TouchableOpacity>
                </View>

            </KeyboardAvoidingView>
        </View>
    );
}
