import CustomAlert from "@/components/ui/CustomAlert";
import { primary } from "@/constants/Colors";
import { Typography } from "@/constants/Typography";
import { useAuth } from "@/context/AuthContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Redirect, router, Slot, usePathname } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

  // Check if we're on a main screen (not an internal screen)
  const isMainScreen =
    isDashboard ||
    pathname === "/(teacher)/support" ||
    pathname === "/(teacher)/notifications";

  const isHavingHeader =
    pathname.includes("/(teacher)/diary") ||
    pathname.includes("/(teacher)/timetable");

  // Get screen title based on the current path
  const getScreenTitle = () => {
    if (isDashboard) return "Teacher Dashboard";
    if (pathname.includes("/branches") && !pathname.includes("/grades"))
      return "School Branches";
    if (pathname.includes("/grades") && !pathname.includes("/sections"))
      return "Grade Sections";
    if (pathname.includes("/tracker")) return "Attendance Tracker";
    if (pathname.includes("/diary") && !pathname.includes("/add"))
      return "Class Diary";
    if (pathname.includes("/diary/add")) return "Diary Entry";
    if (pathname.includes("/timetable")) return "Class Timetable";
    if (pathname.includes("/support")) return "Support";
    return "Teacher Portal";
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
      {/* Main Header - Only shown on main screens */}
      {isMainScreen && (
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
      )}

      {/* Main Content Area */}
      <View style={styles.contentContainer}>
        {isDashboard ? (
          /* Role Switcher - only shown on dashboard */
          <View style={styles.roleSwitcherContainer}>
            <TouchableOpacity
              style={styles.roleSwitcher}
              onPress={handleSwitchRole}
              activeOpacity={0.7}
            >
              <View style={styles.roleGradient}>
                <View style={styles.roleInfo}>
                  <View style={styles.currentRoleIcon}>
                    <MaterialCommunityIcons
                      name="school"
                      size={14}
                      color="#fff"
                    />
                  </View>
                  <View style={styles.roleSwitcherTextContainer}>
                    <Text style={styles.currentRoleText}>Teacher Mode</Text>
                  </View>
                </View>
                <View style={styles.switchAction}>
                  <Text style={styles.switchToText}>SWITCH TO PARENT</Text>
                  <MaterialCommunityIcons
                    name="arrow-right-circle"
                    size={16}
                    color="#fff"
                    style={styles.arrowIcon}
                  />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        ) : null}

        <View
          style={[
            styles.slotContainer,
            !isMainScreen && styles.internalSlotContainer,
          ]}
        >
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
  roleSwitcherContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  roleSwitcher: {
    width: "100%",
    borderRadius: 8,
    overflow: "hidden",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  roleGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  roleInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  currentRoleIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  roleSwitcherTextContainer: {
    flexDirection: "column",
  },
  currentRoleText: {
    fontSize: 14,
    fontFamily: Typography.fontWeight.semiBold.primary,
    color: "#fff",
  },
  switchAction: {
    flexDirection: "row",
    alignItems: "center",
  },
  switchToText: {
    fontSize: 10,
    fontFamily: Typography.fontWeight.bold.primary,
    color: "rgba(255, 255, 255, 0.9)",
    letterSpacing: 0.5,
    marginRight: 6,
  },
  arrowIcon: {
    opacity: 0.9,
  },
  internalHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
    height: 56,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  internalHeaderGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  internalHeaderButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  internalHeaderText: {
    fontSize: 15,
    marginLeft: 6,
    color: primary,
    fontFamily: Typography.fontWeight.medium.primary,
  },
  internalHeaderTitle: {
    fontSize: 18,
    fontFamily: Typography.fontWeight.semiBold.primary,
    color: "#333",
    marginLeft: 10,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  slotContainer: {
    flex: 1,
  },
  internalSlotContainer: {
    paddingTop: 2, // Add a bit of spacing after the back button
  },
  headerButton: {
    padding: 8,
  },
});
