import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { db } from '@/firebase/firebaseConfig';
import { router, useLocalSearchParams } from 'expo-router';
import { generate_otp, verify_otp } from '@/services/apiService';
import { Feather } from '@expo/vector-icons';
import OTPTextInput from "react-native-otp-textinput";
import { ref, set } from 'firebase/database';
import SuccessModal from '@/components/Modals/SuccessModal';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../../../firebase/firebaseConfig';
import Toast from 'react-native-toast-message';

export default function CodeVerificationScreen() {

    const saveUserDetails = async (user_id, location, email, first_name, last_name, role) => {
        const userRef = ref(db, "users/" + user_id);
        const now = new Date();
        const offsetDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
        set(userRef, {
            email: email,
            first_name: first_name,
            last_name: last_name,
            location: location,
            role: role,
            created_at: offsetDate.toISOString(),
            notify_smart_recommendation: false,
            notify_high_usage_alerts: false,
            notify_system_updates: false,
        });
    }

    const { email, from, firstName, lastName, password, location } = useLocalSearchParams();

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
        try {
            await generate_otp(email, true);
            Toast.show({
                type: "success",
                text1: "OTP Resent",
                text2: `OTP sent to ${email}`,
            });
        } catch (e) {
            console.error('Resend OTP error:', e);
            Alert.alert('Error', 'Failed to resend OTP.');
        }
    };

    const verifyCode = async () => {
        setIsLoading(true);
        try {
            const result = await verify_otp(email, otp);

            if (!result.success) {
                Alert.alert("Error", result.message || "OTP is incorrect.");
                setIsLoading(false);
                return;
            }

            if (from === "forgotPassword") {
                router.navigate({
                    pathname: "/forgotPassword/resetpassword",
                    params: { email },
                });
            } else if (from === "register") {

                const res = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(res.user, { displayName: firstName + " " + lastName });

                await saveUserDetails(res.user.uid, location, email, firstName, lastName, "user");

                Toast.show({
                    type: "success",
                    text1: "Registration Successful",
                    text2: "You can now log in.",
                });

                router.replace("/(auth)/login");
            }
        } catch (e) {
            console.error(e);
            Alert.alert("Error", "Something went wrong.");
        }
        setIsLoading(false);
    };


    function obfuscateEmail(email) {
        if (!email || !email.includes('@')) return email;

        const [local, domain] = email.split('@');

        if (local.length <= 3) {
            return `${local}***@${domain}`;
        }

        return `${local.slice(0, 3)}***@${domain}`;
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            className="flex-1"
        >
            <View className="h-full px-6 pt-8 bg-white">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 -ml-1 my-10"
                >
                    <Feather name='arrow-left' size={30} color="#095333" />
                </TouchableOpacity>
                <Text className="text-2xl font-bold text-gray-800 mb-2">
                    Code Verification
                </Text>
                <View className="mb-40">
                    {from === "register" ? (
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