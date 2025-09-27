import React from "react";
import { View, Text, Dimensions, ActivityIndicator } from "react-native";
import Carousel from "react-native-reanimated-carousel";

const AIInsightsCarousel = ({ insights }) => {
    const windowWidth = Dimensions.get("window").width;
    console.log(insights);

    return (

        <Carousel
            loop
            width={windowWidth - 80} // card width
            height={60} // adjust height as needed
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
