import React from "react";
import { View } from "react-native";

export default function CustomProgressBar({
  progress = 0,
  maxProgress = 100,
  color = "#4CAF50",
  backgroundColor = "#E5E7EB",
  height = 20,
  reports
}) {
  const rawPercent = maxProgress > 0 ? (progress / maxProgress) * 100 : 0;
  const percent = Math.min(100, Math.max(0, rawPercent));

  let barColor = color;
  if (rawPercent <= 50) {
    barColor = "#22C55E";
  } else if (rawPercent <= 80) {
    barColor = "#84CC16";
  } else if (rawPercent <= 100) {
    barColor = "#FACC15";
  } else if (rawPercent <= 120) {
    barColor = "#FB923C";
  } else {
    barColor = "#EF4444";
  }
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
          backgroundColor: !reports ? barColor : color,
          borderRadius: height / 2,
        }}
      />
    </View>
  );
}
