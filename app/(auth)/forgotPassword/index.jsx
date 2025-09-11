import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';

import AuthHeader from "../../../components/ui/AuthHeader";
import { generate_otp } from "../../../services/apiService";
import { router } from 'expo-router';

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
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 items-center bg-white px-6"
    >
      <View className="h-full w-full bg-white">
        <AuthHeader textHeader={"Forgot Password"} />

        <Text className="mb-2 text-gray-700">Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email address"
          keyboardType="email-address"
          autoCapitalize="none"
          className="border border-gray-300 rounded-md p-5"
        />
        {errorMessage && (
          <Text className="text-red-500 text-sm mt-1">{errorMessage}</Text>
        )}
        <TouchableOpacity
          onPress={handleContinue}
          className="bg-green-700 py-5 rounded-md mb-3 mt-6"
          disabled={isLoading}
        >
          <View className="h-5">
            {!isLoading ? (
              <Text className="text-white text-center font-semibold">Continue</Text>
            ) : (
              <ActivityIndicator size="small" color="white" />
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-gray-200 py-5 rounded-md"
        >
          <Text className="text-gray-700 text-center font-semibold">Cancel</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
