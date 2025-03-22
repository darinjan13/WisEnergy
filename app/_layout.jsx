import { useEffect, useState } from "react";
import { ThemeProvider, DefaultTheme } from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase/firebaseConfig"; // Import your Firebase auth instance
import { View, ActivityIndicator } from "react-native";
import { useNavigationContainerRef } from "@react-navigation/native";

export default function RootLayout() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();
  const navigationRef = useNavigationContainerRef(); // Ensures navigation is mounted

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setCheckingAuth(false);
    });

    return unsubscribe;
  }, []);

  const segments = useSegments();

  // useEffect(() => {
  //   const pageTitle = {
  //     "": "Home - WisEnergy",
  //     login: "Login - WisEnergy",
  //     register: "Register - WisEnergy",
  //     dashboard: "Dashboard - WisEnergy",
  //   };

  //   const currentSegment = segments[1] || ""; // Get first part of URL
  //   document.title = pageTitle[currentSegment] || "WisEnergy"; // Default title
  // }, [segments]);

  useEffect(() => {
    if (!checkingAuth && navigationRef.isReady() && user) {
      router.replace("/(tabs)"); // Redirect only if navigation is ready
    }
  }, [checkingAuth, user, navigationRef]);

  if (checkingAuth) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}
