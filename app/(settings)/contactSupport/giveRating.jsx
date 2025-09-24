import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { Divider } from 'react-native-paper';
import { router } from 'expo-router';
import { db, auth } from '../../../firebase/firebaseConfig';
import { ref, push, serverTimestamp, get, set } from 'firebase/database';

export default function GiveRatingScreen() {
    const [rating, setRating] = useState(0);
    const [email, setEmail] = useState(auth?.currentUser.email);
    const [review, setReview] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRating = (rate) => {
        setRating(rate);
    };


    const handleSubmit = async () => {
        if (!rating) {
            Alert.alert("Error", "Please select a rating.");
            return;
        }
        if (!email.trim()) {
            Alert.alert("Error", "Please enter your email.");
            return;
        }

        setLoading(true);

        try {
            const reviewsRef = ref(db, "reviews");
            const snapshot = await get(reviewsRef);

            // count existing reviews
            let newIdNumber = 1;
            if (snapshot.exists()) {
                newIdNumber = Object.keys(snapshot.val()).length + 1;
            }

            // format ID like 00001
            const newId = String(newIdNumber).padStart(5, "0");

            // save review under /reviews/{newId}
            const reviewRef = ref(db, `reviews/${newId}`);
            await set(reviewRef, {
                rating,
                message: review || "No message provided",
                email,
                created_at: new Date().toISOString().split("T")[0],
                timestamp: serverTimestamp(),
            });

            Alert.alert("Success", "Thank you for your feedback!");
            setRating(0);
            setEmail("");
            setReview("");
            router.replace("/(settings)/contactSupport");
        } catch (error) {
            console.error("Error saving review:", error);
            Alert.alert("Error", "Could not submit your review. Please try again.");
        } finally {
            setLoading(false);
        }
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
                keyboardType="email-address"
            />

            <Text className="text-lg text-gray-600 mb-2">Your Review</Text>
            <TextInput
                value={review}
                onChangeText={setReview}
                className="p-3 rounded-lg h-24 mb-4 bg-[#F9F9F9]"
                placeholder="Tell us more about your experience (optional)"
                multiline
            />

            <TouchableOpacity
                className={`p-4 rounded-lg ${loading ? "bg-gray-400" : "bg-green-600"}`}
                onPress={handleSubmit}
                disabled={loading}
            >
                <Text className="text-white text-center">{loading ? "Submitting..." : "SUBMIT"}</Text>
            </TouchableOpacity>
        </View>
    );
}
