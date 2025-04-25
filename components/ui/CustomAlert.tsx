import React, { useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  Keyboard,
  Dimensions,
  Animated,
  TouchableWithoutFeedback,
} from "react-native";
import { Typography } from "@/constants/Typography";
import { primary } from "@/constants/Colors";

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  type?: "success" | "error" | "info" | "warning";
}

const { width } = Dimensions.get("window");

export default function CustomAlert({
  visible,
  title,
  message,
  confirmText = "OK",
  cancelText,
  onConfirm,
  onCancel,
  type = "info",
}: CustomAlertProps) {
  const animation = new Animated.Value(0);

  useEffect(() => {
    if (visible) {
      // Dismiss keyboard when alert appears
      Keyboard.dismiss();

      // Animate in
      Animated.spring(animation, {
        toValue: 1,
        useNativeDriver: true,
        tension: 70,
        friction: 10,
      }).start();
    } else {
      // Animate out
      Animated.timing(animation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  // Color based on alert type - more subtle colors
  const getColor = () => {
    switch (type) {
      case "success":
        return "#69c779"; // softer green
      case "error":
        return "#f87171"; // softer red
      case "warning":
        return "#fbbf24"; // softer yellow
      default:
        return primary;
    }
  };

  const alertColor = getColor();

  const translateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [100, 0],
  });

  const opacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  // Don't render anything if not visible
  if (!visible) return null;

  return (
    <Modal visible={true} transparent animationType="none">
      <TouchableWithoutFeedback onPress={onCancel || onConfirm}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <Animated.View
              style={[
                styles.alertContainer,
                {
                  opacity,
                  transform: [{ translateY }],
                },
              ]}
            >
              <View style={styles.content}>
                <Text style={[styles.title, { color: alertColor }]}>
                  {title}
                </Text>
                <Text style={styles.message}>{message}</Text>
              </View>
              <View style={styles.buttonContainer}>
                {cancelText && (
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={onCancel}
                  >
                    <Text style={styles.cancelText}>{cancelText}</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.confirmButton,
                    { flex: cancelText ? 1 : 2 },
                  ]}
                  onPress={onConfirm}
                >
                  <Text style={[styles.confirmText, { color: alertColor }]}>
                    {confirmText}
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  alertContainer: {
    width: width * 0.85,
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
    maxHeight: "80%",
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 17,
    fontFamily: Typography.fontWeight.bold.primary,
    marginBottom: 10,
    textAlign: "center",
  },
  message: {
    fontSize: 15,
    color: "#555",
    fontFamily: Typography.fontFamily.primary,
    textAlign: "center",
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  button: {
    flex: 1,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    borderRightWidth: 0.5,
    borderRightColor: "#f0f0f0",
  },
  confirmButton: {
    borderLeftWidth: 0.5,
    borderLeftColor: "#f0f0f0",
  },
  cancelText: {
    color: "#777",
    fontSize: 15,
    fontFamily: Typography.fontWeight.medium.primary,
  },
  confirmText: {
    fontSize: 15,
    fontFamily: Typography.fontWeight.bold.primary,
  },
});
