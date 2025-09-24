import React from 'react';
import { View } from 'react-native';

const CustomProgressBar = ({ progress, maxProgress, color = "green", backgroundColor }) => {
    const progressPercentage = (progress / maxProgress) * 100;

    return (
        <View className=" w-[100%]">
            {/* Background bar */}
            <View
                className="h-6 w-full rounded-2xl overflow-hidden"
                style={{ backgroundColor }}
            >
                {/* Foreground bar (progress) */}
                <View
                    className="h-full rounded-2xl"
                    style={{ width: `${progressPercentage}%`, backgroundColor: color }}
                />
            </View>
        </View>
    );
};

export default CustomProgressBar;
