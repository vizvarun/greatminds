import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { primary } from "@/constants/Colors";
import { Typography } from "@/constants/Typography";
import { MaterialCommunityIcons } from "@expo/vector-icons";

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
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <Text style={styles.title}>Choose Your Role</Text>
          <Text style={styles.subtitle}>
            Select how you would like to use the app
          </Text>

          <View style={styles.rolesContainer}>
            <TouchableOpacity
              style={styles.roleCard}
              onPress={() => handleRoleSelection("parent")}
              activeOpacity={0.8}
            >
              <View style={[styles.iconContainer, styles.parentIcon]}>
                <MaterialCommunityIcons
                  name="account-child"
                  size={40}
                  color="#FFF"
                />
              </View>
              <Text style={styles.roleName}>Parent</Text>
              <Text style={styles.roleDescription}>
                Track your child's progress, view assignments, and communicate
                with teachers
              </Text>
              <View style={styles.featuresContainer}>
                <View style={styles.featureItem}>
                  <MaterialCommunityIcons
                    name="notebook-check-outline"
                    size={18}
                    color={primary}
                  />
                  <Text style={styles.featureText}>View child's progress</Text>
                </View>
                <View style={styles.featureItem}>
                  <MaterialCommunityIcons
                    name="calendar-check"
                    size={18}
                    color={primary}
                  />
                  <Text style={styles.featureText}>Track assignments</Text>
                </View>
                <View style={styles.featureItem}>
                  <MaterialCommunityIcons
                    name="message-text-outline"
                    size={18}
                    color={primary}
                  />
                  <Text style={styles.featureText}>Message teachers</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => handleRoleSelection("parent")}
              >
                <Text style={styles.selectButtonText}>Continue as Parent</Text>
              </TouchableOpacity>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.roleCard}
              onPress={() => handleRoleSelection("teacher")}
              activeOpacity={0.8}
            >
              <View style={[styles.iconContainer, styles.teacherIcon]}>
                <MaterialCommunityIcons name="school" size={40} color="#FFF" />
              </View>
              <Text style={styles.roleName}>Teacher</Text>
              <Text style={styles.roleDescription}>
                Manage classes, assign homework, and evaluate student
                performance
              </Text>
              <View style={styles.featuresContainer}>
                <View style={styles.featureItem}>
                  <MaterialCommunityIcons
                    name="account-group-outline"
                    size={18}
                    color={primary}
                  />
                  <Text style={styles.featureText}>Manage classes</Text>
                </View>
                <View style={styles.featureItem}>
                  <MaterialCommunityIcons
                    name="clipboard-text-outline"
                    size={18}
                    color={primary}
                  />
                  <Text style={styles.featureText}>Create assignments</Text>
                </View>
                <View style={styles.featureItem}>
                  <MaterialCommunityIcons
                    name="chart-line"
                    size={18}
                    color={primary}
                  />
                  <Text style={styles.featureText}>Track performances</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => handleRoleSelection("teacher")}
              >
                <Text style={styles.selectButtonText}>Continue as Teacher</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </View>

          <Text style={styles.noteText}>
            Note: You can change your role later from the app menu
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontFamily: Typography.fontWeight.bold.primary,
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: Typography.fontFamily.primary,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  rolesContainer: {
    width: "100%",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 25,
  },
  roleCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#eaeaea",
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  parentIcon: {
    backgroundColor: primary,
  },
  teacherIcon: {
    backgroundColor: "#2196F3",
  },
  roleName: {
    fontSize: 22,
    fontFamily: Typography.fontWeight.bold.primary,
    color: "#333",
    marginBottom: 8,
  },
  roleDescription: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.primary,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  featuresContainer: {
    width: "100%",
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
  },
  featureText: {
    marginLeft: 10,
    fontSize: 14,
    fontFamily: Typography.fontFamily.primary,
    color: "#555",
  },
  selectButton: {
    backgroundColor: primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  selectButtonText: {
    color: "white",
    fontSize: 16,
    fontFamily: Typography.fontWeight.bold.primary,
  },
  noteText: {
    marginTop: 30,
    fontSize: 13,
    fontFamily: Typography.fontFamily.primary,
    color: "#888",
    textAlign: "center",
    fontStyle: "italic",
  },
});
