import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const navigation = useNavigation();

  const handleContinue = () => {
    // TODO: Call /generate-otp endpoint with the email
    console.log("Email submitted:", email);
    // navigation.navigate('VerificationScreen'); // when ready
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 justify-center items-center bg-white px-6"
    >
      <View className="w-full max-w-sm">
        <Text className="text-green-900 font-bold text-xl mb-6 text-center">
          Forgot Password
        </Text>

        <Text className="mb-2 text-gray-700">Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email address"
          keyboardType="email-address"
          autoCapitalize="none"
          className="border border-gray-300 rounded-md px-4 py-3 mb-6"
        />

        <TouchableOpacity
          onPress={handleContinue}
          className="bg-green-900 py-3 rounded-md mb-3"
        >
          <Text className="text-white text-center font-semibold">Continue</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="bg-gray-200 py-3 rounded-md"
        >
          <Text className="text-gray-700 text-center font-semibold">Cancel</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
