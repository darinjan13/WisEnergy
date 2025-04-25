import { Tabs, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import TabBarBackground from '@/components/ui/TabBarBackground';
import '../../global.css';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase/firebaseConfig';

export default function TabLayout() {

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);

      if (!currentUser) {
        router.replace("/(auth)/login");
      }
    });

    return unsubscribe;
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: 'black',
        // tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
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
        name="appliances"
        options={{
          tabBarLabel: "Appliances",
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
          title: "Settings",
          tabBarLabel: "Settings",
          tabBarIcon: ({ focused }) => (
            <Ionicons name={focused ? "settings" : "settings-outline"} size={24} color={focused ? "black" : "gray"} />
          ),
        }}
      />
    </Tabs>
  );
}