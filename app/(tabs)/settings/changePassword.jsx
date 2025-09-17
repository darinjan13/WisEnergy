import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { auth } from "../../../firebase/firebaseConfig";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import Toast from "react-native-toast-message";
import { useRouter } from "expo-router";

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
        <View className="flex-1 bg-white px-6 pt-10">
            <Text className="text-xl font-bold text-gray-800 mb-6">Change your Password</Text>

            <TextInput
                placeholder="Current Password"
                secureTextEntry
                value={currentPassword}
                onChangeText={setCurrentPassword}
                className="border border-gray-300 rounded-md px-4 py-3 mb-4 text-gray-800"
            />
            <TextInput
                placeholder="New Password"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
                className="border border-gray-300 rounded-md px-4 py-3 mb-4 text-gray-800"
            />
            <TextInput
                placeholder="Confirm Password"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                className="border border-gray-300 rounded-md px-4 py-3 mb-6 text-gray-800"
            />

            <TouchableOpacity
                disabled={isLoading}
                onPress={handleUpdatePassword}
                className={`py-5 rounded-md mb-2 ${isLoading ? "bg-gray-400" : "bg-green-700"}`}
            >
                <View className="h-5">
                    {!isLoading ? (
                        <Text className="text-white text-center font-semibold">Update</Text>
                    ) : (
                        <ActivityIndicator size="small" color="white" />
                    )}
                </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.back()} className="border border-gray-400 py-5 rounded-md">
                <Text className="text-gray-700 text-center font-semibold">Cancel</Text>
            </TouchableOpacity>
        </View>
    );
}
