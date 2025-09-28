import { Stack } from 'expo-router'
import '../../global.css';
import { StatusBar, useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';
export default function AuthLayout() {
    const colorScheme = useColorScheme();
    return (
        <PaperProvider>
            <StatusBar
                barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
                backgroundColor={colorScheme === "dark" ? "#000000" : "#ffffff"}
            />
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name='login' />
                <Stack.Screen name='register' />
                <Stack.Screen name="forgotPassword/index" />
                <Stack.Screen name="forgotPassword/verification" />
                <Stack.Screen name="forgotPassword/resetpassword" />
            </Stack>
        </PaperProvider>
    )
}