import { Tabs, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, ActivityIndicator, useColorScheme } from "react-native";
import useAuth from "@/hooks/useAuth";
import { StatusBar } from 'expo-status-bar';
import { auth, db } from "@/firebase/firebaseConfig";
import { get, ref } from "firebase/database";
import { generate_otp } from "@/services/apiService";
import TabBar from "@/components/ui/TabBar";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function TabLayout() {
  const router = useRouter();
  const { user, checkingAuth } = useAuth();
  const cleanExpiredCache = async () => {
    const keys = await AsyncStorage.getAllKeys();
    const entries = await AsyncStorage.multiGet(keys);
    const now = Date.now();

    for (const [key, val] of entries) {
      try {
        const cached = JSON.parse(val);
        if (cached?.expiresAt && now > cached.expiresAt) {
          await AsyncStorage.removeItem(key);
          console.log("🧹 Removed expired cache:", key);
        }
      } catch {
        // ignore invalid JSON
      }
    }
  };
  useEffect(() => {

    if (!checkingAuth) {
      if (!user) {
        router.replace("/(auth)/login");
      }
    }
    cleanExpiredCache();
  }, [checkingAuth, user]);

  if (checkingAuth) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#166534" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Tabs tabBar={(props) => <TabBar {...props} />}>
        <Tabs.Screen name="dashboard" options={{ title: "Home", headerShown: false }} />
        <Tabs.Screen name="devices" options={{ title: "Devices", headerShown: false }} />
        <Tabs.Screen name="reports" options={{ title: "Reports", headerShown: false }} />
        <Tabs.Screen name="budget" options={{ title: "Budget", headerShown: false }} />
        <Tabs.Screen name="appliances/[deviceId]/index" options={{ title: "Appliance", headerShown: false }} />
        <Tabs.Screen name="notifications" options={{ title: "Notifications", headerShown: false, tabBarStyle: { display: "none" } }} />
      </Tabs>
    </>
  );
}
