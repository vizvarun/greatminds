import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Redirect, router, Slot, usePathname } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { primary } from "@/constants/Colors";
import { Typography } from "@/constants/Typography";
import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomAlert from "@/components/ui/CustomAlert";

export default function TeacherLayout() {
  const { isAuthenticated, userRole, isLoading, setUserRole, logout } =
    useAuth();
  const pathname = usePathname();
  const [alert, setAlert] = useState({
    visible: false,
    title: "",
    message: "",
    type: "warning" as "success" | "error" | "info" | "warning",
  });

  // Determine if we're on the main dashboard with explicit debugging
  console.log("Current pathname:", pathname);
  const isDashboard =
    pathname === "/(teacher)/dashboard" ||
    pathname === "/(teacher)" ||
    pathname === "/" ||
    pathname === "/dashboard";

  // Get screen title based on the current path
  const getScreenTitle = () => {
    if (isDashboard) return "Teacher Dashboard";
    if (pathname.includes("/branches")) return "School Branches";
    if (pathname.includes("/grades")) return "Grade Sections";
    if (pathname.includes("/tracker")) return "Attendance Tracker";
    if (pathname.includes("/diary")) return "Class Diary";
    if (pathname.includes("/diary/add")) return "Add Diary Entry";
    if (pathname.includes("/timetable")) return "Class Timetable";
    if (pathname.includes("/support")) return "Support";
    return "Teacher Portal";
  };

  const getHeaderRight = () => {
    return (
      <View style={{ flexDirection: "row" }}>
        <TouchableOpacity
          style={[styles.headerButton, { marginRight: 10 }]}
          onPress={() => router.push("/(teacher)/support")}
        >
          <MaterialCommunityIcons name="lifebuoy" size={24} color={primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() =>
            setAlert({
              visible: true,
              title: "Logout",
              message: "Are you sure you want to logout?",
              type: "warning",
            })
          }
        >
          <MaterialCommunityIcons name="logout" size={24} color={primary} />
        </TouchableOpacity>
      </View>
    );
  };

  // Show loading state or redirect if not authenticated
  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  // Redirect to role selection if no role is set
  if (!userRole) {
    return <Redirect href="/(auth)/role-select" />;
  }

  // Redirect if user is not a teacher
  if (userRole !== "teacher") {
    return <Redirect href={`/(auth)/role-select`} />;
  }

  const handleSwitchRole = async () => {
    try {
      await setUserRole("parent");
      router.replace("/(parent)/dashboard");
    } catch (error) {
      console.error("Error switching role:", error);
    }
  };

  const showConfirmLogout = () => {
    setAlert({
      visible: true,
      title: "Confirm Logout",
      message: "Are you sure you want to log out?",
      type: "warning",
    });
  };

  const hideAlert = () => {
    setAlert((prev) => ({ ...prev, visible: false }));
  };

  const confirmLogout = async () => {
    hideAlert();
    try {
      await logout();
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleSupportPress = () => {
    router.push("/(teacher)/support");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Custom Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{getScreenTitle()}</Text>
        </View>
        <View style={styles.headerRightContainer}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push("/(teacher)/notifications")}
          >
            <MaterialCommunityIcons
              name="bell-outline"
              size={24}
              color={primary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleSupportPress}
          >
            <MaterialCommunityIcons
              name="help-circle-outline"
              size={24}
              color={primary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={showConfirmLogout}
          >
            <MaterialCommunityIcons name="logout" size={24} color="#e74c3c" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content Area */}
      <View style={styles.contentContainer}>
        {isDashboard ? (
          /* Role Switcher - only shown on dashboard */
          <TouchableOpacity
            style={styles.roleSwitcher}
            onPress={handleSwitchRole}
          >
            <View style={styles.roleSwitcherContent}>
              <MaterialCommunityIcons
                name="account-switch"
                size={22}
                color={primary}
              />
              <Text style={styles.switchRoleText}>Switch to Parent Mode</Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color="#999"
            />
          </TouchableOpacity>
        ) : (
          /* Internal Screen Header with Back Button */
          <TouchableOpacity
            style={styles.internalHeader}
            onPress={handleGoBack}
          >
            <View style={styles.internalHeaderContent}>
              <MaterialCommunityIcons
                name="arrow-left"
                size={22}
                color={primary}
              />
              <Text style={styles.internalHeaderText}>Go Back</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Content - Render Slot directly without ScrollView */}
        <View style={styles.slotContainer}>
          <Slot />
        </View>
      </View>

      {/* Confirmation Alert */}
      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onConfirm={confirmLogout}
        onCancel={hideAlert}
        showCancelButton={true}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    height: 64,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: Typography.fontWeight.bold.primary,
    color: "#333",
    fontSize: 20,
  },
  headerRightContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    padding: 10,
    marginLeft: 10,
    borderRadius: 20,
    backgroundColor: "#f8f8f8",
  },
  roleSwitcher: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f9f9f9",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
    marginBottom: 8,
  },
  roleSwitcherContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  switchRoleText: {
    fontSize: 15,
    marginLeft: 10,
    color: "#444",
    fontFamily: Typography.fontWeight.medium.primary,
  },
  internalHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
    marginBottom: 8,
  },
  internalHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  internalHeaderText: {
    fontSize: 15,
    marginLeft: 10,
    color: primary,
    fontFamily: Typography.fontWeight.medium.primary,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  slotContainer: {
    flex: 1,
  },
  headerButton: {
    padding: 8,
  },
});
