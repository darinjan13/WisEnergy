import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';

import AuthHeader from "../../../components/ui/AuthHeader";
import { generate_otp } from "../../../services/apiService";
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons } from '@expo/vector-icons';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    setIsLoading(true)
    setErrorMessage("")
    if (!email) {
      setTimeout(() => {
        setIsLoading(false);
        setErrorMessage("Email should not be empty.")
      }, 1000);
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setTimeout(() => {
        setIsLoading(false);
        setErrorMessage("Please enter a valid email!s")
      }, 1000);
    } else {
      const result = await generate_otp(email)
      if (result.success)
        router.navigate({
          pathname: '/forgotPassword/verification',
          params: { email },
        });
      else {
        setErrorMessage(result.message)
        setIsLoading(false)
      }
    }
  };

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
            Forgot Your Password?
          </Text>
          <Text className="text-gray-500 mb-6">
            Please enter your registered email address & we sent an OTP
            Verification code to reset your password.
          </Text>

          <Text className="mb-2 text-gray-700 font-bold text-2xl">Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Enter Email Address"
            keyboardType="email-address"
            autoCapitalize="none"
            className="border border-gray-300 rounded-md p-4 mb-2 bg-gray-200"
          />
          {errorMessage ? (
            <Text className="text-red-500 text-sm mb-2">{errorMessage}</Text>
          ) : null}
          <View className="flex-1 justify-end mb-8">

            <TouchableOpacity
              onPress={handleContinue}
              className="bg-gray-200 py-4 rounded-xl mb-3 mt-6 border border-green-700 "
              disabled={isLoading}
            >
              {!isLoading ? (
                <Text className="text-green-700 text-center font-bold text-xl">
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
