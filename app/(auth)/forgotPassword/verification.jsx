import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { fs } from '../../../firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { router, useLocalSearchParams } from 'expo-router';
import { generate_otp } from '../../../services/apiService';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import OTPTextInput from "react-native-otp-textinput";

export default function CodeVerificationScreen() {
    const { email } = useLocalSearchParams();

    const [isLoading, setIsLoading] = useState(false)
    const [otp, setOtp] = useState("");
    // const [code, setCode] = useState(['', '', '', '', '']);
    const [timer, setTimer] = useState(300);
    // const inputs = useRef([]);


    useEffect(() => {
        if (timer === 0) return;
        const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
        return () => clearInterval(interval);
    }, [timer]);

    // const handleChange = (value, index) => {
    //     const newCode = [...code];
    //     newCode[index] = value;
    //     setCode(newCode);

    //     if (value && index < 4) {
    //         inputs.current[index + 1]?.focus();
    //     }
    // };

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
            router.navigate({
                pathname: "/forgotPassword/resetpassword",
                params: { email }
            })
        } else {
            Alert.alert("Error", "OTP is incorrect.")
        }
        setIsLoading(false)
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            className="flex-1"
        >
            <LinearGradient
                colors={["#FFFFFF", "#095333"]}
                style={{ flex: 1 }}
            >
                <View className="h-full px-6 pt-8">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 -ml-1 mb-10"
                    >
                        <Feather name='arrow-left' size={30} color="#095333" />
                    </TouchableOpacity>
                    <Text className="text-2xl font-bold text-gray-800 mb-2">
                        OTP Verification
                    </Text>
                    <Text className="text-gray-500 mb-8">
                        Please enter the 6-digit verification code sent to your email
                        address <Text className="font-semibold">Tw****@mail.com</Text>.
                    </Text>

                    {/* OTP Input */}

                    <OTPTextInput
                        inputCount={5}
                        handleTextChange={(code) => setOtp(code)}
                        containerStyle={{ marginBottom: 20 }}
                        textInputStyle={{
                            borderBottomWidth: 2,
                            // borderColor: "#15803d",
                            // color: "#111827",
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
                            className="bg-gray-200 py-4 rounded-xl mb-3 mt-6 border border-green-700"
                            disabled={isLoading || otp.length < 5}
                        >
                            {!isLoading ? (
                                <Text className="text-green-700 text-center font-semibold">
                                    Proceed
                                </Text>
                            ) : (
                                <ActivityIndicator size="small" color="green" />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>


            </LinearGradient>

        </KeyboardAvoidingView>
    );
}

function formatTime(seconds) {
    const m = String(Math.floor(seconds / 60)).padStart(1, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
}