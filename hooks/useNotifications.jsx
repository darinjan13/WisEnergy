import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import useAuth from "@/hooks/useAuth";
import { router } from "expo-router";
import {
  persistPushToken,
  registerPushTokenForUser,
} from "@/services/pushTokenService";

export function useNotifications() {
  const [expoPushToken, setExpoPushToken] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    let isMounted = true;

    const setupNotifications = async () => {
      const token = await registerForPushNotificationsAsync();
      if (token && isMounted) {
        setExpoPushToken(token);
        await persistPushToken(token);

        if (user?.uid) {
          try {
            await registerPushTokenForUser(user.uid, token);
          } catch (err) {
            console.error("Failed to save token:", err.message);
          }
        }
      }
    };

    setupNotifications();

    // Foreground listener
    const foregroundSub = Notifications.addNotificationReceivedListener(() => {});

    // Tap listener (background/open)
    const tapSub = Notifications.addNotificationResponseReceivedListener((response) => {
      const screen = response.notification.request.content.data?.screen;
      if (screen) {
        router.push(`/(tabs)/${screen}`);
      }
    });

    return () => {
      isMounted = false;
      foregroundSub.remove();
      tapSub.remove();
    };
  }, [user?.uid]);

  return expoPushToken;
}

async function registerForPushNotificationsAsync() {
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      alert("Permission not granted for push notifications!");
      return null;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;
  } else {
    alert("Must use physical device for push notifications");
  }

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  return token;
}
