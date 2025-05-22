import {
  AuthResponse,
  LoginResponse,
  SetRoleRequest,
  UserRole,
} from "@/types/api.types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./api";

// Send OTP to user's phone
export const sendOtp = async (
  phoneNumber: string,
  deviceId: string
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>("/auth/send-otp", null, {
    params: {
      mobile_number: phoneNumber,
      device_id: deviceId,
      bypass_otp: true,
    },
  });

  return response.data;
};

// Verify OTP and complete login
export const verifyOtp = async (
  phoneNumber: string,
  otp: string,
  deviceId: string,
  requestId?: string
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/verify-otp", null, {
    params: {
      mobile_number: phoneNumber,
      otp,
      device_id: deviceId,
    },
  });

  console.log("Response from verifyOtp:", response.data);
  return response.data;
};

// Update user role
export const setUserRole = async (role: UserRole): Promise<AuthResponse> => {
  const request: SetRoleRequest = { role };
  const response = await api.put<AuthResponse>("/auth/role", request);
  return response.data;
};

// Logout user
export const logout = async (): Promise<void> => {
  // Remove API call and just clear storage
  await AsyncStorage.removeItem("authToken");
  await AsyncStorage.removeItem("refreshToken");
  // We're not removing userRole to remember preference when logging back in
};

// Validate authentication token
export const validateToken = async (token: string): Promise<AuthResponse> => {
  try {
    const response = await api.post("/auth/validate-token", null, {
      params: {
        token,
      },
    });

    console.log("Token validation response:", response.data);
    await AsyncStorage.setItem("hasCompletedOnboarding", "true");
    const existingRole = await AsyncStorage.getItem("userRole");
    return {
      token: response.data.token,
      refreshToken: response.data.token, // Use the same token as refresh token if not provided
      user: {
        id: response.data.user.id.toString(),
        phoneNumber: response.data.user.mobileNo,
        name:
          response.data.user.firstName +
          (response.data.user.lastName
            ? " " + response.data.user.lastName
            : ""),
        email: response.data.user.email || "",
        role: (existingRole as UserRole) || undefined, // Preserve existing role if available
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error("Token validation error:", error);
    throw error;
  }
};
