import { View, Text, Modal, TouchableOpacity, Dimensions } from 'react-native'
import React, { useState } from 'react'
import { LineChart } from 'react-native-gifted-charts';
import { AntDesign } from '@expo/vector-icons';

const SavingsChart = ({ lineData1, lineData2, chartMax, styles }) => {

    const screenWidth = Dimensions.get('window').width;
    const [savingsModal, setSavingsModal] = useState(false);
    const [selectedAppliance, setSelectedAppliance] = useState(null);

    return (
        <View style={styles.cardShadow} className="bg-white p-5 rounded-2xl mb-4">
            {lineData1.length > 0 && lineData2.length > 0 ? (
                <>
                    <LineChart
                        data={lineData1}
                        data2={lineData2}
                        height={220}
                        maxValue={chartMax + 10}
                        spacing={48}
                        width={screenWidth * .65}
                        initialSpacing={32}
                        curved
                        thickness={3}
                        color1="#16a34a"
                        color2="#f59e0b"
                        dataPointsColor1="#22c55e"
                        dataPointsColor2="#facc15"
                        dataPointsHeight={6}
                        dataPointsWidth={6}
                        hideDataPointsText
                        hideRules
                        yAxisTextStyle={{ color: "#6B7280", fontSize: 11 }}
                        xAxisLabelTextStyle={{ color: "#6B7280", fontSize: 11 }}
                        showVerticalLines
                        showYAxisIndices
                        yAxisColor="#e5e7eb"
                        xAxisColor="#e5e7eb"
                        animationDuration={1000}
                        noOfSections={4}
                        focusEnabled
                        showFocusCircle
                        focusCircleColor="#16a34a"
                        onFocus={(item) => {
                            const month = item.label;
                            let consumption, budget;

                            if (item.type === "consumption") {
                                consumption = item.value?.toFixed(2);
                                budget = lineData2.find((b) => b.label === month)?.value?.toFixed(2);
                            } else {
                                budget = item.value?.toFixed(2);
                                consumption = lineData1.find((c) => c.label === month)?.value?.toFixed(2);
                            }

                            // Compute savings (budget - actual)
                            const savings = (budget - consumption).toFixed(2);
                            const status =
                                savings >= 0
                                    ? { label: "Under Budget", color: "text-green-600" }
                                    : { label: "Over Budget", color: "text-red-600" };

                            setSelectedAppliance({
                                month,
                                consumption,
                                budget,
                                savings: Math.abs(savings),
                                status,
                            });
                            setSavingsModal(true);
                        }}
                    />

                    <View className="flex-row justify-center items-center mt-2 space-x-6">
                        <View className="flex-row items-center">
                            <View className="w-3.5 h-3.5 bg-[#f59e0b] rounded-sm mr-1.5" />
                            <Text className="text-xs text-gray-600">Budget (Goal)</Text>
                        </View>
                        <View className="flex-row items-center">
                            <View className="w-3.5 h-3.5 bg-[#16a34a] rounded-sm mr-1.5" />
                            <Text className="text-xs text-gray-600">Consumption (Actual)</Text>
                        </View>
                    </View>
                </>
            ) : (
                <View className="h-32 items-center justify-center">
                    <Text className="text-gray-500 text-md font-semibold">
                        Not enough data yet to show savings trends.
                    </Text>
                    <Text className="text-gray-400 text-xs mt-1">
                        Add a monthly budget and collect at least two months of usage.
                    </Text>
                </View>
            )}
            {/* Modal for tapped month */}
            <Modal
                visible={savingsModal}
                transparent
                animationType="fade"
                onRequestClose={() => setSavingsModal(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/40 px-4">
                    <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
                        <TouchableOpacity
                            onPress={() => setSavingsModal(false)}
                            className="absolute top-3 right-3 z-10"
                        >
                            <View className="bg-red-600 w-8 h-8 rounded-full items-center justify-center">
                                <AntDesign name="close" size={14} color="white" />
                            </View>
                        </TouchableOpacity>

                        <Text className="text-lg font-bold text-center text-green-800 mb-4">
                            {selectedAppliance?.month || "Month Details"}
                        </Text>

                        <View className="flex-col space-y-2">
                            <Text className="text-gray-700 text-base">
                                <Text className="font-semibold">Consumption:</Text>{" "}
                                {selectedAppliance?.consumption || "--"} kWh
                            </Text>
                            <Text className="text-gray-700 text-base">
                                <Text className="font-semibold">Budget:</Text>{" "}
                                {selectedAppliance?.budget || "--"} kWh
                            </Text>
                            <Text
                                className={`text-base font-semibold ${selectedAppliance?.status?.color || "text-gray-600"}`}
                            >
                                {selectedAppliance?.status?.label}: {selectedAppliance?.savings || "--"} kWh
                            </Text>
                        </View>
                    </View>
                </View>
            </Modal>


        </View>
    )
}

export default SavingsChart