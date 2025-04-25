import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { primary } from "@/constants/Colors";
import { Typography } from "@/constants/Typography";
import CustomAlert from "@/components/ui/CustomAlert";

export default function Home() {
  const { logout } = useAuth();
  const [alert, setAlert] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info" as "success" | "error" | "info" | "warning",
  });

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

  const handleLogout = () => {
    showAlert("Confirm Logout", "Are you sure you want to log out?", "warning");
  };

  const confirmLogout = async () => {
    try {
      await logout();
      // Ensure state is updated before navigation
      setTimeout(() => {
        router.replace("/(auth)/login");
      }, 100);
    } catch (error) {
      console.error("Logout error:", error);
      showAlert(
        "Logout Error",
        "There was a problem logging out. Please try again.",
        "error"
      );
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome to Great Minds!</Text>
          <Text style={styles.subtitle}>
            Your journey to knowledge starts here
          </Text>
        </View>

        <View style={styles.featuredCard}>
          <Image
            source={require("@/assets/images/onboarding.png")}
            style={styles.featuredImage}
          />
          <Text style={styles.featuredTitle}>Featured Content</Text>
          <Text style={styles.featuredDescription}>
            Explore our curated collection of knowledge and insights
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Categories</Text>
        <View style={styles.categoriesContainer}>
          {["Science", "Technology", "Arts", "Philosophy"].map(
            (category, index) => (
              <TouchableOpacity
                key={index}
                style={styles.categoryCard}
                onPress={() =>
                  showAlert(
                    category,
                    `You selected the ${category} category`,
                    "info"
                  )
                }
              >
                <Text style={styles.categoryText}>{category}</Text>
              </TouchableOpacity>
            )
          )}
        </View>

        <Text style={styles.sectionTitle}>Recent Activities</Text>
        <View style={styles.activitiesContainer}>
          {[
            "Joined the community",
            "Completed onboarding",
            "Profile created",
          ].map((activity, index) => (
            <View key={index} style={styles.activityItem}>
              <View style={styles.activityDot} />
              <Text style={styles.activityText}>{activity}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onConfirm={alert.title === "Confirm Logout" ? confirmLogout : hideAlert}
        cancelText={alert.title === "Confirm Logout" ? "Cancel" : undefined}
        onCancel={alert.title === "Confirm Logout" ? hideAlert : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontFamily: Typography.fontWeight.bold.primary,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    fontFamily: Typography.fontFamily.primary,
    color: "#666",
    marginTop: 5,
  },
  featuredCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  featuredImage: {
    width: "100%",
    height: 180,
    borderRadius: 8,
    marginBottom: 12,
  },
  featuredTitle: {
    fontSize: 18,
    fontFamily: Typography.fontWeight.bold.primary,
    color: "#333",
    marginBottom: 6,
  },
  featuredDescription: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.primary,
    color: "#666",
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: Typography.fontWeight.bold.primary,
    color: "#333",
    marginBottom: 12,
    marginTop: 8,
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  categoryCard: {
    backgroundColor: primary,
    width: "48%",
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
    alignItems: "center",
  },
  categoryText: {
    color: "white",
    fontFamily: Typography.fontWeight.bold.primary,
  },
  activitiesContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: primary,
    marginRight: 10,
  },
  activityText: {
    fontSize: 14,
    color: "#333",
    fontFamily: Typography.fontFamily.primary,
  },
  logoutButton: {
    backgroundColor: "#f8f8f8",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 20,
  },
  logoutText: {
    color: "#e74c3c",
    fontFamily: Typography.fontWeight.bold.primary,
  },
});
