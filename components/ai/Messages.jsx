import React, { useState } from "react";
import { View, Text, useWindowDimensions } from "react-native";
import Carousel from "react-native-reanimated-carousel";

const AIInsightsCarousel = ({ insights, from }) => {
    const { width } = useWindowDimensions();
    const [heights, setHeights] = useState({});
    const [activeIndex, setActiveIndex] = useState(0);

    return (
        <View className="">
            <Carousel
                loop={false}
                width={width - 80}
                height={
                    Object.keys(heights).length > 0
                        ? Math.max(...Object.values(heights))
                        : 80
                }
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
                        onLayout={(e) => {
                            const { height } = e.nativeEvent.layout;
                            setHeights((prev) => ({ ...prev, [index]: height }));
                        }}
                    >
                        <Text className="text-gray-600 text-sm">{item}</Text>
                    </View>
                )}
            />

            {/* Pagination dots */}
            <View className="items-center">
                <View
                    className={`flex-row mt-2 ${from === "budget" ? "-ml-10" : "ml-0"
                        }`}
                >
                    {insights.map((_, i) => (
                        <View
                            key={i}
                            className={`w-2 h-2 rounded-full mx-1 ${i === activeIndex ? "bg-green-500" : "bg-gray-300"
                                }`}
                        />
                    ))}
                </View>
            </View>
        </View>
    );
};

export default AIInsightsCarousel;
