import { View, Text, Dimensions } from "react-native";
import { LineChart } from "react-native-gifted-charts";

const SavingsChart = ({ lineData1, lineData2, chartMax, styles }) => {
    const screenWidth = Dimensions.get('window').width;

    return (
        <View style={styles.cardShadow} className="bg-white p-5 rounded-2xl mb-4">
            {lineData1.length > 0 && lineData2.length > 0 ? (
                <>
                    <LineChart
                        data={lineData1}
                        data2={lineData2}
                        height={220}
                        maxValue={chartMax + 10}
                        spacing={50}
                        initialSpacing={32}
                        width={screenWidth * .65}
                        curved
                        thickness={3}
                        color1="#16a34a"
                        color2="#f59e0b"
                        dataPointsHeight={6}
                        dataPointsWidth={6}
                        hideRules
                        yAxisTextStyle={{ color: "#6B7280", fontSize: 11 }}
                        xAxisLabelTextStyle={{ color: "#6B7280", fontSize: 11 }}
                        showVerticalLines
                        animationDuration={800}
                        noOfSections={4}
                        focusEnabled
                        delayBeforeUnFocus={500}
                        showTextOnFocus
                        textColor="transparent"
                        dataPointsColor1="#16a34a"
                        dataPointsColor2="#f59e0b"
                        focusedDataPointColor={"#16a34a"}
                        pointerConfig={{
                            pointerStripUptoDataPoint: true,
                            pointerStripColor: 'lightgray',
                            pointerStripWidth: 2,
                            strokeDashArray: [2, 5],
                            pointerColor: 'transparent',
                            radius: 4,
                            pointerLabelWidth: 100,
                            pointerLabelHeight: 120,
                            pointerLabelComponent: items => {

                                return (
                                    <View className="h-[120px] w-[110px] bg-[#1e293b] rounded-lg justify-center px-4 mt-5">
                                        {/* Budget */}
                                        <Text className="text-amber-400 text-xs font-medium">Budget</Text>
                                        <Text className="text-white font-bold text-sm">
                                            {items[1]?.value?.toFixed(2)} kWh
                                        </Text>

                                        {/* Consumption */}
                                        <Text className="text-green-400 text-xs font-medium mt-3">Consumption</Text>
                                        <Text className="text-white font-bold text-sm">
                                            {items[0]?.value?.toFixed(2)} kWh
                                        </Text>
                                    </View>
                                );
                            },
                        }}
                    />

                    <View className="flex-row justify-center items-center mt-5 gap-x-6">
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
        </View>
    );
};

export default SavingsChart;
