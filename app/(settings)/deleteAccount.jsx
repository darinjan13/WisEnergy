import { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { auth } from "../../firebase/firebaseConfig";

export default function DeleteAccount() {
    const router = useRouter();
    const [confirmText, setConfirmText] = useState("");

    const handleDelete = () => {
        const email = auth.currentUser?.email;
        if (confirmText === email) {
            // TODO: Add Firebase delete account logic here
            Alert.alert("Account Deleted", "Your account has been permanently removed.");
            router.replace("/(auth)/login"); // Redirect after deletion
        } else {
            Alert.alert("Error", `You must type ${email} exactly.`);
        }
    };

    useEffect(() => {
        console.log(confirmText);

    }, [confirmText])

    return (
        <KeyboardAvoidingView behavior="padding" className="flex-1 bg-white p-10">
            <TouchableOpacity
                onPress={() => router.back()}
                className="w-10 -ml-5 mb-10"
            >
                <Feather name='arrow-left' size={30} color="#095333" />
            </TouchableOpacity>

            <Text className="text-2xl font-bold mb-10 text-[#23403A]">
                Delete Account
            </Text>

            <Text className="text-gray-700 mb-4">
                We're sad to see you go. So you’re aware, deleting your account will
                permanently remove your account and all progress. You cannot undo this
                action.
            </Text>
            <Text className="text-gray-700 mb-6">
                Enter the word <Text className="font-bold">{auth.currentUser?.email}</Text> below to
                perform this action.
            </Text>

            <Text className="text-gray-800 font-semibold mb-2">Confirm Email</Text>
            <TextInput
                placeholder={auth?.currentUser.email}
                value={confirmText}
                onChangeText={setConfirmText}
                className="border border-gray-300 bg-[#F9F9F9] rounded-md p-6"
            />

            <View className="flex-1 justify-end mb-8">
                <TouchableOpacity
                    onPress={handleDelete}
                    disabled={confirmText !== auth?.currentUser.email}
                    className={`w-full py-5 rounded-xl ${confirmText === auth?.currentUser.email ? "bg-[#BE4949]" : "bg-red-300"
                        }`}
                >
                    <Text className="text-white font-semibold text-center">
                        Delete My Account
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}
