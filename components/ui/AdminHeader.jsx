import { View, Text, Image } from 'react-native'
import React from 'react'

const AdminHeader = () => {
    return (
        <View className="h-10 justify-center items-start mt-10">
            <Image
                source={require("@/assets/images/WisEnergy_LOGO2.png")}
                className="max-w-60 max-h-60"
                resizeMode="contain"
            />
        </View>
    )
}

export default AdminHeader