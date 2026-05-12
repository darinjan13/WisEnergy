import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { auth, db } from '../../firebase/firebaseConfig';
import { push, ref, set } from 'firebase/database';
import { format } from 'date-fns-tz';

export default function FeedbackForm({ type, title, description, placeholder }) {
    const [email, setEmail] = useState(auth.currentUser?.email || "");
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!email.trim() || !message.trim()) {
            Alert.alert("Error", "Please fill out all fields.");
            return;
        }

        setLoading(true);

        try {
            const reportRef = push(ref(db, "feedback"));
            await set(reportRef, {
                type,
                message,
                email,
                date_created: format(new Date(), "yyyy-MM-dd HH:mm:ss", { timeZone: "PH_TZ" }),
                status: "Open",
            });

            Alert.alert("Success", `Your ${type.toLowerCase()} has been submitted.`);
            setMessage("");
            setEmail(auth.currentUser?.email || "");
            router.replace("/(settings)/contactSupport");
        } catch (error) {
            console.error(`Error submitting ${type.toLowerCase()}:`, error);
            Alert.alert("Error", `Failed to submit ${type.toLowerCase()}. Please try again.`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-white p-10 mt-10">
            <TouchableOpacity
                onPress={() => router.replace('/(settings)/contactSupport')}
                className="w-10 -ml-5 mb-10"
            >
                <Feather name='arrow-left' size={30} color="#095333" />
            </TouchableOpacity>

            <Text className="text-2xl text-black mb-2">{title}</Text>
            <Text className="text-lg text-gray-600 mb-4">{description}</Text>

            <Text className="text-lg text-gray-600 mb-2">Email</Text>
            <TextInput
                value={email}
                onChangeText={setEmail}
                className="p-3 rounded-lg mb-4 bg-[#F9F9F9]"
                placeholder="Email Address"
            />

            <Text className="text-lg text-gray-600 mb-2">{type} Details</Text>
            <TextInput
                value={message}
                onChangeText={setMessage}
                className="p-3 rounded-lg h-24 mb-4 bg-[#F9F9F9]"
                placeholder={placeholder}
                placeholderTextColor="#9CA3AF"
                multiline
            />

            <TouchableOpacity
                className={`p-4 rounded-lg ${loading ? "bg-gray-400" : "bg-green-600"}`}
                onPress={handleSubmit}
                disabled={loading}
            >
                <Text className="text-white text-center">
                    {loading ? "Submitting..." : "SUBMIT"}
                </Text>
            </TouchableOpacity>
        </View>
    );
}
