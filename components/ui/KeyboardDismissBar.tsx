import React from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Keyboard,
  Platform,
  InputAccessoryView,
} from "react-native";
import { Typography } from "@/constants/Typography";
import { Ionicons } from "@expo/vector-icons";

interface KeyboardDismissBarProps {
  isVisible?: boolean;
  nativeID?: string;
}

export default function KeyboardDismissBar({
  isVisible = true,
  nativeID = "keyboardDismissBar",
}: KeyboardDismissBarProps) {
  // For iOS, use InputAccessoryView which appears just above the keyboard
  if (Platform.OS === "ios") {
    return (
      <InputAccessoryView nativeID={nativeID}>
        <View style={styles.iosContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              // Use a slight delay to prevent flashing
              setTimeout(() => {
                Keyboard.dismiss();
              }, 50);
            }}
          >
            <Ionicons name="chevron-down" size={18} color="#555" />
            <Text style={styles.buttonText}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      </InputAccessoryView>
    );
  }

  // For Android and other platforms, show a bar at the top of the screen when keyboard is visible
  if (!isVisible) return null;

  return (
    <View style={styles.androidContainer}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          // Use a slight delay to prevent flashing
          setTimeout(() => {
            Keyboard.dismiss();
          }, 50);
        }}
      >
        <Ionicons name="chevron-down" size={18} color="#555" />
        <Text style={styles.buttonText}>Dismiss Keyboard</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  iosContainer: {
    backgroundColor: "#f8f8f8",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 10,
  },
  androidContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    zIndex: 100,
    elevation: 3,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    marginLeft: 4,
    color: "#555",
    fontSize: 15,
    fontFamily: Typography.fontWeight.medium.primary,
  },
});
