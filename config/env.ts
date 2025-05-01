// Environment configuration for the app

import {
  API_BASE_URL as ENV_API_BASE_URL,
  API_TIMEOUT as ENV_API_TIMEOUT,
  ENABLE_ANALYTICS as ENV_ENABLE_ANALYTICS,
  ENABLE_PUSH_NOTIFICATIONS as ENV_ENABLE_PUSH_NOTIFICATIONS,
} from "@env";

// API base URL - default value as fallback
export const API_BASE_URL =
  ENV_API_BASE_URL || "https://api.greatminds-edu.com/v1";

// API timeouts (in milliseconds)
export const API_TIMEOUT = Number(ENV_API_TIMEOUT) || 30000; // 30 seconds

// Feature flags
export const FEATURES = {
  ENABLE_ANALYTICS: ENV_ENABLE_ANALYTICS === "true",
  ENABLE_PUSH_NOTIFICATIONS: ENV_ENABLE_PUSH_NOTIFICATIONS === "true",
};
