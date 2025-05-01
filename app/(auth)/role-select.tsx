import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { primary } from "@/constants/Colors";
import { Typography } from "@/constants/Typography";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";

export default function RoleSelect() {
  const { setUserRole } = useAuth();

  const handleRoleSelection = async (role: "parent" | "teacher") => {
    try {
      // Save the user role to context and AsyncStorage
      await setUserRole(role);
      console.log(`Selected role: ${role}`);

      // Navigate to the appropriate role-specific dashboard
      if (role === "parent") {
        router.replace("/(parent)/dashboard");
      } else {
        router.replace("/(teacher)/dashboard");
      }
    } catch (error) {
      console.error("Error setting user role:", error);
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        Platform.OS === "android" && styles.androidContainer,
      ]}
    >
      <StatusBar style="dark" />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Role</Text>
          <Text style={styles.subtitle}>
            How would you like to use Great Minds?
          </Text>
        </View>

        <View style={styles.rolesContainer}>
          <TouchableOpacity
            style={styles.roleOption}
            onPress={() => handleRoleSelection("parent")}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#4A90E2", "#6A5ACD"]}
              style={styles.roleCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.roleContent}>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons
                    name="account-child-circle"
                    size={40}
                    color="#FFF"
                  />
                </View>
                <Text style={styles.roleName}>Parent</Text>
                <Text style={styles.roleDescription}>
                  Track progress & stay connected with your child's education
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.roleOption}
            onPress={() => handleRoleSelection("teacher")}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#FF8C00", "#FF5733"]}
              style={styles.roleCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.roleContent}>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons
                    name="school"
                    size={40}
                    color="#FFF"
                  />
                </View>
                <Text style={styles.roleName}>Teacher</Text>
                <Text style={styles.roleDescription}>
                  Manage classes & enhance student learning experience
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <Text style={styles.noteText}>
          You can change your role later from the role switcher in the app.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  androidContainer: {
    paddingTop: 30,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
  },
  header: {
    marginBottom: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontFamily: Typography.fontWeight.bold.primary,
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: Typography.fontFamily.primary,
    color: "#666",
    textAlign: "center",
  },
  rolesContainer: {
    width: "100%",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 24,
    flex: 1,
  },
  roleOption: {
    width: "100%",
    alignItems: "center",
  },
  roleCard: {
    borderRadius: 16,
    width: "100%",
    height: height * 0.22,
    justifyContent: "center",
    padding: 20,
    marginBottom: 8,
  },
  roleContent: {
    alignItems: "flex-start",
  },
  iconContainer: {
    marginBottom: 12,
  },
  roleName: {
    fontSize: 24,
    fontFamily: Typography.fontWeight.bold.primary,
    color: "#FFF",
    marginBottom: 8,
  },
  roleDescription: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.primary,
    color: "#FFF",
    opacity: 0.9,
    maxWidth: "80%",
    lineHeight: 20,
  },
  continueText: {
    fontSize: 16,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#555",
    marginTop: 6,
  },
  noteText: {
    fontSize: 13,
    fontFamily: Typography.fontFamily.primary,
    color: "#888",
    textAlign: "center",
    marginTop: 16,
  },
});
