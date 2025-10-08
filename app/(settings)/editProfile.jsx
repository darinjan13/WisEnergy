import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView } from "react-native";
import { auth } from "../../firebase/firebaseConfig";
import { useEffect, useState } from "react";
import { updateProfile } from "firebase/auth";
import Toast from "react-native-toast-message";
import { useRouter } from "expo-router";
import { Feather, Fontisto } from "@expo/vector-icons";

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
        <KeyboardAvoidingView behavior="padding" className="flex-1 bg-white p-10">
            <TouchableOpacity
                onPress={() => router.back()}
                className="w-10 -ml-5 mb-10"
            >
                <Feather name='arrow-left' size={30} color="#095333" />
            </TouchableOpacity>
            <View className="flex-1 bg-white">
                <Text className="text-3xl font-extrabold text-gray-800 mb-10">Edit Profile</Text>
                <Text className="mb-2 text-gray-700 font-bold">First Name</Text>
                <TextInput
                    placeholder="First Name"
                    value={firstName}
                    onChangeText={setFirstName}
                    className="border border-gray-300 rounded-md p-6 mb-4 text-black bg-[#F9F9F9]"
                />
                <Text className="mb-2 text-gray-700 font-bold">Last Name</Text>
                <TextInput
                    placeholder="Last Name"
                    value={lastName}
                    onChangeText={setLastName}
                    className="border border-gray-300 rounded-md p-6 mb-4 text-black bg-[#F9F9F9]"
                />
                <Text className="mb-2 text-gray-700 font-bold">Email Address</Text>
                <View className="flex-row items-center border border-gray-300 rounded-md p-4 bg-[#F9F9F9] mb-6">
                    <TextInput
                        className="flex-1 text-gray-500"
                        editable={false}
                        defaultValue={auth.currentUser.email}
                    />
                    <TouchableOpacity>
                        <Fontisto name="locked" className="mr-2" size={16} color="gray" />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity disabled={isLoading} onPress={handleUpdate} className={`py-5 rounded-xl mb-2 ${isLoading ? "bg-gray-400" : "bg-green-700"}`}>
                    {!isLoading ? (
                        <Text className="text-white text-center font-semibold text-lg">Save Changes</Text>
                    ) : (
                        <ActivityIndicator size="small" color="white" />
                    )}
                </TouchableOpacity>
                <View className="flex-1 justify-end mb-8">

                </View>
            </View>
        </KeyboardAvoidingView>
    );
}
