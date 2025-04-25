import React from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  InputAccessoryView,
  Platform,
  Keyboard,
} from "react-native";
import { Typography } from "@/constants/Typography";

type Props = {
  nativeID: string;
};

export default function KeyboardDismissBar({ nativeID }: Props) {
  // This component is only used on iOS, since Android handles keyboard dismissal differently
  if (Platform.OS !== "ios") return null;

  return (
    <InputAccessoryView nativeID={nativeID}>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            // Use the proper Keyboard API to dismiss the keyboard
            Keyboard.dismiss();
          }}
        >
          <Text style={styles.buttonText}>Dismiss</Text>
        </TouchableOpacity>
      </View>
    </InputAccessoryView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f1f1f1",
    padding: 8,
    flexDirection: "row",
    justifyContent: "flex-end",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  buttonText: {
    color: "#007AFF", // iOS blue
    fontSize: 16,
    fontFamily: Typography.fontWeight.medium.primary,
  },
});
