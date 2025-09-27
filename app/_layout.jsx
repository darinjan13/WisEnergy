import { useEffect, useState } from "react";
// import { ThemeProvider, DefaultTheme } from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";
import { DefaultTheme, PaperProvider, ThemeProvider } from 'react-native-paper';
import { StatusBar } from 'react-native';
import { View, ActivityIndicator } from "react-native";
import { useNavigationContainerRef } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useAuth from "@/hooks/useAuth";

export default function RootLayout() {
  const { user, checkingAuth } = useAuth();
  const router = useRouter();
  const navigationRef = useNavigationContainerRef();

  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const seen = await AsyncStorage.getItem("onboardingSeen");

        if (!seen) {
          router.replace("/onboarding");
        } else if (!checkingAuth && navigationRef.isReady()) {
          router.replace(user ? "/(tabs)" : "/(auth)/login");
        }
      } catch (err) {
        console.log("Error reading onboardingSeen:", err);
      } finally {
        setCheckingOnboarding(false);
      }
    };

    checkOnboarding();
  }, [checkingAuth, user, navigationRef]);

  if (checkingAuth || checkingOnboarding) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#166534" />
      </View>
    );
  }

  return (
    <PaperProvider>
      <ThemeProvider value={DefaultTheme}>
        <StatusBar barStyle='dark-content' backgroundColor='white' />
        <Stack>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(settings)" options={{ headerShown: false }} />
          <Stack.Screen
            name="appliances/[deviceId]/index"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>

        <Toast />
      </ThemeProvider>
    </PaperProvider>
  );
}
