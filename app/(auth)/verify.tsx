import { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { primary } from "@/constants/Colors";
import { Typography } from "@/constants/Typography";
import CustomAlert from "@/components/ui/CustomAlert";
import KeyboardDismissBar from "@/components/ui/KeyboardDismissBar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Verify() {
  const {
    verifyOtp,
    phoneNumber,
    login,
    isLoading,
    authError,
    clearError,
    getUserProfileAndNavigationTarget,
  } = useAuth();
  const [otpValue, setOtpValue] = useState("");
  const [timer, setTimer] = useState(30);
  const [resendLoading, setResendLoading] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [alert, setAlert] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info" as "success" | "error" | "info" | "warning",
  });

  const inputRef = useRef<TextInput>(null);
  const inputAccessoryViewID = "otpInput";

  useEffect(() => {
    // Ensure the input is focused when the component mounts
    const focusTimer = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 500);

    // Setup countdown timer
    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);

    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      clearTimeout(focusTimer);
      clearInterval(interval);
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Effect to show error messages from auth context
  useEffect(() => {
    if (authError) {
      showAlert("Error", authError, "error");
      clearError();
    }
  }, [authError, clearError]);

  const showAlert = (
    title: string,
    message: string,
    type: "success" | "error" | "info" | "warning" = "info"
  ) => {
    setAlert({
      visible: true,
      title,
      message,
      type,
    });
  };

  const hideAlert = () => {
    setAlert((prev) => ({ ...prev, visible: false }));
  };

  const handleOtpChange = (text: string) => {
    // Only allow digits and limit to 6 characters
    const formattedText = text.replace(/[^0-9]/g, "").slice(0, 6);
    setOtpValue(formattedText);
  };

  const handleVerify = async () => {
    if (otpValue.length !== 6) {
      showAlert(
        "Invalid OTP",
        "Please enter the complete 6-digit OTP",
        "warning"
      );
      return;
    }

    try {
      const isVerified = await verifyOtp(otpValue);
      console.log("OTP verification result:", isVerified);
      if (isVerified) {
        const userDataString = await AsyncStorage.getItem("userData");
        console.log("User data string:", userDataString);
        if (userDataString) {
          const userData = JSON.parse(userDataString);

          if (userData && userData.id) {
            const navigationTarget = await getUserProfileAndNavigationTarget(
              userData.id
            );
            console.log("Navigation target:", navigationTarget);
            if (navigationTarget === "role-select") {
              router.replace("/(auth)/role-select");
            } else if (navigationTarget === "parent") {
              router.replace("/(parent)/dashboard");
            } else if (navigationTarget === "teacher") {
              router.replace("/(teacher)/dashboard");
            }
          } else {
            router.replace("/(auth)/role-select");
          }
        } else {
          router.replace("/(auth)/role-select");
        }
      } else {
        if (!authError) {
          showAlert(
            "Verification Failed",
            "Could not verify your OTP. Please try again.",
            "error"
          );
        }
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      showAlert(
        "Verification Error",
        "An unexpected error occurred. Please try again.",
        "error"
      );
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    try {
      const result = await login(phoneNumber);

      if (result.success) {
        setTimer(30);
        setOtpValue("");
        showAlert(
          "OTP Resent",
          "A new OTP has been sent to your phone number.",
          "success"
        );
      }
    } catch (error) {
    } finally {
      setResendLoading(false);
    }
  };

  const formatPhoneNumber = (number: string) => {
    return `+91 ${number.slice(0, 5)} ${number.slice(5)}`;
  };

  const handleBackPress = () => {
    router.back();
  };

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        {Platform.OS === "android" && keyboardVisible && (
          <KeyboardDismissBar isVisible={keyboardVisible} />
        )}
        <View
          style={[
            styles.content,
            Platform.OS === "android" && styles.androidContent,
          ]}
        >
          <View style={styles.titleContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackPress}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              disabled={isLoading}
            >
              <MaterialCommunityIcons
                name="chevron-left"
                size={28}
                color="#333"
              />
            </TouchableOpacity>
            <Text style={styles.title}>Verify Phone</Text>
          </View>

          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to{"\n"}
            <Text style={styles.phoneText}>
              {formatPhoneNumber(phoneNumber)}
            </Text>
          </Text>

          <View style={styles.otpContainer}>
            {/* Single text input that spans across all boxes */}
            <TextInput
              ref={inputRef}
              style={styles.hiddenTextInput}
              value={otpValue}
              onChangeText={handleOtpChange}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus={false} // Let our useEffect handle focus
              caretHidden={true}
            />

            {/* Visual representation of 6 boxes */}
            <TouchableWithoutFeedback onPress={focusInput}>
              <View style={styles.otpBoxesContainer}>
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <View
                    key={index}
                    style={[
                      styles.otpBox,
                      otpValue.length === index && styles.otpBoxFocused,
                    ]}
                  >
                    <Text style={styles.otpDigit}>{otpValue[index] || ""}</Text>
                  </View>
                ))}
              </View>
            </TouchableWithoutFeedback>
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              (otpValue.length !== 6 || isLoading) && styles.buttonDisabled,
            ]}
            onPress={handleVerify}
            disabled={otpValue.length !== 6 || isLoading}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#ffffff" />
                <Text style={styles.buttonText}>Verifying...</Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>Verify</Text>
            )}
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive the code? </Text>
            {timer > 0 ? (
              <Text style={styles.timerText}>Resend in {timer}s</Text>
            ) : resendLoading ? (
              <ActivityIndicator size="small" color={primary} />
            ) : (
              <TouchableOpacity
                onPress={handleResendOtp}
                disabled={resendLoading}
              >
                <Text style={styles.resendButton}>Resend OTP</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <CustomAlert
          visible={alert.visible}
          title={alert.title}
          message={alert.message}
          type={alert.type}
          onConfirm={hideAlert}
        />

        {Platform.OS === "ios" && (
          <KeyboardDismissBar nativeID={inputAccessoryViewID} />
        )}
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    marginTop: -50,
  },
  androidContent: {
    paddingBottom: 20,
    flex: 1,
    justifyContent: "center",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  backButton: {
    padding: 5,
    marginRight: 8,
  },
  title: {
    fontSize: 32,
    fontFamily: Typography.fontWeight.bold.primary,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    fontFamily: Typography.fontFamily.primary,
    color: "#666",
    marginBottom: 30,
    lineHeight: 24,
  },
  phoneText: {
    fontFamily: Typography.fontWeight.bold.primary,
    color: "#333",
  },
  otpContainer: {
    position: "relative",
    height: 60,
    marginBottom: 30,
    width: "100%",
  },
  hiddenTextInput: {
    position: "absolute",
    width: "100%",
    height: "100%",
    opacity: 0,
    zIndex: 1,
  },
  otpBoxesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    height: "100%",
  },
  otpBox: {
    width: 45,
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  otpBoxFocused: {
    borderColor: primary,
    borderWidth: 2,
  },
  otpDigit: {
    fontSize: 20,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#333",
  },
  button: {
    backgroundColor: primary,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#cccccc",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontFamily: Typography.fontWeight.bold.primary,
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  resendText: {
    color: "#666",
    fontFamily: Typography.fontFamily.primary,
  },
  timerText: {
    color: "#666",
    fontFamily: Typography.fontFamily.primary,
  },
  resendButton: {
    color: primary,
    fontFamily: Typography.fontWeight.bold.primary,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
});
