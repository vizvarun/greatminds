import { Typography } from "@/constants/Typography";
import { AuthProvider } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    Gabarito: require("@/assets/fonts/Gabarito-Regular.ttf"),
    "Gabarito-Medium": require("@/assets/fonts/Gabarito-Medium.ttf"),
    "Gabarito-Bold": require("@/assets/fonts/Gabarito-Bold.ttf"),
    Outfit: require("@/assets/fonts/Outfit-Regular.ttf"),
    "Outfit-Medium": require("@/assets/fonts/Outfit-Medium.ttf"),
    "Outfit-SemiBold": require("@/assets/fonts/Outfit-SemiBold.ttf"),
    "Outfit-Bold": require("@/assets/fonts/Outfit-Bold.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <AuthProvider>
          <SafeAreaProvider>
            <Stack
              screenOptions={{
                headerShown: false,
                headerStyle: {
                  backgroundColor: "#ffffff",
                },
                headerTitleStyle: {
                  fontFamily: Typography.fontWeight.medium.primary,
                },
                headerBackTitleStyle: {
                  fontFamily: Typography.fontFamily.primary,
                },
              }}
            >
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(parent)" options={{ headerShown: false }} />
              <Stack.Screen name="(teacher)" options={{ headerShown: false }} />
              <Stack.Screen name="(app)" options={{ headerShown: false }} />
            </Stack>
            <Toast />
          </SafeAreaProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
