import AsyncStorage from "@react-native-async-storage/async-storage";

export const logAuthState = async () => {
  try {
    const authToken = await AsyncStorage.getItem("authToken");
    const refreshToken = await AsyncStorage.getItem("refreshToken");
    const phoneNumber = await AsyncStorage.getItem("phoneNumber");
    const userRole = await AsyncStorage.getItem("userRole");
    const deviceId = await AsyncStorage.getItem("deviceId");

    console.log("=== Auth State Debug ===");
    console.log("authToken exists:", !!authToken);
    console.log("refreshToken exists:", !!refreshToken);
    console.log("phoneNumber:", phoneNumber);
    console.log("userRole:", userRole);
    console.log("deviceId:", deviceId);
    console.log("========================");

    return {
      isAuthenticated: !!authToken,
      hasRefreshToken: !!refreshToken,
      phoneNumber,
      userRole,
      deviceId,
    };
  } catch (error) {
    console.error("Error logging auth state:", error);
    return null;
  }
};
