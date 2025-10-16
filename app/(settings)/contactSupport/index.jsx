import { AntDesign, Entypo, Feather, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { View, Text, TouchableOpacity } from 'react-native';
import { Divider } from 'react-native-paper';

export default function FeedbackScreen() {

    return (
        <View className="flex-1 bg-gray-100 p-10 mt-10">
            <TouchableOpacity
                onPress={() => router.back()}
                className="w-10 -ml-5 mb-10"
            >
                <Feather name='arrow-left' size={30} color="#095333" />
            </TouchableOpacity>
            <View className="mb-4">
                <Text className="text-gray-800 text-2xl">Help & Feedback</Text>
                <Text className="text-gray-800 text-base">Your feedback helps us improve!</Text>
            </View>
            <Divider />
            <Text className="text-gray-800 text-lg mt-10 mb-6">What type of feedback do you have?</Text>

            <View className="mb-10">
                <TouchableOpacity
                    className="bg-green-600 p-4 rounded-lg mb-5 flex-row justify-between items-center"
                    onPress={() => router.replace('/(settings)/contactSupport/giveRating')}
                >
                    <View className="flex-row items-center">
                        <Entypo name="star-outlined" size={24} color="white" className="mr-4" />
                        <Text className="text-white text-lg">Give a rating</Text>
                    </View>
                    <Entypo name="chevron-thin-right" size={30} color="white" className="" />
                </TouchableOpacity>

                <TouchableOpacity
                    className="bg-green-600 p-4 rounded-lg mb-5 flex-row justify-between items-center"
                    onPress={() => router.replace('/(settings)/contactSupport/reportBug')}
                >
                    <View className="flex-row items-center">
                        <Ionicons name="bug-outline" size={24} color="white" className="mr-4" />
                        <Text className="text-white text-lg">Report a bug</Text>
                    </View>
                    <Entypo name="chevron-thin-right" size={30} color="white" className="" />
                </TouchableOpacity>

                <TouchableOpacity
                    className="bg-green-600 p-4 rounded-lg mb-5 flex-row justify-between items-center"
                    onPress={() => router.replace('/(settings)/contactSupport/suggestImprovement')}
                >
                    <View className="flex-row items-center">
                        <AntDesign name="like" size={24} color="white" className="mr-4" />
                        <Text className="text-white text-lg">Suggest an improvement</Text>
                    </View>
                    <Entypo name="chevron-thin-right" size={30} color="white" className="" />
                </TouchableOpacity>

                <TouchableOpacity
                    className="bg-green-600 p-4 rounded-lg mb-5 flex-row justify-between items-center"
                    onPress={() => router.replace('/(settings)/contactSupport/askQuestions')}
                >
                    <View className="flex-row items-center">
                        <FontAwesome5 name="question-circle" size={24} color="white" className="mr-4" />
                        <Text className="text-white text-lg">Ask a question</Text>
                    </View>
                    <Entypo name="chevron-thin-right" size={30} color="white" className="" />
                </TouchableOpacity>
            </View>
        </View>
    );
}
