import React from "react";
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Typography } from "@/constants/Typography";
import { primary } from "@/constants/Colors";

type AlertProps = {
  visible: boolean;
  title: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
  onConfirm: () => void;
  onCancel?: () => void;
  showCancelButton?: boolean;
  cancelable?: boolean;
};

const CustomAlert = ({
  visible,
  title,
  message,
  type,
  onConfirm,
  onCancel,
  showCancelButton = false,
  cancelable = true,
}: AlertProps) => {
  // Set the appropriate icon and color based on alert type
  const alertConfig = {
    success: {
      icon: "check-circle",
      color: "#4CAF50",
    },
    error: {
      icon: "close-circle",
      color: "#F44336",
    },
    info: {
      icon: "information",
      color: primary,
    },
    warning: {
      icon: "alert",
      color: "#FF9800",
    },
  };

  const { icon, color } = alertConfig[type];

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={cancelable ? onCancel : undefined}
    >
      <TouchableWithoutFeedback onPress={cancelable ? onCancel : undefined}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons name={icon} size={40} color={color} />
              </View>

              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>

              <View style={styles.buttonContainer}>
                {showCancelButton && (
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={onCancel}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.confirmButton,
                    { backgroundColor: color },
                  ]}
                  onPress={onConfirm}
                >
                  <Text style={styles.confirmButtonText}>
                    {type === "info" && showCancelButton ? "Confirm" : "OK"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: Typography.fontWeight.semiBold.primary,
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontSize: 15,
    fontFamily: Typography.fontFamily.primary,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  confirmButton: {
    backgroundColor: primary,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: Typography.fontWeight.medium.primary,
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
    marginRight: 10,
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontFamily: Typography.fontWeight.medium.primary,
  },
});

export default CustomAlert;
