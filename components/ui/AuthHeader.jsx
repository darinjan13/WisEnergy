import { View, Text, Image } from 'react-native'
import React from 'react'

const AuthHeader = ({ textHeader }) => {
    return (
        <View>
            <View className="h-52 justify-center items-center">
                <Image
                    source={require("@/assets/images/WisEnergy_LOGO2.png")}
                    className="max-w-60 max-h-60"
                    resizeMode="contain"
                />
            </View>

            <Text className="text-lg font-semibold mb-4 text-left md:ml-28 text-[#2E4F4F]">{textHeader}</Text>
        </View>
    )
}

export default AuthHeader