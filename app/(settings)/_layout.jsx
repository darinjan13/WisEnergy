import { router, Stack } from 'expo-router'
import '../../global.css';
import { StatusBar } from 'react-native';
import { DefaultTheme, PaperProvider, ThemeProvider } from 'react-native-paper';
import { useEffect } from 'react';
import useAuth from "@/hooks/useAuth";
import { auth } from '../../firebase/firebaseConfig';
export default function AuthLayout() {
    const { user, checkingAuth } = useAuth();

    // useEffect(() => {

    //     if (!checkingAuth && !user) {
    //         router.replace('/(auth)/login');
    //     }
    // }, [checkingAuth, user, router, auth]);
    return (
        <PaperProvider>
            <ThemeProvider theme={DefaultTheme}>
                <StatusBar barStyle='dark-content' backgroundColor='white' />
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name='settings' />
                    <Stack.Screen name='changePassword' />
                    <Stack.Screen name='editProfile' />
                    <Stack.Screen name='deleteAccount' />
                    <Stack.Screen name='about' />
                    <Stack.Screen name='terms' />
                    <Stack.Screen name='privacy' />
                    <Stack.Screen name="contactSupport/index" />
                    <Stack.Screen name="contactSupport/giveRating" />
                    <Stack.Screen name="contactSupport/reportBug" />
                    <Stack.Screen name="contactSupport/suggestImprovement" />
                    <Stack.Screen name="contactSupport/askQuestions" />
                </Stack>
            </ThemeProvider>
        </PaperProvider>
    )
}