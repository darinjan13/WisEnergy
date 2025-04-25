import React from 'react'
import { Stack } from 'expo-router'
import '../../global.css';
import { SafeAreaView } from 'react-native-safe-area-context';
export default function AuthLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name='login' />
            <Stack.Screen name='register' />
        </Stack>
    )
}