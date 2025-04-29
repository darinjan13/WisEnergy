import { useEffect } from "react";
import { ThemeProvider, DefaultTheme } from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";
import { Provider as PaperProvider } from 'react-native-paper';

import { View, ActivityIndicator } from "react-native";
import { useNavigationContainerRef } from "@react-navigation/native";
import Toast from 'react-native-toast-message';
import useAuth from "@/hooks/useAuth";

export default function RootLayout() {
  const { user, checkingAuth } = useAuth();
  const router = useRouter();
  const navigationRef = useNavigationContainerRef();

  useEffect(() => {
    if (!checkingAuth && navigationRef.isReady()) {
      router.replace(user ? "/(tabs)" : "/(auth)/login");
    }
  }, [checkingAuth, user, navigationRef]);

  if (checkingAuth) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#166534" />
      </View>
    );
  }

  return (
    <PaperProvider>
      <ThemeProvider value={DefaultTheme}>
        <Stack>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <Toast />
      </ThemeProvider>
    </PaperProvider>
  );
}
