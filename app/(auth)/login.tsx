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
  ScrollView,
  Modal,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { primary } from "@/constants/Colors";
import { Typography } from "@/constants/Typography";
import { Ionicons } from "@expo/vector-icons";
import CustomAlert from "@/components/ui/CustomAlert";
import KeyboardDismissBar from "@/components/ui/KeyboardDismissBar";

export default function Login() {
  const { login } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [modalContent, setModalContent] = useState<{
    visible: boolean;
    title: string;
    content: string;
  }>({
    visible: false,
    title: "",
    content: "",
  });
  const [alert, setAlert] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info" as "success" | "error" | "info" | "warning",
  });

  const phoneInputRef = useRef<TextInput>(null);

  const inputAccessoryViewID = "phoneNumberInput";

  useEffect(() => {
    const focusTimer = setTimeout(() => {
      if (phoneInputRef.current) {
        phoneInputRef.current.focus();
      }
    }, 500);

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
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const validatePhoneNumber = (number: string) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(number);
  };

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

  const showTermsModal = () => {
    setModalContent({
      visible: true,
      title: "Terms and Conditions",
      content: `
Welcome to Great Minds!

These Terms and Conditions govern your use of our application and services. By using our application, you agree to these terms.

1. USE OF SERVICE
   - You must be at least 18 years old to use this service
   - You agree to provide accurate information
   - You are responsible for maintaining the confidentiality of your account
   
2. USER CONTENT
   - You retain rights to content you post
   - You grant us license to use your content for service operation
   - You agree not to post inappropriate content
   
3. PRIVACY
   - Our privacy practices are described in our Privacy Policy
   - We collect and process data to provide and improve our services
   
4. LIMITATION OF LIABILITY
   - We provide the service "as is" without warranties
   - We are not liable for any damages arising from your use
   
5. TERMINATION
   - We may terminate your access for violations of these terms
   - You may terminate your account at any time
   
6. CHANGES TO TERMS
   - We may update these terms from time to time
   - Continued use after changes constitutes acceptance
   
7. CONTACT
   - For questions about these terms, please contact us at support@greatminds.com
`,
    });
  };

  const showPrivacyModal = () => {
    setModalContent({
      visible: true,
      title: "Privacy Policy",
      content: `
Privacy Policy for Great Minds

Last Updated: June 1, 2023

1. INFORMATION WE COLLECT
   - Personal information such as name, email, phone number
   - Device information and usage data
   - Location data when you enable location services
   
2. HOW WE USE YOUR INFORMATION
   - To provide and maintain our service
   - To improve and personalize your experience
   - To communicate with you and send notifications
   - For analytics and research purposes
   
3. DATA SHARING AND DISCLOSURE
   - We do not sell your personal information
   - We may share data with service providers
   - We may disclose information when legally required
   
4. DATA SECURITY
   - We implement reasonable security measures
   - We cannot guarantee absolute security
   
5. YOUR RIGHTS
   - Access, correct, or delete your information
   - Opt-out of marketing communications
   - Control location data collection through device settings
   
6. CHILDREN'S PRIVACY
   - Our service is not intended for children under 13
   
7. CHANGES TO POLICY
   - We may update this policy and will notify you of changes
   
8. CONTACT US
   - For questions about this privacy policy, contact privacy@greatminds.com
`,
    });
  };

  const hideModal = () => {
    setModalContent((prev) => ({ ...prev, visible: false }));
  };

  const handleSendOTP = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      showAlert(
        "Invalid Number",
        "Please enter a valid 10-digit phone number",
        "error"
      );
      return;
    }

    if (!agreeToTerms) {
      showAlert(
        "Terms Required",
        "Please agree to the terms and conditions to continue",
        "warning"
      );
      return;
    }

    setIsLoading(true);
    try {
      await login(phoneNumber);
      router.push("/(auth)/verify");
    } catch (error) {
      showAlert("Error", "Failed to send OTP. Please try again.", "error");
    } finally {
      setIsLoading(false);
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
        <View style={styles.content}>
          <Text style={styles.title}>Login</Text>
          <Text style={styles.subtitle}>
            Enter your phone number to continue
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.prefix}>+91</Text>
            <TextInput
              ref={phoneInputRef}
              style={styles.input}
              placeholder="Phone Number"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              keyboardAppearance="light"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              maxLength={10}
              inputAccessoryViewID={
                Platform.OS === "ios" ? inputAccessoryViewID : undefined
              }
              autoFocus={false}
            />
          </View>

          <Text style={styles.info}>
            We'll send you a one-time password to verify your phone number
          </Text>

          <View style={styles.termsContainer}>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setAgreeToTerms(!agreeToTerms)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.customCheckbox,
                  agreeToTerms && styles.checkedCheckbox,
                ]}
              >
                {agreeToTerms && (
                  <Ionicons name="checkmark" size={14} color="white" />
                )}
              </View>
            </TouchableOpacity>

            <Text style={styles.termsText}>
              I agree to the{" "}
              <Text style={styles.termsLink} onPress={showTermsModal}>
                Terms and Conditions
              </Text>{" "}
              and{" "}
              <Text style={styles.termsLink} onPress={showPrivacyModal}>
                Privacy Policy
              </Text>
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              (!validatePhoneNumber(phoneNumber) || !agreeToTerms) &&
                styles.buttonDisabled,
            ]}
            onPress={handleSendOTP}
            disabled={
              !validatePhoneNumber(phoneNumber) || !agreeToTerms || isLoading
            }
          >
            <Text style={styles.buttonText}>
              {isLoading ? "Sending OTP..." : "Continue"}
            </Text>
          </TouchableOpacity>
        </View>

        <CustomAlert
          visible={alert.visible}
          title={alert.title}
          message={alert.message}
          type={alert.type}
          onConfirm={hideAlert}
        />

        <Modal
          visible={modalContent.visible}
          transparent
          animationType="none"
          onRequestClose={hideModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{modalContent.title}</Text>
                <TouchableOpacity onPress={hideModal}>
                  <Ionicons name="close" size={24} color="#555" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalContent}>
                <Text style={styles.modalText}>{modalContent.content}</Text>
              </ScrollView>
              <TouchableOpacity style={styles.modalButton} onPress={hideModal}>
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

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
  },
  inputContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  prefix: {
    fontSize: 16,
    fontFamily: Typography.fontFamily.primary,
    color: "#333",
    paddingRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "#333",
    fontFamily: Typography.fontFamily.primary,
  },
  info: {
    fontSize: 14,
    color: "#888",
    marginBottom: 20,
    fontFamily: Typography.fontFamily.primary,
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 30,
    gap: 10,
  },
  checkboxContainer: {
    padding: 5,
    marginTop: -5,
  },
  customCheckbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  checkedCheckbox: {
    borderColor: primary,
    backgroundColor: primary,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: "#666",
    fontFamily: Typography.fontFamily.primary,
  },
  termsLink: {
    color: primary,
    fontFamily: Typography.fontWeight.semiBold.primary,
    textDecorationLine: "underline",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    width: "100%",
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: Typography.fontWeight.bold.primary,
    color: "#333",
  },
  modalContent: {
    padding: 16,
    maxHeight: 400,
  },
  modalText: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.primary,
    color: "#444",
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: primary,
    borderRadius: 8,
    padding: 14,
    margin: 16,
    alignItems: "center",
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
    fontFamily: Typography.fontWeight.bold.primary,
  },
});
