import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView } from "react-native";
import { auth } from "../../firebase/firebaseConfig";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import Toast from "react-native-toast-message";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

export default function ChangePassword() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleUpdatePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Toast.show({ type: "error", text1: "Please fill all fields" });
            return;
        }

        if (newPassword !== confirmPassword) {
            Toast.show({ type: "error", text1: "Passwords do not match" });
            return;
        }

        setIsLoading(true);
        try {
            const user = auth.currentUser;
            if (!user || !user.email) {
                throw new Error("No authenticated user found");
            }

            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPassword);

            Toast.show({ type: "success", text1: "Password updated successfully" });

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error) {
            console.error("Password update error:", error);
            Toast.show({ type: "error", text1: "Failed to update password" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView behavior="padding" className="flex-1 bg-white p-10">
            <TouchableOpacity
                onPress={() => router.back()}
                className="w-10 -ml-5 mb-10"
            >
                <Feather name='arrow-left' size={30} color="#095333" />
            </TouchableOpacity>
            <Text className="text-3xl font-extrabold text-gray-800 mb-10">Change your Password</Text>

            {/* Current Password */}
            <Text className="mb-2 text-gray-700 font-bold">Current Password</Text>
            <View className="relative mb-4">
                <TextInput
                    placeholder="Enter Current Password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showCurrent}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    className="border border-gray-300 rounded-md p-6 pr-12 text-black bg-[#F9F9F9]"
                />
                <TouchableOpacity
                    className="absolute right-5 top-6"
                    onPress={() => setShowCurrent(!showCurrent)}
                >
                    <Feather name={showCurrent ? "eye" : "eye-off"} size={22} color="#6B7280" />
                </TouchableOpacity>
            </View>

            {/* New Password */}
            <Text className="mb-2 text-gray-700 font-bold">New Password</Text>
            <View className="relative mb-4">
                <TextInput
                    placeholder="Enter New Password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showNew}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    className="border border-gray-300 rounded-md p-6 pr-12 text-black bg-[#F9F9F9]"
                />
                <TouchableOpacity
                    className="absolute right-5 top-6"
                    onPress={() => setShowNew(!showNew)}
                >
                    <Feather name={showNew ? "eye" : "eye-off"} size={22} color="#6B7280" />
                </TouchableOpacity>
            </View>

            {/* Confirm Password */}
            <Text className="mb-2 text-gray-700 font-bold">Confirm Password</Text>
            <View className="relative mb-4">
                <TextInput
                    placeholder="Confirm Password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showConfirm}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    className="border border-gray-300 rounded-md p-6 pr-12 text-black bg-[#F9F9F9]"
                />
                <TouchableOpacity
                    className="absolute right-5 top-6"
                    onPress={() => setShowConfirm(!showConfirm)}
                >
                    <Feather name={showConfirm ? "eye" : "eye-off"} size={22} color="#6B7280" />
                </TouchableOpacity>
            </View>

            <View className="flex-1 justify-end mb-8">
                <TouchableOpacity
                    disabled={isLoading}
                    onPress={handleUpdatePassword}
                    className={`py-5 rounded-xl mb-2 ${isLoading ? "bg-gray-400" : "bg-green-700"}`}
                >
                    {!isLoading ? (
                        <Text className="text-white text-center font-semibold text-lg">Save Changes</Text>
                    ) : (
                        <ActivityIndicator size="small" color="white" />
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}
