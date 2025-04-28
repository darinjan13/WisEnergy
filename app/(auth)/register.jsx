import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    Image,
    ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import AuthHeader from "../../components/ui/AuthHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import useAuth from "../../hooks/useAuth";

export default function RegisterForm() {
    const router = useRouter();

    const { register } = useAuth();

    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [isLoading, setIsLoading] = useState(false);

    const [acceptTerms, setAcceptTerms] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});


    const handleChange = (field, value) => {
        setForm({ ...form, [field]: value });
    };

    const validateForm = () => {
        const newErrors = {};
        setIsLoading(true);
        if (!form.firstName.trim()) newErrors.firstName = "First name is required";
        if (!form.lastName.trim()) newErrors.lastName = "Last name is required";
        if (!form.email.trim()) newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Email is invalid";
        if (!form.password) newErrors.password = "Password is required";
        else if (form.password.length < 6) newErrors.password = "Min. 8 characters";
        if (form.password !== form.confirmPassword)
            newErrors.confirmPassword = "Passwords do not match";
        if (!acceptTerms)
            newErrors.terms = "You must agree to the Terms & Privacy Policy";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        // if (!validateForm()) return;
        // Alert.alert(form.firstName, form.lastName);
        setIsLoading(true);
        register(setIsLoading, form.firstName, form.email, form.password);
    };

    return (
        <SafeAreaView className="h-full">
            <ScrollView className="h-full md:w-1/3 md:mx-auto bg-white px-6">
                <AuthHeader textHeader="Create and account" />

                {/* First and Last Name */}
                <View className="flex-row justify-between mb-4">
                    <View className="flex-1 mr-2">
                        <TextInput
                            placeholder="First Name"
                            value={form.firstName}
                            onChangeText={(text) => handleChange("firstName", text)}
                            className={`border px-3 py-2 rounded-md bg-white ${errors.firstName ? "border-red-500" : "border-gray-300"}`}
                        />
                    </View>
                    <View className="flex-1 ml-2">
                        <TextInput
                            placeholder="Last Name"
                            value={form.lastName}
                            onChangeText={(text) => handleChange("lastName", text)}
                            className={`border px-3 py-2 rounded-md bg-white ${errors.lastName ? "border-red-500" : "border-gray-300"}`}
                        />
                    </View>
                </View>

                {/* Email */}
                <TextInput
                    placeholder="Email"
                    value={form.email}
                    onChangeText={(text) => handleChange("email", text)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className={`mb-4 border px-3 py-2 rounded-md bg-white ${errors.email ? "border-red-500" : "border-gray-300"}`}
                />

                {/* Password */}
                <TextInput
                    placeholder="Password"
                    value={form.password}
                    onChangeText={(text) => handleChange("password", text)}
                    secureTextEntry={!showPassword}
                    className={`mb-4 border px-3 py-2 rounded-md bg-white ${errors.password ? "border-red-500" : "border-gray-300"}`}
                />

                {/* Confirm Password */}
                <TextInput
                    placeholder="Confirm Password"
                    value={form.confirmPassword}
                    onChangeText={(text) => handleChange("confirmPassword", text)}
                    secureTextEntry
                    className={`mb-4 border px-3 py-2 rounded-md bg-white ${errors.confirmPassword ? "border-red-500" : "border-gray-300"}`}
                />

                {/* Terms & Privacy */}
                <Text className="text-xs text-gray-600 text-center mb-4">
                    By clicking continue, you agree to our{" "}
                    <Text className="text-green-700 font-semibold">Terms of Service</Text>{" "}
                    and <Text className="text-green-700 font-semibold">Privacy Policy</Text>
                </Text>

                {/* Confirm Button */}
                <TouchableOpacity
                    onPress={handleSubmit}
                    className="bg-green-700 py-3 rounded-md mb-4"
                    disabled={isLoading}
                >
                    {!isLoading ? (
                        <Text className="text-white text-center font-semibold">Sign up</Text>
                    ) : (
                        <ActivityIndicator size="small" color="white" />
                    )}
                </TouchableOpacity>

                {/* Divider */}
                <View className="flex-row items-center my-3">
                    <View className="flex-1 h-px bg-gray-300" />
                    <Text className="mx-2 text-gray-500">or</Text>
                    <View className="flex-1 h-px bg-gray-300" />
                </View>

                {/* Google Button */}
                <TouchableOpacity className="bg-gray-100 border border-gray-300 py-3 rounded-md flex-row items-center justify-center mb-4">
                    <Image
                        source={{
                            uri: "https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg",
                        }}
                        className="w-5 h-5 mr-2"
                    />
                    <Text className="text-sm font-medium">Continue with Google</Text>
                </TouchableOpacity>
                <Text className="text-sm text-gray-700 text-center">
                    Already have an account?{" "}
                    <Text
                        onPress={() => router.push("/(auth)/login")}
                        className="text-green-700 font-semibold"
                    >
                        Login
                    </Text>
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
}
