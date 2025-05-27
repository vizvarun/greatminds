import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { primary } from "@/constants/Colors";
import { Typography } from "@/constants/Typography";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import CustomAlert from "@/components/ui/CustomAlert";

export default function RoleSelect() {
  const { setUserRole, isLoading, authError, clearError, userProfile } =
    useAuth();
  const [selectedRole, setSelectedRole] = useState<"parent" | "teacher" | null>(
    null
  );
  const [alert, setAlert] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info" as "success" | "error" | "info" | "warning",
  });

  // Effect to show error messages from auth context
  useEffect(() => {
    if (authError) {
      showAlert("Error", authError, "error");
      clearError();
    }
  }, [authError, clearError]);

  // Auto-redirect logic based on userProfile data
  useEffect(() => {
    if (!userProfile) return;

    // Check for student and school data
    const hasStudents =
      Array.isArray(userProfile.student_ids) &&
      userProfile.student_ids.length > 0;
    const hasSchools =
      Array.isArray(userProfile.school_ids) &&
      userProfile.school_ids.length > 0;

    // If both present, show role select (do nothing)
    // If only students, go to parent dashboard
    if (hasStudents && !hasSchools) {
      setUserRole("parent");
      router.replace("/(parent)/dashboard");
    }
    // If only schools, go to teacher dashboard
    else if (!hasStudents && hasSchools) {
      setUserRole("teacher");
      router.replace("/(teacher)/dashboard");
    }
    // If neither, optionally handle as needed (stay on this screen)
  }, [userProfile, setUserRole]);

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

  const handleRoleSelection = async (role: "parent" | "teacher") => {
    // Set the selected role for UI feedback
    setSelectedRole(role);

    try {
      // Save the user role locally without API call
      await setUserRole(role);

      // Navigate to the appropriate role-specific dashboard
      if (role === "parent") {
        router.replace("/(parent)/dashboard");
      } else {
        router.replace("/(teacher)/dashboard");
      }
    } catch (error) {
      // Show friendly error message
      console.error("Role selection error:", error);
      showAlert(
        "Role Selection Error",
        "Could not set selected role. Please try again.",
        "error"
      );
      setSelectedRole(null); // Reset selection if error occurs
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
            onPress={() => !isLoading && handleRoleSelection("parent")}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            <LinearGradient
              colors={["#4A90E2", "#6A5ACD"]}
              style={[
                styles.roleCard,
                selectedRole === "parent" &&
                  isLoading &&
                  styles.roleCardSelected,
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.roleContent}>
                {selectedRole === "parent" && isLoading ? (
                  <ActivityIndicator size="large" color="#ffffff" />
                ) : (
                  <>
                    <View style={styles.iconContainer}>
                      <MaterialCommunityIcons
                        name="account-child-circle"
                        size={40}
                        color="#FFF"
                      />
                    </View>
                    <Text style={styles.roleName}>Parent</Text>
                    <Text style={styles.roleDescription}>
                      Track progress & stay connected with your child's
                      education
                    </Text>
                  </>
                )}
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.roleOption}
            onPress={() => !isLoading && handleRoleSelection("teacher")}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            <LinearGradient
              colors={["#FF8C00", "#FF5733"]}
              style={[
                styles.roleCard,
                selectedRole === "teacher" &&
                  isLoading &&
                  styles.roleCardSelected,
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.roleContent}>
                {selectedRole === "teacher" && isLoading ? (
                  <ActivityIndicator size="large" color="#ffffff" />
                ) : (
                  <>
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
                  </>
                )}
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <Text style={styles.noteText}>
          You can change your role later from the role switcher in the app.
        </Text>
      </View>

      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onConfirm={hideAlert}
      />
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
  roleCardSelected: {
    opacity: 0.8,
    justifyContent: "center",
    alignItems: "center",
  },
});
