import React from 'react'
import { Stack } from 'expo-router'
import '../../global.css';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
export default function AuthLayout() {
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <StatusBar barStyle='dark-content' backgroundColor='white' />
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name='login' />
                <Stack.Screen name='register' />
            </Stack>
        </SafeAreaView>
    )
}