import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as authService from "@/services/authService";
import * as userService from "@/services/userService";
import { UserRole } from "@/types/api.types";
import { logAuthState } from "@/utils/debugUtils";
import { router } from "expo-router";
import CustomAlert from "@/components/ui/CustomAlert";

// Update the UserProfile type to reflect the new API response structure
interface UserProfile {
  student_ids?: number[];
  school_ids?: number[];
  class_ids?: number[];
  sections?: any[];
  // ...other properties as needed
}

type AuthContextType = {
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  phoneNumber: string;
  userRole: UserRole;
  isLoading: boolean;
  authError: string | null;
  hasBothRoles: boolean; // Add this new property
  completeOnboarding: () => Promise<void>;
  login: (
    phoneNumber: string
  ) => Promise<{ success: boolean; requestId?: string }>;
  verifyOtp: (otp: string) => Promise<boolean>;
  logout: () => Promise<void>;
  setPhoneNumber: (number: string) => void;
  setUserRole: (role: UserRole) => Promise<void>;
  clearError: () => void;
  getUserProfileAndNavigationTarget: (userId: number) => Promise<string>;
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: false,
  hasCompletedOnboarding: false,
  phoneNumber: "",
  userRole: null,
  authError: null,
  hasBothRoles: false, // Add default value
  completeOnboarding: async () => {},
  login: async () => ({ success: false }),
  verifyOtp: async () => false,
  logout: async () => {},
  setPhoneNumber: () => {},
  setUserRole: async () => {},
  clearError: () => {},
  getUserProfileAndNavigationTarget: async () => "role-select",
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [deviceId, setDeviceId] = useState<string>("");
  const [userRole, setUserRoleState] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | undefined>(undefined);
  const [hasBothRoles, setHasBothRoles] = useState<boolean>(false);

  // New state for our custom alert
  const [customAlert, setCustomAlert] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info" | "warning";
    onConfirm: () => void;
  } | null>(null);

  useEffect(() => {
    // Load auth state from storage
    const loadAuthState = async () => {
      try {
        // Check for auth token first (most important)
        const authToken = await AsyncStorage.getItem("authToken");
        const onboardingStatus = await AsyncStorage.getItem(
          "hasCompletedOnboarding"
        );
        const savedPhoneNumber = await AsyncStorage.getItem("phoneNumber");
        const role = await AsyncStorage.getItem("userRole");
        const storedDeviceId = await AsyncStorage.getItem("deviceId");

        setHasCompletedOnboarding(onboardingStatus === "true");
        setIsAuthenticated(!!authToken);

        if (savedPhoneNumber) {
          setPhoneNumber(savedPhoneNumber);
        }

        if (role) {
          setUserRoleState(role as UserRole);
        }

        if (storedDeviceId) {
          setDeviceId(storedDeviceId);
        } else {
          const newDeviceId = generateDeviceId();
          await AsyncStorage.setItem("deviceId", newDeviceId);
          setDeviceId(newDeviceId);
        }
      } catch (error) {
        console.error("Failed to load auth state:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthState();
  }, []);

  const clearError = () => setAuthError(null);

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem("hasCompletedOnboarding", "true");
      setHasCompletedOnboarding(true);
    } catch (error) {
      console.error("Error completing onboarding:", error);
    }
  };

  const login = async (
    phoneNum: string
  ): Promise<{ success: boolean; requestId?: string }> => {
    setIsLoading(true);
    clearError();
    setPhoneNumber(phoneNum);

    try {
      // Get or generate device ID
      const storedDeviceId = await AsyncStorage.getItem("deviceId");
      const currentDeviceId = storedDeviceId || generateDeviceId();

      if (!storedDeviceId) {
        await AsyncStorage.setItem("deviceId", currentDeviceId);
      }

      setDeviceId(currentDeviceId);

      const response = await authService.sendOtp(phoneNum, currentDeviceId);
      if (response.requestId) {
        setRequestId(response.requestId);
      }
      return { success: true, requestId: response.requestId };
    } catch (error: any) {
      // Extract error message if available
      const errorMessage =
        error.response?.data?.detail || "Failed to send OTP. Please try again.";
      setAuthError(errorMessage);

      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (otp: string): Promise<boolean> => {
    setIsLoading(true);
    clearError();

    try {
      console.log("Verifying OTP:", otp, "for phone:", phoneNumber);

      // Call API to verify OTP with the deviceId parameter
      const response = await authService.verifyOtp(
        phoneNumber,
        otp,
        deviceId,
        requestId
      );

      console.log("Verification response received:", JSON.stringify(response));

      // Explicit check for token existence
      if (!response || typeof response.token !== "string") {
        console.error("Invalid response structure:", response);
        setAuthError("Invalid response received from server");
        return false;
      }

      // Store tokens in AsyncStorage
      console.log("Storing tokens in AsyncStorage");
      await AsyncStorage.setItem("authToken", response.token);
      await AsyncStorage.setItem("phoneNumber", phoneNumber);

      // Log auth state to verify storage
      await logAuthState();

      // Update authentication state
      console.log("Setting authenticated state to true");
      setIsAuthenticated(true);

      // Store user data if available
      if (response.user) {
        await AsyncStorage.setItem("userData", JSON.stringify(response.user));
        console.log("User data stored:", response.user);
      }

      // If user profile includes role, set it
      if (response.user && response.user.role) {
        console.log("Setting user role:", response.user.role);
        try {
          await AsyncStorage.setItem("userRole", response.user.role);
          setUserRoleState(response.user.role);
        } catch (roleError) {
          console.error("Error setting role:", roleError);
        }
      }

      return true;
    } catch (error: any) {
      console.error("OTP verification error:", error);
      // Extract error message if available
      const errorMessage =
        error.response?.data?.message ||
        "Failed to verify OTP. Please try again.";
      setAuthError(errorMessage);

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const setUserRole = async (role: UserRole) => {
    try {
      setIsLoading(true);
      clearError();

      // Skip API call as we already have the data from user profile
      // await authService.setUserRole(role);

      // Update local storage and state
      if (role) {
        await AsyncStorage.setItem("userRole", role);
      } else {
        await AsyncStorage.removeItem("userRole");
      }

      setUserRoleState(role);
    } catch (error: any) {
      console.error("Error setting user role:", error);

      const errorMessage =
        error.response?.data?.message || "Failed to update user role.";
      setAuthError(errorMessage);

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    clearError();

    try {
      // Call service function that only clears storage
      await authService.logout();

      // Also clear additional data
      await AsyncStorage.removeItem("userData");
      await AsyncStorage.removeItem("phoneNumber");
      // Note: We're not clearing userRole as per existing comment
      // "Don't reset role on logout to remember preference"

      // Update state
      setIsAuthenticated(false);
      setPhoneNumber("");

      return;
    } catch (error) {
      console.error("Error during logout:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to generate a deviceId if none exists
  const generateDeviceId = (): string => {
    return "dev_" + Math.random().toString(36).substring(2, 15);
  };

  // Enhance the getUserProfileAndNavigationTarget method to also handle missing data and redirect back to login.
  const getUserProfileAndNavigationTarget = async (
    userId: number
  ): Promise<string> => {
    try {
      setIsLoading(true);
      const userProfile = await userService.getUserProfile(userId);
      console.log("User profile fetched:", userProfile);
      const hasStudents =
        Array.isArray(userProfile.student_ids) &&
        userProfile.student_ids.length > 0;
      const hasSchools =
        Array.isArray(userProfile.school_ids) &&
        userProfile.school_ids.length > 0;

      setHasBothRoles(hasStudents && hasSchools);

      if (!hasStudents && !hasSchools) {
        setCustomAlert({
          visible: true,
          title: "No Data Found",
          message:
            "No student or school data found. Please contact your school.",
          type: "warning",
          onConfirm: () => {
            router.replace("/(auth)/login");
            setCustomAlert(null);
          },
        });
        return "";
      }

      if (hasStudents && hasSchools) {
        return "role-select"; // Show role switcher
      } else if (hasStudents) {
        return "parent"; // Show parent dashboard
      } else if (hasSchools) {
        return "teacher"; // Show teacher dashboard
      } else {
        return "role-select"; // Default fallback
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setCustomAlert({
        visible: true,
        title: "Error",
        message:
          "There was an error fetching the user profile. Please try again.",
        type: "error",
        onConfirm: () => {
          router.replace("/(auth)/login");
          setCustomAlert(null);
        },
      });
      return "";
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        hasCompletedOnboarding,
        phoneNumber,
        userRole,
        isLoading,
        authError,
        hasBothRoles, // Expose the new property
        completeOnboarding,
        login,
        verifyOtp,
        logout,
        setPhoneNumber,
        setUserRole,
        clearError,
        getUserProfileAndNavigationTarget,
      }}
    >
      {/* Render CustomAlert if triggered */}
      {customAlert && (
        <CustomAlert
          visible={customAlert.visible}
          title={customAlert.title}
          message={customAlert.message}
          type={customAlert.type}
          onConfirm={customAlert.onConfirm}
        />
      )}
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
