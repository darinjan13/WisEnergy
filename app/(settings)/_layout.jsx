import { Stack } from 'expo-router'
import '../../global.css';
import { StatusBar } from 'react-native';
import useAuth from "@/hooks/useAuth";
export default function AuthLayout() {
    const { user, checkingAuth } = useAuth();
    return (
        <>
            <StatusBar barStyle='dark-content' />
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
            </Stack></>
    )
}