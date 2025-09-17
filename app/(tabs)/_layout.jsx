import { Tabs, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, StatusBar, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import '../../global.css';
import useAuth from '@/hooks/useAuth';
import { useBudgetStore, useUsageStore } from "../../store/firebaseStore";
import { auth, db } from '@/firebase/firebaseConfig';
import { get, ref } from 'firebase/database';

export default function TabLayout() {

  const router = useRouter();
  const { user, checkingAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const getUserRole = async (uid) => {
    setIsLoading(true);
    try {
      const userRef = ref(db, 'users/' + uid);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const userData = snapshot.val()
        if (userData.role === 'admin')
          router.replace('/(admin)/dashboard');
        setIsLoading(false);
        return;
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  };

  useEffect(() => {

    if (!checkingAuth && !user) {
      router.replace('/(auth)/login');
    } else {
      const fetchUserRole = async () => {
        await getUserRole(auth.currentUser?.uid);
      };
      fetchUserRole();
    }
  }, [checkingAuth, user, router, auth]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#166534" />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: 'black',
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: Platform.select({
            ios: {
              position: 'absolute',
            },
            default: {},
          }),
        }}>
        <Tabs.Screen
          name="index"
          options={{
            tabBarLabel: "Home",
            tabBarIcon: ({ focused }) => (
              <Ionicons name={focused ? "home" : "home-outline"} size={24} color={focused ? "black" : "gray"} />
            ),
          }}
        />
        <Tabs.Screen
          name="devices"
          options={{
            tabBarLabel: "Devices",
            tabBarIcon: ({ focused }) => (
              <MaterialCommunityIcons name={focused ? "lightning-bolt" : "lightning-bolt-outline"} size={24} color={focused ? "black" : "gray"} />
            ),
          }}
        />
        <Tabs.Screen
          name="reports"
          options={{
            tabBarLabel: "Reports",
            tabBarIcon: ({ focused }) => (
              <Ionicons name={focused ? "bar-chart" : "bar-chart-outline"} size={24} color={focused ? "black" : "gray"} />
            ),
          }}
        />
        <Tabs.Screen
          name="budget"
          options={{
            tabBarLabel: "Budget",
            tabBarIcon: ({ focused }) => (
              <Ionicons name={focused ? "cash" : "cash-outline"} size={24} color={focused ? "black" : "gray"} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            tabBarLabel: "Settings",
            tabBarIcon: ({ focused }) => (
              <Ionicons name={focused ? "settings" : "settings-outline"} size={24} color={focused ? "black" : "gray"} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}