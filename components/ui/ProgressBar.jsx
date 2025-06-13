import { View, Text } from "react-native";

const ProgressBar = ({ value = 0, max = 100, height = 14, barColor = "#10b981", bgColor = "#e5e7eb", showLabel = true }) => {
  const percent = Math.min(value / max, 1);

  return (
    <View className="w-full">
      <View style={{ backgroundColor: bgColor, borderRadius: height / 2, height, width: '100%' }}>
        <View
          style={{
            backgroundColor: barColor,
            width: `${percent * 100}%`,
            height,
            borderRadius: height / 2,
          }}
        />
      </View>
      {showLabel && (
        <Text className="text-xs mt-1 text-gray-600 text-right">
          {value}/{max}
        </Text>
      )}
    </View>
  );
}
export default ProgressBar;