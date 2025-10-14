import { Stack } from 'expo-router'
import '../../global.css';
import { StatusBar } from 'react-native';
export default function AuthLayout() {
    return (
        <>
            <StatusBar barStyle='dark-content' />
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name='login' />
                <Stack.Screen name='register' />
                <Stack.Screen name="forgotPassword/index" />
                <Stack.Screen name="forgotPassword/verification" />
                <Stack.Screen name="forgotPassword/resetpassword" />
            </Stack>
        </>
    )
}