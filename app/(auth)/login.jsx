import { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AuthHeader from "../../components/ui/AuthHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import useAuth from "../../hooks/useAuth";
import { Checkbox, IconButton } from "react-native-paper";
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
            setTimeout(() => {
                setIsLoading(false);
                newErrors.email = "Email is required";
            }, 1000);
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            setTimeout(() => {
                setIsLoading(false);
                newErrors.email = "Email is invalid";
            }, 1000);
            isValid = false;
        }

        if (!password) {
            setTimeout(() => {
                setIsLoading(false);
                newErrors.password = "Password is required";
            }, 1000);
            isValid = false;
        } else if (password.length < 6) {
            setTimeout(() => {
                setIsLoading(false);
                newErrors.password = "Password must be at least 6 characters";
            }, 1000);
            isValid = false;
        }

        setErrors(newErrors);

        return isValid;
    };

    const handleSubmit = () => {
        setIsLoading(true);
        if (!validateForm()) return;
        login(setIsLoading, email, password, rememberMe);
    };

    return (
        <SafeAreaView className="h-full">
            <View className="h-full md:w-1/3 md:mx-auto bg-white px-6">
                <AuthHeader textHeader="Login" />
                <View className="flex-1">
                    <View className="mb-4">
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

                    <View className="mb-4">
                        <View className="flex-row items-center border border-gray-300 rounded-md px-3">
                            <Feather name="lock" size={18} color="gray" />
                            <TextInput
                                className="ml-2 flex-1"
                                placeholder="Enter your password"
                                secureTextEntry={!showPassword}
                                value={password}
                                onChangeText={setPassword}
                            />
                            <IconButton style={{ marginRight: -10 }} size={26} onPress={() => setShowPassword(!showPassword)} icon={showPassword ? "eye-off" : "eye-outline"} iconColor="gray" />
                        </View>
                        {errors.password && (
                            <Text className="text-red-500 text-xs mt-1">{errors.password}</Text>
                        )}
                    </View>

                    <TouchableOpacity className="flex-row items-center mb-4 -ml-2.5" onPress={() => setRememberMe(!rememberMe)}>
                        <Checkbox color="#15803d" status={rememberMe ? "checked" : "unchecked"} />
                        <Text className="text-sm text-gray-700">Remember me</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleSubmit}
                        className="bg-green-700 py-5 rounded-md mb-4"
                        disabled={isLoading}
                    >
                        <View className="h-5">
                            {!isLoading ? (
                                <Text className="text-white text-center font-semibold">Log in</Text>
                            ) : (
                                <ActivityIndicator size="small" color="white" />
                            )}
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Text className="text-green-700 text-sm mb-4 text-center">Forgot password?</Text>
                    </TouchableOpacity>

                    <View className="flex-row items-center">
                        <View className="flex-1 h-px bg-gray-300" />
                        <Text className="mx-2 text-gray-500">or</Text>
                        <View className="flex-1 h-px bg-gray-300" />
                    </View>

                    <View className="flex-row justify-center mt-4">
                        <Text className="text-m text-gray-700">
                            Don’t have an account?{" "}
                        </Text>
                        <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
                            <Text className="text-md text-green-700 font-semibold">
                                Sign up
                            </Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
        </SafeAreaView>
    );
}
