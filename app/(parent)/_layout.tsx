import CustomAlert from "@/components/ui/CustomAlert";
import { primary } from "@/constants/Colors";
import { Typography } from "@/constants/Typography";
import { useAuth } from "@/context/AuthContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Redirect, router, Slot, usePathname } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ParentLayout() {
  const { isAuthenticated, userRole, isLoading, setUserRole, logout } =
    useAuth();
  const pathname = usePathname();

  const [alert, setAlert] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info" as "success" | "error" | "info" | "warning",
  });

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

  const handleLogout = () => {
    showConfirmLogout();
  };

  // Check if current path is a child details screen or leave application screen
  const isChildDetailsScreen = pathname.includes("/children/details/");
  const isLeaveScreen = pathname.includes("/children/leave/");
  const isAttendanceScreen = pathname.includes("/children/attendance/");
  const isDiaryScreen = pathname.includes("/children/diary/");
  const isTimetableScreen = pathname.includes("/children/timetable/");
  const isSupportScreen = pathname.includes("/children/support/");
  const isPaymentScreen = pathname.includes("/children/fees/");
  const isNotificationScreen = pathname.includes("/notifications");

  // These screens should completely bypass the layout
  const shouldBypassLayout =
    isChildDetailsScreen ||
    isLeaveScreen ||
    isAttendanceScreen ||
    isDiaryScreen ||
    isTimetableScreen ||
    isSupportScreen ||
    isPaymentScreen;

  // Hide role switcher on certain screens but keep the layout
  const hideRoleSwitcher = isNotificationScreen;

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

  // Redirect if user is not a parent
  if (userRole !== "parent") {
    return <Redirect href={`/(auth)/role-select`} />;
  }

  const handleSwitchRole = async () => {
    try {
      await setUserRole("teacher");
      router.replace("/(teacher)/dashboard");
    } catch (error) {
      console.error("Error switching role:", error);
    }
  };

  // For child details view or leave screen, directly render the content
  if (shouldBypassLayout) {
    return <Slot />;
  }

  // For dashboard and other views, show the full layout with header and role switcher
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Custom Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          {isNotificationScreen && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <MaterialCommunityIcons
                name="arrow-left"
                size={24}
                color="#333"
              />
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>
            {isNotificationScreen ? "Notifications" : "Parent Dashboard"}
          </Text>
        </View>
        <View style={styles.headerRightContainer}>
          {!isNotificationScreen && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => router.push("/(parent)/notifications")}
            >
              <MaterialCommunityIcons
                name="bell-outline"
                size={24}
                color={primary}
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.iconButton} onPress={handleLogout}>
            <MaterialCommunityIcons name="logout" size={24} color="#e74c3c" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content Area with ScrollView to enable scrolling */}
      <View style={styles.contentContainer}>
        {/* Role Switcher - only show when not on notification screen */}
        {!hideRoleSwitcher && (
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
                      name="account-child"
                      size={14}
                      color="#fff"
                    />
                  </View>
                  <View style={styles.roleSwitcherTextContainer}>
                    <Text style={styles.currentRoleText}>Parent Mode</Text>
                  </View>
                </View>
                <View style={styles.switchAction}>
                  <Text style={styles.switchToText}>SWITCH TO TEACHER</Text>
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
        )}

        {/* Content */}
        <View style={styles.slotContainer}>
          <Slot />
        </View>
      </View>

      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onConfirm={alert.title === "Confirm Logout" ? confirmLogout : hideAlert}
        cancelText={alert.title === "Confirm Logout" ? "Cancel" : undefined}
        onCancel={alert.title === "Confirm Logout" ? hideAlert : undefined}
        showCancelButton={alert.title === "Confirm Logout"}
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
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: Typography.fontWeight.bold.primary,
    color: "#333",
    fontSize: 20,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerIcon: {
    padding: 8,
    marginLeft: "auto",
    marginRight: 8,
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
    backgroundColor: "#FF9800",
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
  contentContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  slotContainer: {
    flex: 1,
  },
});
