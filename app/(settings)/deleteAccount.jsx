import { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Modal,
    ActivityIndicator,
    Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { auth, db } from "@/firebase/firebaseConfig";
import { ref, update } from "firebase/database";
import { signOut } from "firebase/auth";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function DeleteAccount() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [confirmText, setConfirmText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [deletionDate, setDeletionDate] = useState("");

    const handleDelete = async () => {
        const email = auth.currentUser?.email;
        const uid = auth.currentUser?.uid;

        if (!email || !uid) return;

        if (confirmText !== email) return;

        try {
            setIsDeleting(true);

            const deletion = new Date();
            deletion.setDate(deletion.getDate() + 30);
            const formattedDate = deletion
                .toISOString()
                .replace("T", " ")
                .split(".")[0];
            setDeletionDate(formattedDate);

            const userRef = ref(db, `users/${uid}`);
            await update(userRef, {
                deletion_date: formattedDate,
                notify_smart_recommendation: false,
                notify_high_usage_alerts: false,
                notify_system_updates: false,
            });

            await signOut(auth);
            setShowSuccessModal(true);
        } catch (error) {
            console.error("Error scheduling deletion:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCloseModal = () => {
        setShowSuccessModal(false);
        router.replace("/(auth)/login");
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "android" ? "padding" : "height"} style={{ flex: 1, paddingTop: insets.top + 10 }} className="flex-1 bg-white p-10">
            {/* Header */}
            <TouchableOpacity
                onPress={() => router.back()}
                className="w-10 -ml-5 mb-10"
            >
                <Feather name="arrow-left" size={30} color="#095333" />
            </TouchableOpacity>

            {/* Title */}
            <Text className="text-2xl font-bold mb-10 text-[#23403A]">
                Delete Account
            </Text>

            {/* Description */}
            <Text className="text-gray-700 mb-4">
                We’re sad to see you go. Deleting your account will schedule it for
                permanent removal after 30 days. You can contact support within that
                time if you change your mind.
            </Text>
            <Text className="text-gray-700 mb-6">
                Enter your email{" "}
                <Text className="font-bold">{auth.currentUser?.email}</Text> below to
                confirm.
            </Text>

            {/* Email Confirmation */}
            <Text className="text-gray-800 font-semibold mb-2">Confirm Email</Text>
            <TextInput
                placeholder={auth.currentUser?.email}
                value={confirmText}
                onChangeText={setConfirmText}
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                className="border border-gray-300 bg-[#F9F9F9] rounded-md p-6"
            />

            {/* Delete Button */}
            <View className="flex-1 justify-end mb-8">
                <TouchableOpacity
                    onPress={handleDelete}
                    disabled={confirmText !== auth.currentUser?.email || isDeleting}
                    className={`w-full py-5 rounded-xl ${confirmText === auth.currentUser?.email && !isDeleting
                        ? "bg-[#BE4949]"
                        : "bg-red-300"
                        }`}
                >
                    {!isDeleting ? (
                        <Text className="text-white font-semibold text-center">
                            Delete My Account
                        </Text>
                    ) : (
                        <ActivityIndicator size="small" color="#fff" />
                    )}
                </TouchableOpacity>
            </View>

            {/* ✅ Success Modal */}
            <Modal
                transparent
                animationType="fade"
                visible={showSuccessModal}
                onRequestClose={handleCloseModal}
            >
                <BlurView
                    intensity={60}
                    tint="light"
                    className="flex-1 items-center justify-center bg-black/40"
                >
                    <View className="bg-white rounded-2xl w-80 p-6 items-center shadow-lg">
                        <Feather name="check-circle" size={40} color="#16a34a" />
                        <Text className="text-lg font-bold text-gray-800 mt-3">
                            Account Scheduled for Deletion
                        </Text>
                        <Text className="text-sm text-gray-600 text-center mt-2 mb-4">
                            Your account will be permanently deleted on{" "}
                            <Text className="font-semibold text-gray-800">
                                {deletionDate?.split(" ")[0]}
                            </Text>
                            . You may contact support to restore it before that date.
                        </Text>

                        <TouchableOpacity
                            onPress={handleCloseModal}
                            className="bg-[#166534] w-full py-3 rounded-lg mt-2"
                        >
                            <Text className="text-white font-semibold text-center">
                                Got it
                            </Text>
                        </TouchableOpacity>
                    </View>
                </BlurView>
            </Modal>
        </KeyboardAvoidingView>
    );
}
