import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';

export default function ReportBugScreen() {
    const [email, setEmail] = useState('');
    const [bugDescription, setBugDescription] = useState('');

    return (
        <View className="flex-1 bg-white p-10">
            <TouchableOpacity
                onPress={() => router.replace('/(settings)/contactSupport')}
                className="w-10 -ml-5 mb-10"
            >
                <Feather name='arrow-left' size={30} color="#095333" />
            </TouchableOpacity>
            <Text className="text-2xl text-black mb-2">Report a bug</Text>
            <Text className="text-lg text-gray-600 mb-4">Please describe the bug you encountered. Be as specific as possible, including steps to reproduce the issue.</Text>

            <Text className="text-lg text-gray-600 mb-2">Email</Text>
            <TextInput
                value={email}
                onChangeText={setEmail}
                className="p-3 rounded-lg mb-4 bg-[#F9F9F9]"
                placeholder="Email Address"
            />

            <Text className="text-lg text-gray-600 mb-2">Bug Description</Text>
            <TextInput
                value={bugDescription}
                onChangeText={setBugDescription}
                className="p-3 rounded-lg h-24 mb-4 bg-[#F9F9F9]"
                placeholder="e.g., The app crashes when I tap X after doing Y. Happens every time."
                multiline
            />

            <TouchableOpacity className="bg-green-600 p-4 rounded-lg">
                <Text className="text-white text-center">SUBMIT</Text>
            </TouchableOpacity>
        </View>
    );
}
