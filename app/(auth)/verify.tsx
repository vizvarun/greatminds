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
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { primary } from "@/constants/Colors";
import { Typography } from "@/constants/Typography";
import CustomAlert from "@/components/ui/CustomAlert";
import KeyboardDismissBar from "@/components/ui/KeyboardDismissBar";

export default function Verify() {
  const { verifyOtp, phoneNumber } = useAuth();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [alert, setAlert] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info" as "success" | "error" | "info" | "warning",
  });

  const inputRefs = useRef<Array<TextInput | null>>([]);
  const inputAccessoryViewID = "otpInput";

  useEffect(() => {
    // Auto focus the first input with a longer delay to prevent flashing
    const focusTimer = setTimeout(() => {
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
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

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto move to next input
    if (text.length === 1 && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace
    if (e.nativeEvent.key === "Backspace" && index > 0 && otp[index] === "") {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      showAlert(
        "Invalid OTP",
        "Please enter the complete 6-digit OTP",
        "warning"
      );
      return;
    }

    setIsLoading(true);
    try {
      const isVerified = await verifyOtp(otpString);
      if (isVerified) {
        // Navigate to role selection instead of home screen
        router.replace("/(auth)/role-select");
      } else {
        showAlert(
          "Verification Failed",
          "The OTP you entered is incorrect. Please try again.",
          "error"
        );
      }
    } catch (error) {
      showAlert("Error", "Failed to verify OTP. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = () => {
    // Reset timer and resend OTP logic would go here
    setTimer(30);
    showAlert(
      "OTP Resent",
      "A new OTP has been sent to your phone number.",
      "success"
    );
  };

  const formatPhoneNumber = (number: string) => {
    return `+91 ${number.slice(0, 5)} ${number.slice(5)}`;
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
        <View style={styles.content}>
          <Text style={styles.title}>Verify Phone</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to{"\n"}
            <Text style={styles.phoneText}>
              {formatPhoneNumber(phoneNumber)}
            </Text>
          </Text>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                style={styles.otpInput}
                keyboardType="number-pad"
                keyboardAppearance="light"
                maxLength={1}
                value={digit}
                onChangeText={(text) => handleOtpChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                inputAccessoryViewID={
                  Platform.OS === "ios" ? inputAccessoryViewID : undefined
                }
                autoFocus={false} // Setting to false for more controlled focus management
              />
            ))}
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              otp.some((digit) => digit === "") && styles.buttonDisabled,
            ]}
            onPress={handleVerify}
            disabled={otp.some((digit) => digit === "") || isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? "Verifying..." : "Verify"}
            </Text>
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive the code? </Text>
            {timer > 0 ? (
              <Text style={styles.timerText}>Resend in {timer}s</Text>
            ) : (
              <TouchableOpacity onPress={handleResendOtp}>
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
  title: {
    fontSize: 32,
    fontFamily: Typography.fontWeight.bold.primary,
    marginBottom: 10,
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
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  otpInput: {
    width: 45,
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    textAlign: "center",
    fontSize: 20,
    fontFamily: Typography.fontWeight.medium.primary,
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
});
