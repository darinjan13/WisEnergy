import { View, Image } from 'react-native'
import React from 'react'

const AuthHeader = () => {
    return (
        <View className="h-52">
            <View className="w-full absolute">
                <Image
                    source={require("@/assets/images/Login-house.png")}
                    className="w-full h-60"
                    resizeMode="cover"
                />

            </View>
            <Image
                source={require("@/assets/images/WisEnergy_LOGO2.png")}
                className="absolute w-40 h-36 left-0"
                resizeMode="contain"
            />
        </View>
    )
}

export default AuthHeader
