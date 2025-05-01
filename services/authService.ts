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

  // Return data directly without storing tokens here
  // Let AuthContext handle token storage to avoid duplication
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
  try {
    // Call logout endpoint if needed
    await api.post("/auth/logout");
  } catch (error) {
    console.error("Logout API error:", error);
  } finally {
    // Clear stored tokens regardless of API success
    await AsyncStorage.removeItem("authToken");
    await AsyncStorage.removeItem("refreshToken");
  }
};
