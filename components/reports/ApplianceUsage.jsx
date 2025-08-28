import { List } from 'react-native-paper';
import { BarChart } from 'react-native-gifted-charts';
import { View, Text, StyleSheet } from 'react-native';
import { useState } from 'react';

export default function ApplianceUsage({ data, styles }) {
    const [expandedIndex, setExpandedIndex] = useState(null);

    return (
        <View className="mt-4 mb-10">
            {data?.map((appliance, index) => {
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
                            <Text className="mb-5">Power Usage for the past 5 days</Text>
                            <BarChart
                                data={appliance.barData}
                                barWidth={25}
                                frontColor="#16a34a"
                                spacing={10}
                                initialSpacing={20}
                                yAxisThickness={0}
                                xAxisLabelTextStyle={{ color: "#4B5563", fontSize: 12 }}
                                maxValue={Math.max(...appliance.barData.map(b => b.value)) + 1}
                                noOfSections={4}
                                width={200}
                                barStyle={style.barStyle}
                                showValuesAsTopLabel={true}
                                showTextOnPress={true}
                                renderTooltip={(item, index) => {
                                    return (
                                        <View
                                            style={{
                                                marginBottom: 10,
                                                marginLeft: -20,
                                                backgroundColor: "#FFFFFF",
                                                paddingHorizontal: 6,
                                                paddingVertical: 4,
                                                borderRadius: 4,
                                            }}>
                                            <Text>{item.date}</Text>
                                        </View>
                                    );
                                }}
                            />
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

