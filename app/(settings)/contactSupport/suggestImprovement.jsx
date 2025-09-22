import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';

export default function SuggestImprovementScreen() {
    const [email, setEmail] = useState('');
    const [suggestion, setSuggestion] = useState('');

    return (
        <View className="flex-1 bg-white p-10">
            <TouchableOpacity
                onPress={() => router.replace('/(settings)/contactSupport')}
                className="w-10 -ml-5 mb-10"
            >
                <Feather name='arrow-left' size={30} color="#095333" />
            </TouchableOpacity>
            <Text className="text-2xl text-black mb-2">Suggest an improvement</Text>
            <Text className="text-lg text-gray-600 mb-4">We're always looking for ways to get better! Share your ideas to improve the app.</Text>

            <Text className="text-lg text-gray-600 mb-2">Email</Text>
            <TextInput
                value={email}
                onChangeText={setEmail}
                className="p-3 rounded-lg mb-4 bg-[#F9F9F9]"
                placeholder="Email Address"
            />

            <Text className="text-lg text-gray-600 mb-2">Your Suggestion</Text>
            <TextInput
                value={suggestion}
                onChangeText={setSuggestion}
                className="p-3 rounded-lg h-24 mb-4 bg-[#F9F9F9]"
                placeholder="Describe your idea and how it would improve the app."
                multiline
            />

            <TouchableOpacity className="bg-green-600 p-4 rounded-lg">
                <Text className="text-white text-center">SUBMIT</Text>
            </TouchableOpacity>
        </View>
    );
}
