import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { db, fs } from '../../../firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { router, useLocalSearchParams } from 'expo-router';
import { generate_otp } from '../../../services/apiService';
import { Feather } from '@expo/vector-icons';
import OTPTextInput from "react-native-otp-textinput";
import useAuth from '../../../hooks/useAuth';
import { get, ref, update } from 'firebase/database';
import SuccessModal from '../../../components/Modals/SuccessModal';

export default function CodeVerificationScreen() {
    const { email, from, uid } = useLocalSearchParams();
    const { logout } = useAuth();

    const [isLoading, setIsLoading] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [otp, setOtp] = useState("");
    const [timer, setTimer] = useState(300);

    useEffect(() => {
        if (timer === 0) return;
        const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
        return () => clearInterval(interval);
    }, [timer]);

    const handleResend = async () => {
        setTimer(300);
        const result = await generate_otp(email)
    };

    const verifyCode = async () => {
        setIsLoading(true)
        const verificationRef = doc(fs, "otp-verification", email.replace(".", "_"));

        const verificationSnap = await getDoc(verificationRef);
        const data = verificationSnap.data();

        if (otp === data.otp) {
            if (from === "login" && uid) {
                const userRef = ref(db, 'users/' + uid);
                const userVerificationSnap = await get(userRef);

                if (!userVerificationSnap.exists()) {
                    throw new Error("User data not found.");
                }
                await update(userRef, { verified: true });
                setShowSuccess(true);
            } else {
                router.navigate({
                    pathname: "/forgotPassword/resetpassword",
                    params: { email }
                })
            }
        } else {
            Alert.alert("Error", "OTP is incorrect.")
        }
        setIsLoading(false)
    }

    function obfuscateEmail(email) {
        if (!email || !email.includes('@')) return email;

        const [local, domain] = email.split('@');

        // If local part is 3 chars or less, show all + ***
        if (local.length <= 3) {
            return `${local}***@${domain}`;
        }

        // Otherwise, show first 3 chars + *** + @domain
        return `${local.slice(0, 3)}***@${domain}`;
    }

    const handleOnBackPress = () => {
        if (from === "login" || from === "index") {
            router.replace("/(auth)/login")
            logout();
        } else {
            router.back()
        }
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            className="flex-1"
        >
            <View className="h-full px-6 pt-8 bg-white">
                <TouchableOpacity
                    onPress={handleOnBackPress}
                    className="w-10 -ml-1 my-10"
                >
                    <Feather name='arrow-left' size={30} color="#095333" />
                </TouchableOpacity>
                <Text className="text-2xl font-bold text-gray-800 mb-2">
                    Code Verification
                </Text>
                <View className="mb-40">
                    {from === 'login' ? (
                        <Text className="text-gray-500">
                            Please enter the 6-digit verification code sent to
                            your email address. If you don't see it, please check
                            your spam or junk folder.
                        </Text>
                    ) : (
                        <Text className="text-gray-500">
                            Please enter the 6-digit verification code sent to your email
                            address <Text className="font-semibold">{obfuscateEmail(email)}</Text>.
                        </Text>
                    )}
                </View>

                {/* OTP Input */}

                <OTPTextInput
                    inputCount={5}
                    handleTextChange={(code) => setOtp(code)}
                    containerStyle={{ marginBottom: 20 }}
                    textInputStyle={{
                        borderBottomWidth: 2,
                        fontSize: 20,
                        fontWeight: "600",
                    }}
                />
                <Text className="text-red-500 mb-6">Time remaining: {formatTime(timer)}</Text>

                <View className="flex-row justify-center mt-3 mb-8">
                    <Text className="text-gray-600">Didn’t receive code? </Text>
                    <TouchableOpacity disabled={timer <= 0} onPress={handleResend}>
                        <Text className="text-green-700 font-semibold">
                            Resend Now
                        </Text>
                    </TouchableOpacity>
                </View>
                <View className="flex-1 justify-end mb-8">
                    <TouchableOpacity
                        onPress={verifyCode}
                        className="bg-green-700 py-4 rounded-xl mb-3 mt-6 "
                        disabled={isLoading || otp.length < 5}
                    >
                        {!isLoading ? (
                            <Text className=" text-white text-center font-semibold">
                                Proceed
                            </Text>
                        ) : (
                            <ActivityIndicator size="small" color="white" />
                        )}
                    </TouchableOpacity>
                </View>
            </View>
            {showSuccess && (
                <SuccessModal visible={showSuccess} onClose={() => setShowSuccess(false)} />
            )}
        </KeyboardAvoidingView>
    );
}

function formatTime(seconds) {
    const m = String(Math.floor(seconds / 60)).padStart(1, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
}