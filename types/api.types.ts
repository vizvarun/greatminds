// API Request and Response Types

// Auth Types
export type UserRole = "parent" | "teacher" | null;

export interface LoginRequest {
  phoneNumber: string;
  countryCode?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  requestId?: string;
}

export interface VerifyOtpRequest {
  phoneNumber: string;
  otp: string;
  requestId?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    phoneNumber: string;
    name?: string;
    email?: string;
    role?: UserRole;
    createdAt: string;
    updatedAt: string;
  };
}

export interface SetRoleRequest {
  role: UserRole;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}
