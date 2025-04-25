import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  View,
  Text,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { Typography } from "@/constants/Typography";

interface KeyboardDismissViewProps {
  isVisible: boolean;
}

export default function KeyboardDismissView({
  isVisible,
}: KeyboardDismissViewProps) {
  if (!isVisible) return null;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => Keyboard.dismiss()}
      activeOpacity={0.8}
    >
      <View style={styles.bar}>
        <Text style={styles.text}>Done</Text>
        <AntDesign name="down" size={16} color="#555" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#f8f9fa",
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
    paddingBottom: 8,
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: 12,
    paddingHorizontal: 16,
    gap: 6,
  },
  text: {
    color: "#555",
    fontSize: 16,
    fontFamily: Typography.fontWeight.medium.primary,
  },
});
