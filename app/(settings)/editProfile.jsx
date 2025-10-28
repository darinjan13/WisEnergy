import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { auth, db } from "@/firebase/firebaseConfig";
import { useEffect, useState } from "react";
import { updateProfile } from "firebase/auth";
import Toast from "react-native-toast-message";
import { useRouter } from "expo-router";
import { Feather, Fontisto } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ref, update } from "firebase/database";
import { format } from "date-fns-tz";

export default function EditProfile() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");

    // Validation errors
    const [firstNameError, setFirstNameError] = useState("");
    const [lastNameError, setLastNameError] = useState("");

    // Load current user's display name
    useEffect(() => {
        if (auth.currentUser && auth.currentUser.displayName) {
            const parts = auth.currentUser.displayName.trim().split(" ");
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

    // Validate First Name
    const validateFirstName = (value) => {
        const trimmed = value.trim();
        if (!trimmed) return "First name is required";
        if (trimmed.length < 2) return "First name must be at least 2 characters";
        if (!/^[a-zA-Z\s-]+$/.test(trimmed)) return "Only letters, spaces, and hyphens allowed";
        return "";
    };

    // Validate Last Name
    const validateLastName = (value) => {
        const trimmed = value.trim();
        if (!trimmed) return "Last name is required";
        if (trimmed.length < 2) return "Last name must be at least 2 characters";
        if (!/^[a-zA-Z\s-]+$/.test(trimmed)) return "Only letters, spaces, and hyphens allowed";
        return "";
    };

    // Update errors on input change
    useEffect(() => {
        setFirstNameError(validateFirstName(firstName));
    }, [firstName]);

    useEffect(() => {
        setLastNameError(validateLastName(lastName));
    }, [lastName]);

    // Form is valid only if no errors and fields are filled
    const isFormValid = firstName.trim() && lastName.trim() && !firstNameError && !lastNameError;

    // Handle Save
    const handleUpdate = async () => {
        if (!isFormValid) return;

        setIsLoading(true);
        try {
            const displayName = `${firstName.trim()} ${lastName.trim()}`;
            await updateProfile(auth.currentUser, { displayName });

            const userRef = ref(db, `users/${auth.currentUser.uid}`);
            const updatedAt = format(new Date(), "yyyy-MM-dd", { timeZone: "Asia/Manila" });

            await update(userRef, {
                displayName,
                first_name: firstName.trim(),
                last_name: lastName.trim(),
                updated_at: updatedAt,
            });

            Toast.show({
                type: "success",
                text1: "Update Successful",
                text2: "Profile updated successfully",
            });
        } catch (e) {
            console.error(e);
            Toast.show({
                type: "error",
                text1: "Update Failed",
                text2: "Something went wrong. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };
    const sanitizeName = (value) => {
        return value.replace(/[^a-zA-Z\s-]/g, "");
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "android" ? "padding" : "height"}
            style={{ flex: 1, paddingTop: insets.top + 10 }}
            className="flex-1 bg-white p-10"
        >
            {/* Back Button */}
            <TouchableOpacity onPress={() => router.back()} className="w-10 -ml-5 mb-10">
                <Feather name="arrow-left" size={30} color="#095333" />
            </TouchableOpacity>

            <View className="flex-1 bg-white">
                <Text className="text-3xl font-extrabold text-gray-800 mb-10">Edit Profile</Text>

                {/* First Name */}
                <Text className="mb-2 text-gray-700 font-bold">First Name</Text>
                <TextInput
                    placeholder="First Name"
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholderTextColor="#9CA3AF"
                    autoCapitalize="words"
                    className={`border rounded-md p-6 mb-1 text-black bg-[#F9F9F9] ${firstNameError ? "border-red-500" : "border-gray-300"
                        }`}
                />
                {firstNameError ? <Text className="text-red-500 text-sm mb-3">{firstNameError}</Text> : null}

                {/* Last Name */}
                <Text className="mb-2 text-gray-700 font-bold">Last Name</Text>
                <TextInput
                    placeholder="Last Name"
                    value={lastName}
                    onChangeText={setLastName}
                    placeholderTextColor="#9CA3AF"
                    autoCapitalize="words"
                    className={`border rounded-md p-6 mb-1 text-black bg-[#F9F9F9] ${lastNameError ? "border-red-500" : "border-gray-300"
                        }`}
                />
                {lastNameError ? <Text className="text-red-500 text-sm mb-3">{lastNameError}</Text> : null}

                {/* Email (Read-only) */}
                <Text className="mb-2 text-gray-700 font-bold">Email Address</Text>
                <View className="flex-row items-center border border-gray-300 rounded-md p-4 bg-[#F9F9F9] mb-6">
                    <TextInput
                        className="flex-1 text-gray-500"
                        editable={false}
                        value={auth.currentUser?.email || ""}
                    />
                    <Fontisto name="locked" size={16} color="gray" />
                </View>

                {/* Save Button */}
                <TouchableOpacity
                    disabled={isLoading || !isFormValid}
                    onPress={handleUpdate}
                    className={`py-5 rounded-xl mb-2 ${isLoading || !isFormValid ? "bg-gray-400" : "bg-green-700"
                        }`}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <Text className="text-white text-center font-semibold text-lg">Save Changes</Text>
                    )}
                </TouchableOpacity>

                {/* Push content up */}
                <View className="flex-1" />
            </View>
        </KeyboardAvoidingView>
    );
}