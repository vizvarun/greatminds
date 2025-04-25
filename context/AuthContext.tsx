import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Add UserRole type
type UserRole = "parent" | "teacher" | null;

type AuthContextType = {
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  phoneNumber: string;
  userRole: UserRole;
  isLoading: boolean;
  completeOnboarding: () => Promise<void>;
  login: (phoneNumber: string) => Promise<void>;
  verifyOtp: (otp: string) => Promise<boolean>;
  logout: () => Promise<void>;
  setPhoneNumber: (number: string) => void;
  setUserRole: (role: UserRole) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [userRole, setUserRoleState] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load auth state from storage
    const loadAuthState = async () => {
      try {
        const onboardingStatus = await AsyncStorage.getItem(
          "hasCompletedOnboarding"
        );
        const authStatus = await AsyncStorage.getItem("isAuthenticated");
        const role = await AsyncStorage.getItem("userRole");

        setHasCompletedOnboarding(onboardingStatus === "true");
        setIsAuthenticated(authStatus === "true");
        setUserRoleState(role as UserRole);
      } catch (error) {
        console.error("Failed to load auth state:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthState();
  }, []);

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem("hasCompletedOnboarding", "true");
      setHasCompletedOnboarding(true);
    } catch (error) {
      console.error("Error completing onboarding:", error);
    }
  };

  const login = async (number: string) => {
    setPhoneNumber(number);
    // In a real app, you would initiate the OTP sending process here
    console.log(`OTP sent to ${number}`);
    // For demo purposes, we're not actually sending an OTP
  };

  // Add function to set user role
  const setUserRole = async (role: UserRole) => {
    try {
      if (role) {
        await AsyncStorage.setItem("userRole", role);
      } else {
        await AsyncStorage.removeItem("userRole");
      }
      setUserRoleState(role);
    } catch (error) {
      console.error("Error setting user role:", error);
    }
  };

  const verifyOtp = async (otp: string) => {
    // Hardcoded OTP verification - only "111111" is considered valid
    if (otp === "111111") {
      try {
        await AsyncStorage.setItem("isAuthenticated", "true");
        setIsAuthenticated(true);
        return true;
      } catch (error) {
        console.error("Error during authentication:", error);
        return false;
      }
    }
    return false;
  };

  const logout = async () => {
    try {
      // Clear all authentication-related storage
      await AsyncStorage.multiSet([
        ["isAuthenticated", "false"],
        ["phoneNumber", ""],
      ]);

      // Don't clear role on logout to remember preference
      // await AsyncStorage.removeItem("userRole");

      setIsAuthenticated(false);
      setPhoneNumber("");
      // Don't reset role on logout
      // setUserRoleState(null);

      console.log("Logout successful");
      return true;
    } catch (error) {
      console.error("Error during logout:", error);
      throw error;
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
        completeOnboarding,
        login,
        verifyOtp,
        logout,
        setPhoneNumber,
        setUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
