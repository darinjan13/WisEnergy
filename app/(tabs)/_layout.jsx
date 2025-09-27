import { Tabs, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, StatusBar, View } from 'react-native';
import '../../global.css';
import useAuth from '@/hooks/useAuth';
import TabBar from '@/components/ui/TabBar';
import { auth, db } from '@/firebase/firebaseConfig';
import { get, ref } from 'firebase/database';
import { generate_otp } from '@/services/apiService';
// import { generate_otp } from '@/services/apiService'; // make sure you import this

export default function TabLayout() {
  const router = useRouter();
  const { user, checkingAuth } = useAuth();

  const [checkingVerification, setCheckingVerification] = useState(true);

  const checkUserVerification = async () => {
    try {
      const userRef = ref(db, 'users/' + auth.currentUser.uid);
      const snapshot = await get(userRef);

      if (!snapshot.exists()) {
        throw new Error("User data not found.");
      }

      const userData = snapshot.val();
      console.log("Verified:", userData.verified);

      if (!userData.verified) {
        // ⚠️ Make sure `email` comes from user
        const email = auth.currentUser.email;
        const uid = auth.currentUser.uid;

        const result = await generate_otp(email, true);
        if (result.success) {
          router.replace({
            pathname: '/forgotPassword/verification',
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

  useEffect(() => {
    if (!checkingAuth) {
      if (!user) {
        router.replace('/(auth)/login');
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
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <Tabs tabBar={(props) => <TabBar {...props} />}>
        <Tabs.Screen name="index" options={{ title: 'Home', headerShown: false }} />
        <Tabs.Screen name="devices" options={{ title: 'Devices', headerShown: false }} />
        <Tabs.Screen name="reports" options={{ title: 'Reports', headerShown: false }} />
        <Tabs.Screen name="budget" options={{ title: 'Budget', headerShown: false }} />
      </Tabs>
    </>
  );
}
