import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useAuth from "@/hooks/useAuth";
import * as SplashScreen from "expo-splash-screen";
import { useNotifications } from "@/hooks/useNotifications";

export default function Index() {
  const { user, checkingAuth } = useAuth();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [seen, setSeen] = useState(null);

  useNotifications();

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const val = await AsyncStorage.getItem("onboardingSeen");
        if (isMounted) {
          setSeen(val);
        }
      } finally {
        if (isMounted) {
          setCheckingOnboarding(false);
          await SplashScreen.hideAsync();
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  if (checkingAuth || checkingOnboarding) return null;

  if (!seen) return <Redirect href="/onboarding" />;
  if (!user) return <Redirect href="/(auth)/login" />;

  return <Redirect href="/(tabs)/dashboard" />;
}
