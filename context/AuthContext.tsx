import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as authService from "@/services/authService";
import * as userService from "@/services/userService";
import { UserRole } from "@/types/api.types";
import { logAuthState } from "@/utils/debugUtils";
import { router } from "expo-router";
import CustomAlert from "@/components/ui/CustomAlert";

// Update the UserProfile type to include student profiles
interface UserProfile {
  user?: {
    id: number;
    // other user fields
  };
  student_ids?: number[];
  school_ids?: any[]; // Using the existing structure
  class_ids?: number[];
  sections?: any[];
  // ...other properties
}

type AuthContextType = {
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  phoneNumber: string;
  userRole: UserRole;
  isLoading: boolean;
  authError: string | null;
  hasBothRoles: boolean;
  userProfile: UserProfile | null;
  studentProfiles: StudentProfile[] | null; // Add studentProfiles to context type
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
  refreshUserProfile: () => Promise<UserProfile | null>;
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: false,
  hasCompletedOnboarding: false,
  phoneNumber: "",
  userRole: null,
  authError: null,
  hasBothRoles: false,
  userProfile: null,
  studentProfiles: null, // Add default value
  completeOnboarding: async () => {},
  login: async () => ({ success: false }),
  verifyOtp: async () => false,
  logout: async () => {},
  setPhoneNumber: () => {},
  setUserRole: async () => {},
  clearError: () => {},
  getUserProfileAndNavigationTarget: async () => "",
  refreshUserProfile: async () => null,
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
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [studentProfiles, setStudentProfiles] = useState<
    StudentProfile[] | null
  >(null);

  const [customAlert, setCustomAlert] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info" | "warning";
    onConfirm: () => void;
  } | null>(null);

  useEffect(() => {
    const loadAuthState = async () => {
      try {
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

      const response = await authService.verifyOtp(
        phoneNumber,
        otp,
        deviceId,
        requestId
      );

      console.log("Verification response received:", JSON.stringify(response));

      if (!response || typeof response.token !== "string") {
        console.error("Invalid response structure:", response);
        setAuthError("Invalid response received from server");
        return false;
      }

      console.log("Storing tokens in AsyncStorage");
      await AsyncStorage.setItem("authToken", response.token);
      await AsyncStorage.setItem("phoneNumber", phoneNumber);

      await logAuthState();

      console.log("Setting authenticated state to true");
      setIsAuthenticated(true);

      if (response.user) {
        await AsyncStorage.setItem("userData", JSON.stringify(response.user));
        console.log("User data stored:", response.user);
      }

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
      await authService.logout();

      await AsyncStorage.removeItem("userData");
      await AsyncStorage.removeItem("phoneNumber");

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

  const generateDeviceId = (): string => {
    return "dev_" + Math.random().toString(36).substring(2, 15);
  };

  const refreshUserProfile = async (): Promise<UserProfile | null> => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      if (userData) {
        const parsedUserData = JSON.parse(userData);
        if (parsedUserData.id) {
          setIsLoading(true);
          const profile = await userService.getUserProfile(parsedUserData.id);
          setUserProfile(profile);

          if (profile.student_ids && profile.student_ids.length > 0) {
            try {
              const profiles = await userService.getStudentProfiles(
                parsedUserData.id,
                profile.student_ids
              );
              setStudentProfiles(profiles);
            } catch (profileError: any) {
              console.error("Error fetching student profiles:", profileError);

              const errorMessage =
                profileError.errorDetail ||
                profileError.response?.data?.detail ||
                profileError.response?.data?.message ||
                "Failed to load student profile data. Please try again later.";

              setCustomAlert({
                visible: true,
                title: "Student Profile Error",
                message: errorMessage,
                type: "error",
                onConfirm: () => {
                  setCustomAlert(null);
                },
              });
            }
          }

          return profile;
        }
      }
    } catch (error) {
      console.error("Error refreshing user profile:", error);
      setCustomAlert({
        visible: true,
        title: "Profile Error",
        message:
          "Failed to refresh profile data. Please check your connection and try again.",
        type: "error",
        onConfirm: () => {
          setCustomAlert(null);
        },
      });
    } finally {
      setIsLoading(false);
    }
    return null;
  };

  const getUserProfileAndNavigationTarget = async (
    userId: number
  ): Promise<string> => {
    try {
      setIsLoading(true);
      const userProfile = await userService.getUserProfile(userId);
      console.log("User profile fetched:", userProfile);

      setUserProfile(userProfile);

      const hasStudents =
        Array.isArray(userProfile.student_ids) &&
        userProfile.student_ids.length > 0;
      const hasSchools =
        Array.isArray(userProfile.school_ids) &&
        userProfile.school_ids.length > 0;

      setHasBothRoles(hasStudents && hasSchools);

      if (hasStudents) {
        try {
          const profiles = await userService.getStudentProfiles(
            userId,
            userProfile.student_ids
          );
          console.log("Student profiles fetched:", profiles);
          setStudentProfiles(profiles);
        } catch (profileError: any) {
          console.error("Error fetching student profiles:", profileError);

          const errorMessage =
            profileError.errorDetail ||
            profileError.response?.data?.detail ||
            profileError.response?.data?.message ||
            "Failed to load student profile data. Please try again later.";

          setCustomAlert({
            visible: true,
            title: "Student Profile Error",
            message: errorMessage,
            type: "error",
            onConfirm: () => {
              setCustomAlert(null);
            },
          });
        }
      }

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
        return "role-select";
      } else if (hasStudents) {
        return "parent";
      } else if (hasSchools) {
        return "teacher";
      } else {
        return "role-select";
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
        hasBothRoles,
        userProfile,
        studentProfiles,
        completeOnboarding,
        login,
        verifyOtp,
        logout,
        setPhoneNumber,
        setUserRole,
        clearError,
        getUserProfileAndNavigationTarget,
        refreshUserProfile,
      }}
    >
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
