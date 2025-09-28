import { Tabs, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, ActivityIndicator, StatusBar, useColorScheme } from "react-native";
import useAuth from "@/hooks/useAuth";
import { auth, db } from "@/firebase/firebaseConfig";
import { get, ref } from "firebase/database";
import { generate_otp } from "@/services/apiService";
import TabBar from "@/components/ui/TabBar";

export default function TabLayout() {
  const router = useRouter();
  const { user, checkingAuth } = useAuth();
  const [checkingVerification, setCheckingVerification] = useState(true);
  const colorScheme = useColorScheme();

  useEffect(() => {
    const checkUserVerification = async () => {
      try {
        const userRef = ref(db, "users/" + auth.currentUser.uid);
        const snapshot = await get(userRef);
        if (!snapshot.exists()) throw new Error("User not found");

        const userData = snapshot.val();
        if (!userData.verified) {
          const email = auth.currentUser.email;
          const uid = auth.currentUser.uid;
          const result = await generate_otp(email, true);

          if (result.success) {
            router.replace({
              pathname: "/forgotPassword/verification",
              params: { email, from: "login", uid },
            });
            return;
          }
        }
      } catch (err) {
        console.error("Verification check failed:", err);
      } finally {
        setCheckingVerification(false);
      }
    };

    if (!checkingAuth) {
      if (!user) {
        router.replace("/(auth)/login");
      } else {
        checkUserVerification();
      }
    }
  }, [checkingAuth, user]);

  if (checkingAuth || checkingVerification) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#166534" />
      </View>
    );
  }

  return (
    <>
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colorScheme === "dark" ? "#000000" : "#ffffff"}
      />
      <Tabs tabBar={(props) => <TabBar {...props} />}>
        <Tabs.Screen name="dashboard" options={{ title: "Home", headerShown: false }} />
        <Tabs.Screen name="devices" options={{ title: "Devices", headerShown: false }} />
        <Tabs.Screen name="reports" options={{ title: "Reports", headerShown: false }} />
        <Tabs.Screen name="budget" options={{ title: "Budget", headerShown: false }} />
        <Tabs.Screen name="appliances/[deviceId]/index" options={{ title: "Appliance", headerShown: false }} />
      </Tabs>
    </>
  );
}
