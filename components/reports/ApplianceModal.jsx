import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native'
import EnergyPredictionChart from './EnergyPredictionChart';
import React from 'react'
import { BlurView } from 'expo-blur'
import { AntDesign } from '@expo/vector-icons'

const ApplianceModal = ({ visible, onClose, applianceData, reportCategory }) => {
    return (
        <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
            <BlurView intensity={100} tint="dark" className="flex-1 justify-center items-center px-4">
                <View className="bg-white rounded-2xl p-5 w-full max-w-[420px] shadow-lg" style={{ maxHeight: "85%" }}>
                    <TouchableOpacity onPress={onClose} className="absolute top-3 right-3 z-10">
                        <View className="bg-red-600 w-10 h-10 rounded-full items-center justify-center">
                            <AntDesign name="close" size={15} color="white" />
                        </View>
                    </TouchableOpacity>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Text className="text-lg font-bold text-center mb-4 text-gray-800">
                            {applianceData?.applianceName || "Appliance Details"}
                        </Text>
                        {applianceData?.barData?.length ? (
                            <EnergyPredictionChart
                                actualData={applianceData.barData}
                                predictedData={applianceData.barData2}
                                category={reportCategory}
                            />
                        ) : (
                            <Text className="text-gray-500 text-center text-base mt-6">
                                No prediction data available for this appliance yet.
                            </Text>
                        )}
                    </ScrollView>
                </View>
            </BlurView>
        </Modal>
    )
}

export default ApplianceModal