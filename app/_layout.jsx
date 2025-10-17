import { Slot } from "expo-router";
import { PaperProvider } from 'react-native-paper';
import { StatusBar, useColorScheme } from 'react-native';
import Toast from "react-native-toast-message";
import * as Notifications from "expo-notifications";
import { useNotifications } from "@/hooks/useNotifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  useNotifications();
  const colorScheme = useColorScheme();
  return (
    <PaperProvider>
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colorScheme === "dark" ? "#000000" : "#ffffff"}
      />
      <Slot />
      <Toast />
    </PaperProvider>
  );
}
