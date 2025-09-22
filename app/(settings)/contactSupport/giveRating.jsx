import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { Divider } from 'react-native-paper';
import { router } from 'expo-router';

export default function GiveRatingScreen() {
    const [rating, setRating] = useState(0);
    const [email, setEmail] = useState('');
    const [review, setReview] = useState('');

    const handleRating = (rate) => {
        setRating(rate);
    };

    return (
        <View className="flex-1 bg-white p-10">
            <TouchableOpacity
                onPress={() => router.replace('/(settings)/contactSupport')}
                className="w-10 -ml-5 mb-10"
            >
                <Feather name='arrow-left' size={30} color="#095333" />
            </TouchableOpacity>
            <Text className="text-2xl text-black mb-2">Give a rating</Text>
            <Text className="text-lg text-gray-600 mb-4">Thank you for taking the time! We'd love to hear your thoughts.</Text>
            <Divider className="mb-4" />
            <Text className="text-lg text-gray-600 mb-2">Tap the stars to rate your experience:</Text>
            <View className="flex-row mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity key={star} onPress={() => handleRating(star)}>
                        <FontAwesome name={star <= rating ? 'star' : 'star-o'} size={30} color="#FFDD00" />
                    </TouchableOpacity>
                ))}
            </View>

            <Text className="text-lg text-gray-600 mb-2">Email</Text>
            <TextInput
                value={email}
                onChangeText={setEmail}
                className="p-3 rounded-lg mb-4 bg-[#F9F9F9]"
                placeholder="Email Address"
            />

            <Text className="text-lg text-gray-600 mb-2">Your Review</Text>
            <TextInput
                value={review}
                onChangeText={setReview}
                className="p-3 rounded-lg h-24 mb-4 bg-[#F9F9F9]"
                placeholder="Tell us more about your experience (optional)"
                multiline
            />

            <TouchableOpacity className="bg-green-600 p-4 rounded-lg">
                <Text className="text-white text-center">SUBMIT</Text>
            </TouchableOpacity>
        </View>
    );
}
