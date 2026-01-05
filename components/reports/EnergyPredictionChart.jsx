import React, { useMemo } from "react";
import { View, Text, Dimensions } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { getMonthName } from "../../utils/dateHelper";

export default function EnergyPredictionChart({
  actualData = [],
  predictedData = [],
  category,
}) {
  const screenWidth = Dimensions.get("window").width;

  const allLabels = useMemo(() => {
    const labels = new Set([
      ...(actualData || []).map((a) => a.label),
      ...(predictedData || []).map((p) => p.label),
    ]);

    const arr = Array.from(labels);

    if (category === "Daily") {
      const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0");
      return arr
        .filter((lbl) => lbl.split("-")[0] === currentMonth) // keeps only this month
        .sort((a, b) => b.localeCompare(a)); // 01-01..01-31
    }

    return arr.sort((a, b) => {
      const [wa, ma] = a.replace("W", "").split("-");
      const [wb, mb] = b.replace("W", "").split("-");

      if (Number(ma) !== Number(mb)) return Number(mb) - Number(ma);
      return Number(wb) - Number(wa);
    });
  }, [actualData, predictedData, category]);


  const barData = useMemo(() => {
    const merged = [];

    allLabels.forEach((label) => {
      const actual = actualData.find((a) => a.label === label);
      const predicted = predictedData.find((p) => p.label === label);

      const [week, monthNum] = label.replace("W0", "").split("-");
      const monthName = getMonthName(Number(monthNum), "short");
      const formattedLabel = `W${week}-${monthName}`;
      const predictedValue = predicted?.value ?? 0
      merged.push(
        {
          value: actual?.value || 0,
          label:
            category === "Weekly" ? formattedLabel : label.replace("W0", "W"),
          spacing: 1,
          labelWidth: 50,
          labelTextStyle: { color: "black", marginLeft: -10 },
          frontColor: "#16a34a",
        },
        {
          value: predictedValue < 0 ? 0 : predictedValue,
          frontColor: "#f87171",
        }
      );
    });

    return merged;
  }, [actualData, predictedData, allLabels]);

  const maxValue =
    category === "Daily"
      ? Math.max(...barData.map((b) => b.value), 0) + 1
      : Math.max(...barData.map((b) => b.value), 0) + 10;
  const noOfSections =
    category === "Daily"
      ? Math.ceil(maxValue) / 3
      : Math.ceil(maxValue) / Math.ceil(maxValue) + 2;

  return (
    <View className="bg-white p-5 rounded-2xl">
      <Text className="text-black text-center text-base font-semibold mb-2">
        Energy Usage vs Predicted
      </Text>

      <BarChart
        data={barData}
        barWidth={category === "Monthly" ? 30 : 40}
        spacing={24}
        maxV
        width={screenWidth * 0.65}
        showValuesAsTopLabel
        topLabelTextStyle={{ color: "black", fontSize: 11 }}
        xAxisThickness={0}
        yAxisThickness={0}
        yAxisTextStyle={{ color: "black" }}
        noOfSections={noOfSections}
        maxValue={maxValue}
      />

      <View className="flex-row justify-center mt-3 gap-x-6">
        <View className="flex-row items-center gap-x-2">
          <View className="w-3 h-3 rounded-full bg-green-600" />
          <Text className=" text-xs">Usage</Text>
        </View>
        <View className="flex-row items-center gap-x-2">
          <View className="w-3 h-3 rounded-full bg-red-400" />
          <Text className="text-xs">Predicted</Text>
        </View>
      </View>
    </View>
  );
}
