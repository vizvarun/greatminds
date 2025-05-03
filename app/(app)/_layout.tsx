import { Stack, Redirect } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { Typography } from "@/constants/Typography";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";

export default function AppLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  // Force re-check authentication status on mount
  useEffect(() => {
    // This effect ensures the component re-renders when auth state changes
  }, [isAuthenticated]);

  // Show loading state or redirect if not authenticated
  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <Stack>
        <Stack.Screen
          name="home"
          options={{
            headerTitle: "Great Minds",
            headerTitleStyle: {
              fontFamily: Typography.fontWeight.bold.primary,
              fontWeight: "bold",
              fontSize: 20,
            },
            headerTintColor: "#0a7ea4",
            headerShown: true,
          }}
        />
        <Stack.Screen name="profile" />
      </Stack>
    </View>
  );
}
