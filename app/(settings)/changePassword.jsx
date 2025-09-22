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

            // Step 1: Re-authenticate with current password
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);

            // Step 2: Update to new password
            await updatePassword(user, newPassword);

            Toast.show({ type: "success", text1: "Password updated successfully" });

            // Clear fields
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

            <Text className="mb-2 text-gray-700 font-bold">Current Password</Text>
            <TextInput
                placeholder="Enter Current Password"
                secureTextEntry
                value={currentPassword}
                onChangeText={setCurrentPassword}
                className="border border-gray-300 rounded-md p-6 mb-4 text-black bg-[#F9F9F9]"
            />
            <Text className="mb-2 text-gray-700 font-bold">New Password</Text>
            <TextInput
                placeholder="Enter New Password"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
                className="border border-gray-300 rounded-md p-6 mb-4 text-black bg-[#F9F9F9]"
            />
            <Text className="mb-2 text-gray-700 font-bold">Confirm Password</Text>
            <TextInput
                placeholder="Confirm Password"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                className="border border-gray-300 rounded-md p-6 mb-4 text-black bg-[#F9F9F9]"
            />

            <View className="flex-1 justify-end mb-8">
                <TouchableOpacity disabled={isLoading} onPress={handleUpdatePassword} className={`py-5 rounded-xl mb-2 ${isLoading ? "bg-gray-400" : "bg-green-700"}`}>
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
