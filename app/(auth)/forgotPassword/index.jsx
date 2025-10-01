import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { generate_otp } from "../../../services/apiService";
import { router } from 'expo-router';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();

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
      const result = await generate_otp(email, false)
      if (result.success) {
        setIsLoading(false)
        router.navigate({
          pathname: '/forgotPassword/verification',
          params: { email, from: "reset", userRef: null },
        });
      }
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
      <View className="h-full p-6 bg-white">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 -ml-1 my-10"
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

        <Text className="mb-2 text-gray-700 font-bold text-lg">Email</Text>
        <View className="mb-4">
          <View className="flex-row items-center border border-gray-300 rounded-md p-3 bg-gray-100">
            <MaterialIcons name='email' size={18} color="gray" />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter Email Address"
              keyboardType="email-address"
              autoCapitalize="none"
              className="ml-2 flex-1"
            />
          </View>
          {errorMessage && (
            <Text className="text-red-500 text-sm mb-2">{errorMessage}</Text>
          )}
        </View>
        <View className="flex-1 justify-end mb-8">

          <TouchableOpacity
            onPress={handleContinue}
            className="bg-green-700 py-4 rounded-xl mb-3 mt-6 "
            disabled={isLoading}
          >
            {!isLoading ? (
              <Text className="text-white text-center font-bold text-xl">
                Proceed
              </Text>
            ) : (
              <ActivityIndicator size="small" color="white" />
            )}
          </TouchableOpacity>
        </View>

      </View>

    </KeyboardAvoidingView>
  );
}
