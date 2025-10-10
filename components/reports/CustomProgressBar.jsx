import React from "react";
import { View } from "react-native";

export default function CustomProgressBar({
  progress = 0,
  maxProgress = 100,
  color = "#4CAF50",
  backgroundColor = "#E5E7EB",
  height = 20,
}) {
  // Compute percentage safely
  const percent =
    maxProgress > 0 ? Math.min(100, (progress / maxProgress) * 100) : 0;

  return (
    <View
      style={{
        height,
        width: "100%",
        backgroundColor,
        borderRadius: height / 2,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          height: "100%",
          width: `${percent}%`,
          backgroundColor: color,
          borderRadius: height / 2,
        }}
      />
    </View>
  );
}
