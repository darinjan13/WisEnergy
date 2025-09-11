import { List } from 'react-native-paper';
import { BarChart } from 'react-native-gifted-charts';
import { View, Text, StyleSheet } from 'react-native';
import { useState } from 'react';
import { getMonthName } from '../../utils/dateHelper';

export default function ApplianceUsage({ category, data, styles }) {
    const [expandedIndex, setExpandedIndex] = useState(null);

    return (
        <View className="mt-4 mb-10">
            {data?.map((appliance, index) => {
                const monthValue = appliance.barData[0]?.month || "";

                const isExpanded = expandedIndex === index;

                return (
                    <List.Accordion
                        theme={{ colors: { background: '#f3f4f6' } }}
                        key={index}
                        title={appliance.applianceName}
                        titleStyle={style.titleStyle}
                        left={(props) => (
                            <List.Icon {...props} icon="power-plug-outline" color="#14532d" />
                        )}
                        expanded={isExpanded}
                        onPress={() => setExpandedIndex(isExpanded ? null : index)}
                        style={[
                            style.accordionStyle,
                            !isExpanded && style.accordionCollapsed
                        ]}
                    >
                        <View style={style.barGraph} className="bg-white p-5 rounded-b-2xl mb-4 shadow-sm">
                            {category === "Daily" ? (
                                <Text className="mb-5">Power Usage for the past 5 days</Text>
                            ) : category === "Weekly" ? (
                                <Text className="mb-5">Power Usage for the past weeks of {getMonthName(monthValue)}</Text>
                            ) : (
                                <Text className="mb-5">Power Usage for the past months</Text>
                            )}
                            <BarChart
                                data={appliance.barData}
                                barWidth={category === "Daily" ? 25 : category === "Weekly" ? 35 : 25}
                                frontColor="#16a34a"
                                spacing={10}
                                initialSpacing={7}
                                yAxisThickness={0}
                                xAxisLabelTextStyle={{ color: "#4B5563", fontSize: 10 }}
                                maxValue={Math.max(...appliance.barData.map(b => b.value)) + 2}
                                topLabelTextStyle={{ fontSize: 12 }}
                                noOfSections={category === "Daily" ? 3 : category === "Weekly" ? 4 : 1}
                                width={250}
                                barStyle={style.barStyle}
                                showValuesAsTopLabel={true}
                                showTextOnPress={true}
                                renderTooltip={category === "Weekly" ? (
                                    (item, index) => {
                                        return (
                                            <View
                                                style={{
                                                    marginBottom: 2,
                                                    marginLeft: 25,
                                                    backgroundColor: "#FFFFFF",
                                                    paddingHorizontal: 6,
                                                    paddingVertical: 4,
                                                    borderRadius: 4,
                                                }}>
                                                <Text>{item.date}</Text>
                                            </View>
                                        );
                                    }
                                ) : null}
                            />
                            <View style={{ flexDirection: 'row', marginTop: 12, alignItems: 'center', justifyContent: 'center' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}>
                                    <View style={{ width: 14, height: 14, backgroundColor: '#16a34a', borderRadius: 2, marginRight: 6 }} />
                                    <Text style={{ fontSize: 12, color: '#374151' }}>Historical</Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <View style={{ width: 14, height: 14, backgroundColor: '#f59e0b', borderRadius: 2, marginRight: 6 }} />
                                    <Text style={{ fontSize: 12, color: '#374151' }}>Predicted</Text>
                                </View>
                            </View>
                        </View>
                    </List.Accordion>
                );
            })}
        </View>
    );
}

const style = StyleSheet.create({
    barGraph: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        backgroundColor: 'white',
        elevation: 4,
    },
    barStyle: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 10,
    },
    accordionStyle: {
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        backgroundColor: 'white',
        elevation: 4
    },
    accordionCollapsed: {
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        marginBottom: 10,
        backgroundColor: 'white',
    },
    titleStyle: {
        color: '#14532d',
        fontWeight: 'bold',
    },
});

