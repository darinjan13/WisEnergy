import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    Image,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";
import Header from "@/components/ui/Header";
import AuthHeader from "../../components/ui/AuthHeader";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginForm() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({ email: "", password: "" });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                router.replace("/(tabs)");
            }
        });

        return unsubscribe;
    }, []);

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

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            const userCredential = await signInWithEmailAndPassword(
                auth,
                email,
                password
            );
            Alert.alert("Success", "You are now logged in!");
            router.replace("/(tabs)");
        } catch (error) {
            let errorMessage = "An error occurred. Please try again.";
            if (error.code === "auth/user-not-found") {
                errorMessage = "No user found with this email.";
            } else if (error.code === "auth/wrong-password") {
                errorMessage = "Incorrect password.";
            }
            Alert.alert("Login Failed", errorMessage);
        }
    };

    return (
        <SafeAreaView className="h-full">
            <View className="h-full md:w-1/3 md:mx-auto bg-white px-6">
                {/* Logo */}
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

                    {/* Password Field */}
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
                    >
                        <Text className="text-white text-center font-semibold">Log in</Text>
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
                    <Text className="text-sm text-gray-700 text-center">
                        Don’t have an account?{" "}
                        <Text
                            onPress={() => router.push("/(auth)/register")}
                            className="text-green-700 font-semibold"
                        >
                            Sign up
                        </Text>
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
}
