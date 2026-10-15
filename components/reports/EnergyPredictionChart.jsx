import React, { useMemo } from "react";
import { View, Text, ScrollView, useWindowDimensions } from "react-native";
import { CartesianChart, BarGroup } from "victory-native";
import { useFont } from "@shopify/react-native-skia";
import { getMonthName } from "../../utils/dateHelper";

const BAR_ACTUAL = "#16a34a";
const BAR_PREDICTED = "#f87171";
const CHART_HEIGHT = 250;
// Fixed width per label-group so bars look identical in every category;
// the chart scrolls horizontally when groups overflow the viewport.
const GROUP_WIDTH = { Daily: 30, Weekly: 72, Monthly: 120 };

export default function EnergyPredictionChart({
  actualData = [],
  predictedData = [],
  category,
}) {
  const font = useFont(
    require("../../assets/fonts/SpaceMono-Regular.ttf"),
    11
  );
  const { width: screenWidth } = useWindowDimensions();

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

  const data = useMemo(
    () =>
      allLabels.map((label) => {
        const actual = (actualData || []).find((a) => a.label === label);
        const predicted = (predictedData || []).find(
          (p) => p.label === label
        );

        const [week, monthNum] = label.replace("W0", "").split("-");
        const monthName = getMonthName(Number(monthNum), "short");
        return {
          x:
            category === "Weekly"
              ? `W${week}-${monthName}`
              : label.replace("W0", "W"),
          yActual: actual?.value || 0,
          yPredicted: Math.max(predicted?.value ?? 0, 0),
        };
      }),
    [allLabels, actualData, predictedData, category]
  );

  const maxValue =
    category === "Daily"
      ? Math.max(
          ...data.map((d) => Math.max(d.yActual, d.yPredicted)),
          0
        ) + 1
      : Math.max(
          ...data.map((d) => Math.max(d.yActual, d.yPredicted)),
          0
        ) + 10;

  if (data.length === 0) {
    return (
      <View className="bg-white p-5 rounded-2xl">
        <Text className="text-gray-500 text-center text-lg font-semibold">
          No data yet…
        </Text>
      </View>
    );
  }

  const viewportWidth = screenWidth - 80; // card padding + chart padding
  const chartWidth = Math.max(
    viewportWidth,
    data.length * (GROUP_WIDTH[category] ?? 72)
  );

  return (
    <View className="bg-white p-5 rounded-2xl">
      <Text className="text-black text-center text-base font-semibold mb-2">
        Energy Usage vs Predicted
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
      <View style={{ width: chartWidth, height: CHART_HEIGHT }}>
        <CartesianChart
          data={data}
          xKey="x"
          yKeys={["yActual", "yPredicted"]}
          domain={{ y: [0, maxValue] }}
          domainPadding={{ left: 12, right: 12, top: 12 }}
          xAxis={{
            font,
            tickCount: Math.min(10, data.length),
            lineWidth: 0,
          }}
          yAxes={[
            {
              yKeys: ["yActual", "yPredicted"],
              tickCount: 4,
              font,
              lineWidth: 0,
            },
          ]}
        >
          {({ points, chartBounds }) => (
            <BarGroup
              chartBounds={chartBounds}
              betweenGroupPadding={0.3}
              withinGroupPadding={0.3}
              roundedCorners={{ topLeft: 4, topRight: 4 }}
            >
              <BarGroup.Bar points={points.yActual} color={BAR_ACTUAL} />
              <BarGroup.Bar points={points.yPredicted} color={BAR_PREDICTED} />
            </BarGroup>
          )}
        </CartesianChart>
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
