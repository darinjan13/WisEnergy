import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useAuth from "@/hooks/useAuth";
import * as SplashScreen from "expo-splash-screen";

export default function Index() {
    const { user, checkingAuth } = useAuth();
    const [checkingOnboarding, setCheckingOnboarding] = useState(true);
    const [seen, setSeen] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                const val = await AsyncStorage.getItem("onboardingSeen");
                setSeen(val);
            } finally {
                setCheckingOnboarding(false);
                // ✅ Hide splash once checks are done
                SplashScreen.hideAsync();
            }
        };
        load();
    }, []);

    // Keep splash visible until checks are finished
    if (checkingAuth || checkingOnboarding) {
        return null; // don’t render spinner — keep splash
    }

    if (!seen) return <Redirect href="/onboarding" />;
    if (!user) return <Redirect href="/(auth)/login" />;

    return <Redirect href="/(tabs)/dashboard" />;
}
