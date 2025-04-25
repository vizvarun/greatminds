import { Redirect } from "expo-router";
import { useAuth } from "@/context/AuthContext";

export default function Index() {
  const { isAuthenticated, hasCompletedOnboarding, userRole } = useAuth();

  // Redirect based on authentication and onboarding status
  if (!hasCompletedOnboarding) {
    return <Redirect href="/(auth)/onboarding" />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  // If authenticated but no role selected, redirect to role selection
  if (!userRole) {
    return <Redirect href="/(auth)/role-select" />;
  }

  // Redirect based on user role
  if (userRole === "parent") {
    return <Redirect href="/(parent)/dashboard" />;
  } else if (userRole === "teacher") {
    return <Redirect href="/(teacher)/dashboard" />;
  }

  // Fallback to app home if role is not recognized
  return <Redirect href="/(app)/home" />;
}
