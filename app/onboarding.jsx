import React, { useEffect, useRef, useState } from "react";
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    FlatList,
    Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const slides = [
    {
        id: "1",
        title: "Welcome to WisEnergy!",
        description:
            "WisEnergy is your all-in-one partner for smarter living. Our app helps you monitor, manage, and optimize your household’s electricity use so you can save money while supporting a more sustainable lifestyle.",
        image: require("../assets/images/Onboarding-1.png"),
    },
    {
        id: "2",
        title: "Track Appliances in Real Time",
        description:
            "Always know exactly how much power your appliances are consuming. From air conditioners to washing machines, WisEnergy keeps you in control wherever you are.",
        image: require("../assets/images/Onboarding-2.png"),
    },
    {
        id: "3",
        title: "Know Your Energy Usage",
        description:
            "Understand your household’s energy patterns with easy-to-read daily, weekly, and monthly reports. Identify which appliances consume the most electricity and discover opportunities to cut costs.",
        image: require("../assets/images/Onboarding-3.png"),
    },
    {
        id: "4",
        title: "Stay on Monthly Budget",
        description:
            "Take charge of your electricity spending by setting a monthly budget. WisEnergy tracks your progress and alerts you before you overshoot, making it easier to plan and save every billing cycle.",
        image: require("../assets/images/Onboarding-4.png"),
    },
    {
        id: "5",
        title: "Smarter Savings with AI",
        description:
            "Get personalized recommendations designed to lower your energy bills. WisEnergy also sends real-time alerts when appliances consume unusual amounts of power, helping you prevent costly surprises.",
        image: require("../assets/images/Onboarding-5.png"),
    },
];

export default function Onboarding() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef(null);
    const router = useRouter();

    const finishOnboarding = async () => {
        await AsyncStorage.setItem("onboardingSeen", "true");
        router.replace("/(auth)/login");
    };

    const handleNext = () => {
        if (currentIndex < slides.length - 1) {
            flatListRef.current.scrollToIndex({ index: currentIndex + 1 });
        } else {
            finishOnboarding();
        }
    };

    const handleSkip = () => {
        finishOnboarding();
    };

    return (
        <SafeAreaView>
            <View className="h-full bg-white">
                {/* Skip button */}
                <TouchableOpacity
                    className={`${currentIndex === 4 && "hidden"} absolute top-12 right-6 z-10`}
                    onPress={handleSkip}

                >
                    <Text className="bg-green-700 p-5 rounded-xl text-white font-semibold">Skip</Text>
                </TouchableOpacity>

                {/* Slides */}
                <FlatList
                    data={slides}
                    ref={flatListRef}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.id}
                    onMomentumScrollEnd={(e) => {
                        const index = Math.round(e.nativeEvent.contentOffset.x / width);
                        setCurrentIndex(index);
                    }}
                    renderItem={({ item }) => (
                        <View className="w-full items-center overflow-hidden" style={{ width }}>
                            <Image
                                source={item.image}
                                resizeMode="contain"
                                className="h-[60%] w-fit rounded-b-full"
                            />
                            <View className="flex-1 justify-center p-6">
                                <Text className="text-green-700 text-4xl font-bold text-center mb-4 px-5">
                                    {item.title}
                                </Text>
                                <Text className="text-gray-600 text-center text-lg">{item.description}</Text>
                            </View>
                        </View>
                    )}
                />

                {/* Dots Indicator */}
                <View className="flex-row justify-center mt-4">
                    {slides.map((_, i) => (
                        <View
                            key={i}
                            className={`h-2 w-2 mx-1 rounded-full ${i === currentIndex ? "bg-green-700" : "bg-gray-300"
                                }`}
                        />
                    ))}
                </View>

                {/* Next / Done button */}
                <TouchableOpacity
                    className="bg-green-700 mx-6 my-8 py-3 rounded-xl items-center"
                    onPress={handleNext}
                >
                    <Text className="text-white font-semibold text-lg">
                        {currentIndex === slides.length - 1 ? "Get Started" : "Next"}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
