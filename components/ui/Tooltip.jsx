import { View, Text, TouchableWithoutFeedback } from 'react-native'
import React from 'react'

export default function Tooltip({ toolTip, setToolTip, content, from }) {
    if (!toolTip) return null
    return (
        <TouchableWithoutFeedback onPress={() => setToolTip(false)}>
            <View className={`absolute ${from === 'Dashboard' ? 'top-[150px]' : from === 'Devices' ? 'top-[30px]' : 'top-[50px]'} bg-white border border-gray-300 w-full rounded-xl p-3 z-50`}
                style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.15,
                    shadowRadius: 4,
                    elevation: 3,
                }}
            >
                <Text className="text-gray-600 text-sm leading-5 text-center">
                    {content}
                </Text>
            </View>
        </TouchableWithoutFeedback>
    )
}