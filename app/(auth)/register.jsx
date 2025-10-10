import { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Modal,
    useColorScheme,
} from "react-native";
import { useRouter } from "expo-router";
import AuthHeader from "../../components/ui/AuthHeader";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useAuth from "../../hooks/useAuth";
import { Checkbox } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import { BlurView } from "expo-blur";
import TermsOfService from "../../components/ui/Terms";
import Privacy from "../../components/ui/Privacy";
import {
    Feather,
    Fontisto,
    Ionicons,
    MaterialIcons,
} from "@expo/vector-icons";

export default function RegisterForm() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const scheme = useColorScheme();
    const isDark = scheme === "dark";
    const { register } = useAuth();

    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        location: "",
        password: "",
        confirmPassword: "",
    });

    const [isLoading, setIsLoading] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [errors, setErrors] = useState({});
    const [choice, setChoice] = useState("");
    const [items] = useState([
        { label: "Lapu-Lapu City", value: "Lapu-Lapu City" },
        { label: "Mandaue City", value: "Mandaue City" },
    ]);

    const handleChange = (field, value) => {
        setForm({ ...form, [field]: value });
    };

    const validateForm = () => {
        const newErrors = {};
        if (!form.firstName.trim()) newErrors.firstName = "First name is required";
        if (!form.lastName.trim()) newErrors.lastName = "Last name is required";
        if (!form.email.trim()) newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(form.email))
            newErrors.email = "Email is invalid";
        if (!form.location.trim()) newErrors.location = "Location is required";
        if (!form.password) newErrors.password = "Password is required";
        else if (form.password.length < 6) newErrors.password = "Min. 8 characters";
        if (!form.confirmPassword)
            newErrors.confirmPassword = "Confirm Password is required";
        else if (form.password !== form.confirmPassword)
            newErrors.confirmPassword = "Passwords do not match";
        if (!acceptTerms)
            newErrors.terms = "You must agree to the Terms & Privacy Policy";

        setErrors(newErrors);
        setIsLoading(false);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        setIsLoading(true);
        if (!validateForm()) return;
        register(
            setIsLoading,
            form.location,
            form.firstName,
            form.lastName,
            form.email,
            form.password
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#166534", paddingTop: insets.top }}>
            <AuthHeader />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{
                    flex: 1,
                    backgroundColor: "#fff",
                    borderTopLeftRadius: 40,
                    borderTopRightRadius: 40,
                    paddingBottom: insets.bottom + 10,
                }}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ padding: 20, paddingBottom: 50 }}
                >
                    <Text className="text-2xl font-bold text-center text-gray-800 mb-10">
                        Create A New Account
                    </Text>

                    <View className="flex-row justify-between mb-4 gap-2">
                        <View className="flex-1">
                            <View
                                className={`flex-row items-center bg-gray-100 border ${errors.firstName ? "border-red-500" : "border-gray-300"
                                    } rounded-md p-3`}
                            >
                                <Feather name="user" size={18} color="gray" />
                                <TextInput
                                    placeholderTextColor="#9CA3AF"
                                    placeholder="First Name"
                                    value={form.firstName}
                                    onChangeText={(text) => handleChange("firstName", text)}
                                    className="ml-2 flex-1 p-3 text-black"
                                />
                            </View>
                            {errors.firstName && (
                                <Text className="text-red-500 text-xs mt-1">
                                    {errors.firstName}
                                </Text>
                            )}
                        </View>

                        <View className="flex-1">
                            <View
                                className={`flex-row items-center bg-gray-100 border ${errors.lastName ? "border-red-500" : "border-gray-300"
                                    } rounded-md p-3`}
                            >
                                <Feather name="user" size={18} color="gray" />
                                <TextInput
                                    placeholderTextColor="#9CA3AF"
                                    placeholder="Last Name"
                                    value={form.lastName}
                                    onChangeText={(text) => handleChange("lastName", text)}
                                    className="ml-2 flex-1 p-3 text-black"
                                />
                            </View>
                            {errors.lastName && (
                                <Text className="text-red-500 text-xs mt-1">
                                    {errors.lastName}
                                </Text>
                            )}
                        </View>
                    </View>

                    {/* Email */}
                    <View className="mb-4">
                        <View
                            className={`flex-row items-center bg-gray-100 border ${errors.email ? "border-red-500" : "border-gray-300"
                                } rounded-md p-3`}
                        >
                            <MaterialIcons name="email" size={18} color="gray" />
                            <TextInput
                                className="ml-2 flex-1 p-3 text-black"
                                placeholder="Enter Email Address"
                                placeholderTextColor="#9CA3AF"
                                autoCapitalize="none"
                                keyboardType="email-address"
                                value={form.email}
                                onChangeText={(text) => handleChange("email", text)}
                            />
                        </View>
                        {errors.email && (
                            <Text className="text-red-500 text-xs mt-1">{errors.email}</Text>
                        )}
                    </View>

                    <View className="mb-4">
                        <View
                            className={`flex-row items-center rounded-lg bg-gray-100 border ${errors.location ? "border-red-500" : "border-gray-300"
                                }`}
                        >
                            <Ionicons
                                name="location-outline"
                                size={18}
                                color="gray"
                                style={{ marginLeft: 8 }}
                            />
                            <Picker
                                dropdownIconColor={isDark ? "#000" : "#000"}
                                itemStyle={{
                                    color: "#000",
                                    backgroundColor: "#fff",
                                }}
                                selectedValue={form.location}
                                onValueChange={(value) => handleChange("location", value)}
                                style={{
                                    flex: 1,
                                    color: form.location ? "black" : "#6b7280",
                                    padding: 3,
                                }}
                            >
                                <Picker.Item label="Select Location" value="" color="#6b7280" />
                                {items.map((item, index) => (
                                    <Picker.Item
                                        key={index}
                                        label={item.label}
                                        value={item.value}
                                    />
                                ))}
                            </Picker>
                        </View>
                        {errors.location && (
                            <Text className="text-red-500 text-xs mt-1">
                                {errors.location}
                            </Text>
                        )}
                    </View>

                    <View className="mb-4">
                        <View
                            className={`flex-row items-center bg-gray-100 border ${errors.password ? "border-red-500" : "border-gray-300"
                                } rounded-md p-3`}
                        >
                            <Fontisto name="locked" size={18} color="gray" />
                            <TextInput
                                placeholder="Password"
                                placeholderTextColor="#9CA3AF"
                                value={form.password}
                                onChangeText={(text) => handleChange("password", text)}
                                secureTextEntry={!showPassword}
                                className="ml-2 flex-1 p-3 text-black"
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                hitSlop={10}
                            >
                                <Feather
                                    name={showPassword ? "eye-off" : "eye"}
                                    size={20}
                                    color="gray"
                                />
                            </TouchableOpacity>
                        </View>
                        {errors.password && (
                            <Text className="text-red-500 text-xs mt-1">
                                {errors.password}
                            </Text>
                        )}
                    </View>

                    <View className="mb-4">
                        <View
                            className={`flex-row items-center bg-gray-100 border ${errors.confirmPassword ? "border-red-500" : "border-gray-300"
                                } rounded-md p-3`}
                        >
                            <Fontisto name="locked" size={18} color="gray" />
                            <TextInput
                                placeholder="Confirm Password"
                                placeholderTextColor="#9CA3AF"
                                value={form.confirmPassword}
                                onChangeText={(text) => handleChange("confirmPassword", text)}
                                secureTextEntry={!showConfirmPassword}
                                className="ml-2 flex-1 p-3 text-black"
                            />
                            <TouchableOpacity
                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                hitSlop={10}
                            >
                                <Feather
                                    name={showConfirmPassword ? "eye-off" : "eye"}
                                    size={20}
                                    color="gray"
                                />
                            </TouchableOpacity>
                        </View>
                        {errors.confirmPassword && (
                            <Text className="text-red-500 text-xs mt-1">
                                {errors.confirmPassword}
                            </Text>
                        )}
                    </View>

                    <View className="mb-4 flex-row items-center -ml-2.5 flex-wrap">
                        <Checkbox
                            color="#15803d"
                            status={acceptTerms ? "checked" : "unchecked"}
                            onPress={() => setAcceptTerms(!acceptTerms)}
                        />
                        <Text className="text-gray-600">
                            I agree to the{" "}
                            <Text
                                onPress={() => {
                                    setModalVisible(true);
                                    setChoice("terms");
                                }}
                                className="text-green-700 font-semibold"
                            >
                                Terms of Service
                            </Text>{" "}
                            and{" "}
                            <Text
                                onPress={() => {
                                    setModalVisible(true);
                                    setChoice("privacy");
                                }}
                                className="text-green-700 font-semibold"
                            >
                                Privacy Policy
                            </Text>
                            .
                        </Text>
                    </View>
                    {errors.terms && (
                        <Text className="text-red-500 text-xs mt-1">{errors.terms}</Text>
                    )}

                    <TouchableOpacity
                        onPress={handleSubmit}
                        className="bg-green-700 py-5 rounded-lg mb-4 justify-center h-16"
                        disabled={isLoading}
                    >
                        {!isLoading ? (
                            <Text className="text-white font-semibold text-center">
                                Sign up
                            </Text>
                        ) : (
                            <ActivityIndicator size="small" color="white" />
                        )}
                    </TouchableOpacity>

                    <View className="flex-row items-center my-3">
                        <View className="flex-1 h-px bg-gray-300" />
                        <Text className="mx-2 text-gray-500">or</Text>
                        <View className="flex-1 h-px bg-gray-300" />
                    </View>

                    <Text className="text-md text-gray-700 text-center">
                        Already have an account?{" "}
                        <Text
                            onPress={() => router.navigate("/(auth)/login")}
                            className="text-green-700 font-semibold"
                        >
                            Login
                        </Text>
                    </Text>
                </ScrollView>
            </KeyboardAvoidingView>

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <BlurView
                    intensity={80}
                    tint="light"
                    className="flex-1 justify-center items-center bg-black/40"
                >
                    <View className="bg-white rounded-xl p-5 w-11/12 h-[80%]">
                        {choice === "terms" ? (
                            <TermsOfService
                                source={"register"}
                                close={() => setModalVisible(false)}
                            />
                        ) : (
                            <Privacy
                                source={"register"}
                                close={() => setModalVisible(false)}
                            />
                        )}
                    </View>
                </BlurView>
            </Modal>
        </View>
    );
}
