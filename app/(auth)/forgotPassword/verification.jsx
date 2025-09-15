import React, { useRef, useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import AuthHeader from '../../../components/ui/AuthHeader';
import { fs } from '../../../firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { router, useLocalSearchParams } from 'expo-router';
import { generate_otp } from '../../../services/apiService';

export default function CodeVerificationScreen() {
    const { email } = useLocalSearchParams();

    const [isLoading, setIsLoading] = useState(false)
    const [code, setCode] = useState(['', '', '', '', '']);
    const [timer, setTimer] = useState(300);
    const inputs = useRef([]);


    useEffect(() => {
        if (timer === 0) return;
        const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
        return () => clearInterval(interval);
    }, [timer]);

    const handleChange = (value, index) => {
        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        if (value && index < 4) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleResend = async () => {
        setTimer(300);
        const result = await generate_otp(email)
    };

    const verifyCode = async () => {
        setIsLoading(true)
        const verificationRef = doc(fs, "otp-verification", email.replace(".", "_"));

        const verificationSnap = await getDoc(verificationRef);
        const data = verificationSnap.data();

        if (code.join('') === data.otp) {
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
        <View className="flex-1 bg-white px-6">
            <AuthHeader textHeader={"Code Verification"} />

            <Text className="text-sm text-gray-600 mb-6 text-center">
                Please input the verification code sent to your email.
            </Text>
            <View className="flex items-start mx-auto">
                <View className="flex-row justify-between w-4/5 mb-3">
                    {code.map((digit, idx) => (
                        <TextInput
                            key={idx}
                            ref={(ref) => (inputs.current[idx] = ref)}
                            className="w-12 h-14 border border-gray-300 rounded-md text-center text-lg"
                            keyboardType="number-pad"
                            maxLength={1}
                            value={digit}
                            onChangeText={(value) => handleChange(value, idx)}
                        />
                    ))}
                </View>
                <Text className="text-red-500 mb-6">Time remaining: {formatTime(timer)}</Text>
            </View>

            <TouchableOpacity disabled={isLoading} onPress={() => verifyCode()} className="bg-green-700 py-5 rounded-md w-full mb-3">
                <View className="h-5">
                    {!isLoading ? (
                        <Text className="text-white text-center font-semibold">Verify Code</Text>
                    ) : (
                        <ActivityIndicator size="small" color="white" />
                    )}
                </View>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={handleResend}
                disabled={timer !== 0}
                className={`border py-5 rounded-md w-full ${timer === 0 ? 'border-gray-500' : 'border-gray-300 opacity-50'}`}
            >
                <Text className={`text-center font-medium ${timer === 0 ? 'text-gray-700' : 'text-gray-400'}`}>
                    Resend Code
                </Text>
            </TouchableOpacity>
        </View>
    );
}

function formatTime(seconds) {
    const m = String(Math.floor(seconds / 60)).padStart(1, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
}
