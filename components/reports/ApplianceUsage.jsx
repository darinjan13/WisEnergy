import { List } from 'react-native-paper';
import { BarChart, LineChart } from 'react-native-gifted-charts';
import { View, Text, StyleSheet } from 'react-native';
import { useState } from 'react';
import { getMonthName } from '../../utils/dateHelper';

export default function ApplianceUsage({ category, data }) {
    const monthValue = data?.barData[0]?.month || "";
    // console.log(data);
    const values = [
        ...(data?.barData?.map(b => b.value) || []),
        ...(data?.barData2?.map(b => b.value) || []),
    ];

    const maxValue = values.length > 0 ? Math.max(...values) + 2 : 10; // fallback 10

    // const isExpanded = expandedIndex === index;
    return (
        <View /*style={style.barGraph}*/ className="bg-white p-5 rounded-2xl mt-20 mb-4 shadow-xl">
            {/* Dynamic Text Based on Category */}
            {category === "Daily" ? (
                <Text className="mb-5 text-lg font-semibold">Power Usage for the Past 5 Days</Text>
            ) : category === "Weekly" ? (
                <Text className="mb-5 text-lg font-semibold">Power Usage for the Past Weeks of {getMonthName(monthValue)}</Text>
            ) : (
                <Text className="mb-5 text-lg font-semibold">Power Usage for the Past Months</Text>
            )}

            {/* Line Chart for Displaying Data */}
            <LineChart
                data={data?.barData}     // historical data
                data2={data?.barData2 ?? undefined}   // predicted data
                width={250}             // Adjust width as needed
                height={250}            // Adjust height for better visualization
                maxValue={maxValue}  // Ensure dynamic max value
                mostNegativeValue={-0.1}
                spacing={50}            // Adjust spacing between points
                initialSpacing={30}     // Adjust initial spacing for better readability
                noOfSections={category === "Daily" ? 3 : 5}        // You can adjust this based on your data

                curved
                thickness={3}
                color1="#095333"        // Color for historical data
                color2="#40cc65"        // Color for predicted data

                showVerticalLines
                showXAxisIndices
                xAxisColor="#d1d5db"    // Light gray for the X axis
                yAxisColor="#d1d5db"    // Light gray for the Y axis
                textColor="#111827"     // Dark color for text
                textShiftX={5}         // Adjust text shift for better alignment
                textShiftY={-10}
                xAxisIndicesColor="#e5e7eb"
                yAxisIndicesColor="#e5e7eb"
            />
            {/* <BarChart
                data={data.barData}
                barWidth={category === "Daily" ? 25 : category === "Weekly" ? 35 : 25}
                frontColor="#16a34a"
                spacing={10}
                initialSpacing={7}
                yAxisThickness={0}
                xAxisLabelTextStyle={{ color: "#4B5563", fontSize: 10 }}
                maxValue={Math.max(...data.barData.map(b => b.value)) + 2}
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
            /> */}

            {/* <LineChart
                data={data.barData}     // historical data
                data2={data.barData2}   // predicted data
                width={250}             // Adjust width as needed
                height={250}            // Adjust height for better visualization
                maxValue={Math.max(...data.barData.map(b => b.value)) + 2}  // Ensure dynamic max value
                spacing={40}            // Adjust spacing between points
                initialSpacing={30}     // Adjust initial spacing for better readability
                noOfSections={5}
                thickness={3}
                color1="#064e3b"
                color2="#10b981"
                dataPointsHeight={10}
                dataPointsWidth={10}
                textColor1="#064e3b"
                textColor2="#10b981"
                showDataPointOnFocus
            /> */}
            <View style={{ flexDirection: 'row', marginTop: 12, alignItems: 'center', justifyContent: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}>
                    <View style={{ width: 14, height: 14, backgroundColor: '#095333', borderRadius: 2, marginRight: 6 }} />
                    <Text style={{ fontSize: 12, color: '#374151' }}>Historical</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 14, height: 14, backgroundColor: '#40cc65', borderRadius: 2, marginRight: 6 }} />
                    <Text style={{ fontSize: 12, color: '#374151' }}>Predicted</Text>
                </View>
            </View>
        </View>
        // <View className="h-screen mt-4 mb-10">
        //     {data?.map((appliance, index) => {
        //         const monthValue = appliance.barData[0]?.month || "";
        //         const isExpanded = expandedIndex === index;

        //         return (

        //             <List.Accordion
        //                 theme={{ colors: { background: '#f3f4f6' } }}
        //                 key={index}
        //                 title={appliance.applianceName}
        //                 titleStyle={style.titleStyle}
        //                 left={(props) => (
        //                     <List.Icon {...props} icon="power-plug-outline" color="#14532d" />
        //                 )}
        //                 expanded={isExpanded}
        //                 onPress={() => setExpandedIndex(isExpanded ? null : index)}
        //                 style={[
        //                     style.accordionStyle,
        //                     !isExpanded && style.accordionCollapsed
        //                 ]}
        //             >
        //                 <View style={style.barGraph} className="bg-white p-5 rounded-b-2xl mb-4 shadow-sm">
        //                     {category === "Daily" ? (
        //                         <Text className="mb-5">Power Usage for the past 5 days</Text>
        //                     ) : category === "Weekly" ? (
        //                         <Text className="mb-5">Power Usage for the past weeks of {getMonthName(monthValue)}</Text>
        //                     ) : (
        //                         <Text className="mb-5">Power Usage for the past months</Text>
        //                     )}
        //                     {/* <BarChart
        //                         data={appliance.barData}
        //                         barWidth={category === "Daily" ? 25 : category === "Weekly" ? 35 : 25}
        //                         frontColor="#16a34a"
        //                         spacing={10}
        //                         initialSpacing={7}
        //                         yAxisThickness={0}
        //                         xAxisLabelTextStyle={{ color: "#4B5563", fontSize: 10 }}
        //                         maxValue={Math.max(...appliance.barData.map(b => b.value)) + 2}
        //                         topLabelTextStyle={{ fontSize: 12 }}
        //                         noOfSections={category === "Daily" ? 3 : category === "Weekly" ? 4 : 1}
        //                         width={250}
        //                         barStyle={style.barStyle}
        //                         showValuesAsTopLabel={true}
        //                         showTextOnPress={true}
        //                         renderTooltip={category === "Weekly" ? (
        //                             (item, index) => {
        //                                 return (
        //                                     <View
        //                                         style={{
        //                                             marginBottom: 2,
        //                                             marginLeft: 25,
        //                                             backgroundColor: "#FFFFFF",
        //                                             paddingHorizontal: 6,
        //                                             paddingVertical: 4,
        //                                             borderRadius: 4,
        //                                         }}>
        //                                         <Text>{item.date}</Text>
        //                                     </View>
        //                                 );
        //                             }
        //                         ) : null}
        //                     /> */}
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