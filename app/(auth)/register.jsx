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
} from "react-native";
import { useRouter } from "expo-router";
import AuthHeader from "../../components/ui/AuthHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import useAuth from "../../hooks/useAuth";
import { Checkbox } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import { BlurView } from "expo-blur";
import TermsOfService from "../../components/ui/Terms";
import Privacy from "../../components/ui/Privacy";

export default function RegisterForm() {
    const router = useRouter();

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
    const [modalVisible, setModalVisible] = useState(false);
    const [errors, setErrors] = useState({});
    const [choice, setChoice] = useState("")
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
        if (!form.location.trim()) newErrors.location = "Location is required"
        else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Email is invalid";
        if (!form.password) newErrors.password = "Password is required";
        if (!form.confirmPassword) newErrors.confirmPassword = "Confirm Password is required";
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
        setIsLoading(true);
        if (!validateForm()) return;
        // Alert.alert(form.firstName, form.lastName);
        register(setIsLoading, form.location, form.firstName, form.lastName, form.email, form.password);
    };

    return (
        <SafeAreaView>
            <AuthHeader />
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="h-full bg-white rounded-t-[40px] p-6">
                <ScrollView>
                    <Text className="text-2xl font-bold text-center text-gray-800 mb-10">
                        Create A New Account
                    </Text>
                    <View className="flex-row justify-between mb-4 gap-2">
                        <View className="flex-1">
                            <TextInput
                                placeholder="First Name"
                                value={form.firstName}
                                onChangeText={(text) => handleChange("firstName", text)}
                                className={`border px-3 py-4 rounded-md bg-white ${errors.firstName ? "border-red-500" : "border-gray-300"}`}
                            />
                            {errors.firstName && (
                                <Text className="text-red-500 text-xs mt-1">{errors.firstName}</Text>
                            )}
                        </View>

                        <View className="flex-1 mr-1">
                            <TextInput
                                placeholder="Last Name"
                                value={form.lastName}
                                onChangeText={(text) => handleChange("lastName", text)}
                                className={`border px-3 py-4 rounded-md bg-white ${errors.lastName ? "border-red-500" : "border-gray-300"}`}
                            />
                            {errors.lastName && (
                                <Text className="text-red-500 text-xs mt-1">{errors.lastName}</Text>
                            )}
                        </View>
                    </View>

                    <View className="mb-4 mr-1">
                        <TextInput
                            placeholder="Email"
                            value={form.email}
                            onChangeText={(text) => handleChange("email", text)}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            className={`border px-3 py-4 rounded-md bg-white ${errors.email ? "border-red-500" : "border-gray-300"}`}
                        />
                        {errors.email && (
                            <Text className="text-red-500 text-xs mt-1">{errors.email}</Text>
                        )}
                    </View>

                    <View className={`${!errors.location ? "mb-4" : "mb-9"} mr-1 max-h-14`}>
                        <View
                            className="rounded-xl overflow-hidden"
                            style={errors.location ? { borderColor: "#eF4444", borderWidth: 1 } : { borderColor: "#d1d5db", borderWidth: 1 }}
                        >
                            <Picker
                                selectedValue={form.location}
                                onValueChange={(value) => handleChange("location", value)}
                            >
                                <Picker.Item label="Select Location" value={""} color="#6b7280" />
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
                            <Text className="text-red-500 text-xs mt-1">{errors.location}</Text>
                        )}
                    </View>

                    <View className="mb-4 mr-1">
                        <TextInput
                            placeholder="Password"
                            value={form.password}
                            onChangeText={(text) => handleChange("password", text)}
                            secureTextEntry={!showPassword}
                            className={`border px-3 py-4 rounded-md bg-white ${errors.password ? "border-red-500" : "border-gray-300"}`}
                        />
                        {errors.password && (
                            <Text className="text-red-500 text-xs mt-1">{errors.password}</Text>
                        )}
                    </View>

                    <View className="mb-4 mr-1">
                        <TextInput
                            placeholder="Confirm Password"
                            value={form.confirmPassword}
                            onChangeText={(text) => handleChange("confirmPassword", text)}
                            secureTextEntry
                            className={`border px-3 py-4 rounded-md bg-white ${errors.confirmPassword ? "border-red-500" : "border-gray-300"}`}
                        />
                        {errors.confirmPassword && (
                            <Text className="text-red-500 text-xs mt-1">{errors.confirmPassword}</Text>
                        )}
                    </View>

                    <View className="mb-4">
                        <View className="flex-row items-center -ml-2.5">
                            <TouchableOpacity onPress={() => setAcceptTerms(!acceptTerms)}>
                                <Checkbox color="#15803d" status={acceptTerms ? "checked" : "unchecked"} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setAcceptTerms(!acceptTerms)}>
                                <Text className="text-gray-600 text-center">
                                    Accept{" "}

                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => { setModalVisible(true); setChoice("terms") }}>
                                <Text className="text-green-700 font-semibold">Terms of Service</Text>
                            </TouchableOpacity>
                            <Text> and </Text>
                            <TouchableOpacity onPress={() => { setModalVisible(true); setChoice("privacy") }}>
                                <Text className="text-green-700 font-semibold">Privacy Policy</Text>
                            </TouchableOpacity>
                        </View>
                        {errors.terms && (
                            <Text className="text-red-500 text-xs mt-1">{errors.terms}</Text>
                        )}
                    </View>

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
                <BlurView intensity={100} tint="dark" className="flex-1 justify-center items-center">
                    <View className="bg-white rounded-xl p-6 w-11/12 m-10">
                        {choice === "terms" ? (
                            <TermsOfService source={"register"} close={() => setModalVisible(false)} />
                        ) : (
                            <Privacy source={"register"} close={() => setModalVisible(false)} />
                        )}
                    </View>
                </BlurView>
            </Modal>
        </SafeAreaView >
    );
}
