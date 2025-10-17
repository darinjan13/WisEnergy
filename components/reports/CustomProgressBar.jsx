import React from "react";
import { View } from "react-native";

export default function CustomProgressBar({ progress = 0, color = "#4CAF50", height = 20 }) {
    // Clamp value between 0–100
    const safeProgress = Math.min(100, Math.max(0, progress));

    return (
        <View
            style={{
                height,
                width: "100%",
                backgroundColor: "#E5E7EB", // light gray bg
                borderRadius: height / 2,
                overflow: "hidden",
            }}
        >
            <View
                style={{
                    height: "100%",
                    width: `${safeProgress}%`, // percent width
                    backgroundColor: color,
                }}
            />
        </View>
    );
}
