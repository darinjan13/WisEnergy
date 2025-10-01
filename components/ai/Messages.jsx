import React, { useEffect, useState } from "react";
import { View, Text, useWindowDimensions } from "react-native";
import Carousel from "react-native-reanimated-carousel";

const AIInsightsCarousel = ({ insights }) => {
    const { width } = useWindowDimensions();
    const [heights, setHeights] = useState({});
    return (
        <Carousel
            loop
            width={width - 80}
            height={Math.max(...Object.values(heights))} // use tallest card, min 120
            autoPlay={false}
            data={insights}
            scrollAnimationDuration={400}
            modeConfig={{
                snapDirection: "left",
                stackInterval: 18,
            }}
            renderItem={({ item, index }) => (
                <View
                    key={index}
                    style={{
                        backgroundColor: "white",
                        borderRadius: 20,
                        padding: 16,
                        justifyContent: "center",
                    }}
                    onLayout={(e) => {
                        const { height } = e.nativeEvent.layout;
                        setHeights((prev) => ({ ...prev, [index]: height }));
                    }}
                >
                    <Text className="text-gray-600 text-sm">{item}</Text>
                </View>
            )}
        />
    );
};

export default AIInsightsCarousel;
