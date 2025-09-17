import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { auth } from "../../../firebase/firebaseConfig";
import { useEffect, useState } from "react";
import { updateProfile } from "firebase/auth";
import Toast from "react-native-toast-message";
import { useRouter } from "expo-router";

export default function EditProfile() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");

    useEffect(() => {
        if (auth.currentUser) {
            const displayName = auth.currentUser.displayName || "";
            const parts = displayName.trim().split(" ");

            let fName = "";
            let lName = "";

            if (parts.length === 1) {
                fName = parts[0];
            } else if (parts.length > 1) {
                fName = parts.slice(0, -1).join(" ");
                lName = parts[parts.length - 1];
            }

            setFirstName(fName);
            setLastName(lName);
        }
    }, []);

    const handleUpdate = async () => {
        setIsLoading(true)
        try {
            await updateProfile(auth.currentUser, {
                displayName: `${firstName} ${lastName}`
            })
            Toast.show({
                type: "success",
                text1: "Update Successful",
                text2: "Profile Updated Successfully"
            });
        } catch (e) {
            console.log(e);
            Toast.show({
                type: "error",
                text1: "Update Failed",
            });
        } finally {
            setIsLoading(false)
        }

    }

    return (
        <View className="flex-1 bg-white px-6 pt-10">
            <Text className="text-xl font-bold text-gray-800 mb-6">Edit Profile</Text>

            <TextInput
                placeholder="First Name"
                value={firstName}
                onChangeText={setFirstName}
                className="border border-gray-300 rounded-md px-4 py-3 mb-4 text-gray-800"
            />
            <TextInput
                placeholder="Last Name"
                value={lastName}
                onChangeText={setLastName}
                className="border border-gray-300 rounded-md px-4 py-3 mb-4 text-gray-800"
            />
            <TextInput
                placeholder="Email"
                editable={false}
                defaultValue={auth.currentUser.email}
                className="border border-gray-300 rounded-md px-4 py-3 mb-6 text-gray-800"
            />

            <TouchableOpacity disabled={isLoading} onPress={handleUpdate} className={`py-5 rounded-md mb-2 ${isLoading ? "bg-gray-400" : "bg-green-700"}`}>
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
