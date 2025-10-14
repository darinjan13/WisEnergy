import React, { useMemo } from "react";
import { View, Text } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { getMonthName } from '../../utils/dateHelper';

export default function EnergyPredictionChart({ actualData = [], predictedData = [], category }) {

    const allLabels = useMemo(() => {
        const labels = new Set([
            ...(actualData || []).map((a) => a.label),
            ...(predictedData || []).map((p) => p.label),
        ]);

        return Array.from(labels).sort((a, b) => {
            // Sort by month then week, e.g., W5-09 < W1-10
            const [wa, ma] = a.replace("W", "").split("-");
            const [wb, mb] = b.replace("W", "").split("-");

            return ma === mb ? Number(wa) - Number(wb) : Number(ma) - Number(mb);
        });
    }, [actualData, predictedData]);

    const barData = useMemo(() => {
        const merged = [];

        allLabels.forEach((label) => {
            const actual = actualData.find((a) => a.label === label);
            const predicted = predictedData.find((p) => p.label === label);

            const [week, monthNum] = label.replace("W0", "").split("-");
            const monthName = getMonthName(Number(monthNum), 'short')
            const formattedLabel = `W${week}-${monthName}`;
            merged.push(
                {
                    value: actual?.value || 0,
                    label: category === "Weekly" ? formattedLabel : label.replace("W0", "W"),
                    spacing: 1,
                    labelWidth: 50,
                    labelTextStyle: { color: "black", marginLeft: -10 },
                    frontColor: "#16a34a",
                },
                {
                    value: predicted?.value || 0,
                    frontColor: "#f87171",
                }
            );
        });

        return merged;
    }, [actualData, predictedData, allLabels]);

    const maxValue = Math.max(...barData.map((b) => b.value), 0) + 1;
    const noOfSections = category === "Daily" ? Math.ceil(maxValue) * 2 : 2;

    return (
        <View className="bg-white p-5 rounded-2xl">
            <Text className="text-black text-center text-base font-semibold mb-2">
                Energy Usage vs Predicted
            </Text>

            <BarChart
                data={barData}
                barWidth={30}
                spacing={24}
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
