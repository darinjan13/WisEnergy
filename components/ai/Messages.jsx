import React from "react";
import { View, Text, Dimensions, ActivityIndicator, useWindowDimensions } from "react-native";
import Carousel from "react-native-reanimated-carousel";

const AIInsightsCarousel = ({ insights }) => {
    const { width, height } = useWindowDimensions();

    return (

        <Carousel
            loop
            width={width - 80} // card width
            height={100} // adjust height as needed
            autoPlay={false} // set true if you want auto sliding
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
                        justifyContent: "center",
                    }}
                >
                    <Text className="text-gray-600 text-sm">{item}</Text>
                </View>
            )}
        />
    );
};

export default AIInsightsCarousel;
