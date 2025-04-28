import { Tabs, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Platform, StatusBar, View } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import TabBarBackground from '@/components/ui/TabBarBackground';
import '../../global.css';
import useAuth from '@/hooks/useAuth';

export default function TabLayout() {

  const router = useRouter();
  const { user, checkingAuth } = useAuth();

  useEffect(() => {
    if (!checkingAuth && !user) {
      router.replace('/(auth)/login');
    }
  }, [checkingAuth, user, router]);

  if (checkingAuth || !user) {
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
    </>
  );
}