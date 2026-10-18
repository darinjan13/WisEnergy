import React, { useMemo } from "react";
import { View, Text, ScrollView, useWindowDimensions } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { getMonthName } from "../../utils/dateHelper";

const BAR_ACTUAL = "#16a34a";
const BAR_PREDICTED = "#f87171";
// Per-category bar geometry: fixed widths keep bars identical in every
// category; the chart scrolls horizontally when groups overflow.
const BAR_GEOMETRY = {
  Daily: { barWidth: 26, spacing: 14, pairWidth: 108 },
  Weekly: { barWidth: 30, spacing: 14, pairWidth: 100 },
  Monthly: { barWidth: 44, spacing: 20, pairWidth: 150 },
};
const DAILY_WINDOW = 5;

export default function EnergyPredictionChart({
  actualData = [],
  predictedData = [],
  category,
}) {
  const { width: screenWidth } = useWindowDimensions();
  const { barWidth, spacing, pairWidth } =
    BAR_GEOMETRY[category] ?? BAR_GEOMETRY.Weekly;

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
        .sort((a, b) => b.localeCompare(a)) // newest first
        .slice(0, DAILY_WINDOW)
        .reverse(); // oldest -> newest, left to right
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
      const actual = (actualData || []).find((a) => a.label === label);
      const predicted = (predictedData || []).find(
        (p) => p.label === label
      );

      const [week, monthNum] = label.replace("W0", "").split("-");
      const monthName = getMonthName(Number(monthNum), "short");
      const formattedLabel = `W${week}-${monthName}`;
      const predictedValue = predicted?.value ?? 0;
      merged.push(
        {
          value: actual?.value || 0,
          label:
            category === "Weekly" ? formattedLabel : label.replace("W0", "W"),
          spacing,
          labelWidth: 50,
          labelTextStyle: { color: "#6b7280", fontSize: 10 },
          frontColor: BAR_ACTUAL,
        },
        {
          value: predictedValue < 0 ? 0 : predictedValue,
          frontColor: BAR_PREDICTED,
        }
      );
    });

    return merged;
  }, [actualData, predictedData, allLabels, category, spacing]);

  if (barData.length === 0) {
    return (
      <View className="bg-white p-5 rounded-2xl">
        <Text className="text-gray-500 text-center text-lg font-semibold">
          No data yet…
        </Text>
      </View>
    );
  }

  const maxValue =
    Math.max(...barData.map((b) => b.value), 0) +
    (category === "Daily" ? 1 : 10);
  // Top value labels only when few groups — 31 daily values would clutter.
  const showTopLabels = allLabels.length <= 14;
  const chartWidth = Math.max(
    screenWidth - 110,
    allLabels.length * pairWidth
  );

  return (
    <View className="bg-white p-5 rounded-2xl">
      <Text className="text-black text-center text-base font-semibold mb-2">
        Energy Usage vs Predicted
      </Text>

      {/* Single scroller (ours): gifted's inner scroll is disabled so the
          two never fight; nestedScrollEnabled lets the horizontal swipe
          win inside the page's vertical scroll */}
      <ScrollView
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator
      >
        <View style={{ width: chartWidth }}>
      <BarChart
        data={barData}
        barWidth={barWidth}
        spacing={spacing}
        roundedTop
        width={chartWidth}
        disableScroll
        maxValue={maxValue}
        noOfSections={4}
        rulesType="dashed"
        rulesColor="#e5e7eb"
        xAxisThickness={0}
        yAxisThickness={0}
        yAxisTextStyle={{ color: "#6b7280", fontSize: 10 }}
          showValuesAsTopLabel={showTopLabels}
          topLabelTextStyle={{ color: "#111827", fontSize: 11, fontWeight: "700" }}
        />
        </View>
      </ScrollView>

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
