import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Image,
    ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import AuthHeader from "../../components/ui/AuthHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import useAuth from "../../hooks/useAuth";
import DropDownPicker from "react-native-dropdown-picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";

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
    const [location, setLocation] = useState();
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState([
        { label: "Lapu-Lapu City", value: "Lapu-Lapu City" },
        { label: "Mandaue City", value: "Mandaue City" }
    ]);


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
        setIsLoading(false);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        // if (!validateForm()) return;
        // Alert.alert(form.firstName, form.lastName);
        setIsLoading(true);
        register(setIsLoading, location, form.firstName, form.lastName, form.email, form.password);
    };

    return (
        <SafeAreaView className="h-full">
            <View className="h-full md:w-1/3 md:mx-auto bg-white px-6">
                <AuthHeader textHeader="Create and account" />

                <View className="flex-row justify-between mb-4">
                    <View className="flex-1 mr-2">
                        <TextInput
                            placeholder="First Name"
                            value={form.firstName}
                            onChangeText={(text) => handleChange("firstName", text)}
                            className={`border px-3 py-4 rounded-md bg-white ${errors.firstName ? "border-red-500" : "border-gray-300"}`}
                        />
                    </View>
                    <View className="flex-1 ml-2">
                        <TextInput
                            placeholder="Last Name"
                            value={form.lastName}
                            onChangeText={(text) => handleChange("lastName", text)}
                            className={`border px-3 py-4 rounded-md bg-white ${errors.lastName ? "border-red-500" : "border-gray-300"}`}
                        />
                    </View>
                </View>

                <TextInput
                    placeholder="Email"
                    value={form.email}
                    onChangeText={(text) => handleChange("email", text)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className={`mb-4 border px-3 py-4 rounded-md bg-white ${errors.email ? "border-red-500" : "border-gray-300"}`}
                />

                <View className="mb-4 max-h-14">
                    <DropDownPicker
                        open={open}
                        value={location}
                        items={items}
                        setOpen={setOpen}
                        setValue={setLocation}
                        setItems={setItems}
                        placeholder="Select Location"
                        style={{
                            borderColor: "#d1d5db",
                        }}
                        placeholderStyle={{
                            color: "#6b7280",
                        }}
                        dropDownContainerStyle={{
                            borderColor: "#d1d5db",
                        }}
                        selectedItemLabelStyle={{
                            color: '#36a25e',
                        }}
                    />
                </View>

                <TextInput
                    placeholder="Password"
                    value={form.password}
                    onChangeText={(text) => handleChange("password", text)}
                    secureTextEntry={!showPassword}
                    className={`mb-4 border px-3 py-4 rounded-md bg-white ${errors.password ? "border-red-500" : "border-gray-300"}`}
                />

                <TextInput
                    placeholder="Confirm Password"
                    value={form.confirmPassword}
                    onChangeText={(text) => handleChange("confirmPassword", text)}
                    secureTextEntry
                    className={`mb-4 border px-3 py-4 rounded-md bg-white ${errors.confirmPassword ? "border-red-500" : "border-gray-300"}`}
                />

                <Text className="text-xs text-gray-600 text-center mb-4">
                    By clicking continue, you agree to our{" "}
                    <Text className="text-green-700 font-semibold">Terms of Service</Text>{" "}
                    and <Text className="text-green-700 font-semibold">Privacy Policy</Text>
                </Text>

                <TouchableOpacity
                    onPress={handleSubmit}
                    className="bg-green-700 py-4 rounded-md mb-4"
                    disabled={isLoading}
                >
                    <View className="h-5 items-center justify-center">
                        {!isLoading ? (
                            <Text className="text-white font-semibold">Sign up</Text>
                        ) : (
                            <ActivityIndicator size="small" color="white" />
                        )}
                    </View>
                </TouchableOpacity>

                <View className="flex-row items-center my-3">
                    <View className="flex-1 h-px bg-gray-300" />
                    <Text className="mx-2 text-gray-500">or</Text>
                    <View className="flex-1 h-px bg-gray-300" />
                </View>
                <Text className="text-md text-gray-700 text-center">
                    Already have an account?{" "}
                    <Text
                        onPress={() => router.push("/(auth)/login")}
                        className="text-green-700 font-semibold"
                    >
                        Login
                    </Text>
                </Text>
            </View>
        </SafeAreaView>
    );
}
