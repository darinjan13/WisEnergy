import { Slot } from "expo-router";
import { PaperProvider } from 'react-native-paper';
import { StatusBar, useColorScheme } from 'react-native';
import Toast from "react-native-toast-message";

export default function RootLayout() {
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
