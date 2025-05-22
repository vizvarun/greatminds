import React from "react";
import { StyleSheet, View, Image, ImageBackground } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Typography } from "@/constants/Typography";

export default function ValidateToken() {
  return (
    <ImageBackground
      source={require("@/assets/images/splash-bg.png")}
      style={styles.container}
      resizeMode="cover"
    >
      <StatusBar style="dark" />

      <View style={styles.content}>
        <Image
          source={require("@/assets/images/icon.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingHorizontal: 12,
  },
  logo: {
    width: 300,
    height: 300,
    marginBottom: 30,
  },
  loader: {
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#555",
    textAlign: "center",
  },
  errorText: {
    fontSize: 14,
    fontFamily: Typography.fontWeight.regular.primary,
    color: "#F44336",
    marginTop: 8,
    textAlign: "center",
  },
});
