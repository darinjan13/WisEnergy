import { Stack } from 'expo-router'
import '../../global.css';
import { StatusBar } from 'react-native';
import { DefaultTheme, PaperProvider, ThemeProvider } from 'react-native-paper';
export default function AuthLayout() {
    return (
        <PaperProvider>
            <ThemeProvider theme={DefaultTheme}>
                <StatusBar barStyle='dark-content' backgroundColor='white' />
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name='login' />
                    <Stack.Screen name='register' />
                    <Stack.Screen name="forgotPassword/index" />
                    <Stack.Screen name="forgotPassword/verification" />
                    <Stack.Screen name="forgotPassword/resetpassword" />
                </Stack>
            </ThemeProvider>
        </PaperProvider>
    )
}