import React, { useState } from "react";
import { View, Text, useWindowDimensions } from "react-native";
import Carousel from "react-native-reanimated-carousel";

const AIInsightsCarousel = ({ insights }) => {
    const { width } = useWindowDimensions();
    const [activeIndex, setActiveIndex] = useState(0);

    return (
        <View className="">
            <Carousel
                loop={false}
                width={width - 60}
                height={110}
                autoPlay={false}
                data={insights}
                scrollAnimationDuration={400}
                onProgressChange={(_, absoluteProgress) => {
                    setActiveIndex(Math.round(absoluteProgress));
                }}
                modeConfig={{
                    snapDirection: "left",
                    stackInterval: 18,
                }}
                renderItem={({ item, index }) => (
                    <View
                        key={index}
                        className="bg-white rounded-2xl justify-center"
                    >
                        <Text className="text-gray-600 text-sm">{item}</Text>
                    </View>
                )}
            />

            {/* Pagination dots */}
            <View className="items-center">
                <View
                    className={`flex-row mt-2`}
                >
                    {insights.map((_, i) => (
                        <View
                            key={i}
                            className={`w-2 h-2 rounded-full mx-1 ${i === activeIndex ? "bg-green-500" : "bg-gray-300"}`}
                        />
                    ))}
                </View>
            </View>
        </View>
    );
};

export default AIInsightsCarousel;
