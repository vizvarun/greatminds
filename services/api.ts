import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL, API_TIMEOUT } from "@/config/env";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor for API calls
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("authToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 Unauthorized errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshToken = await AsyncStorage.getItem("refreshToken");
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          // Store new tokens
          const { token, refreshToken: newRefreshToken } = response.data;
          await AsyncStorage.setItem("authToken", token);
          await AsyncStorage.setItem("refreshToken", newRefreshToken);

          // Retry the original request with new token
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, redirect to login
        await handleLogout();
      }
    }

    return Promise.reject(error);
  }
);

// Handle logout - clear all auth tokens
const handleLogout = async () => {
  await AsyncStorage.removeItem("authToken");
  await AsyncStorage.removeItem("refreshToken");
  // The app routing will handle the redirect to login
};

export default api;
