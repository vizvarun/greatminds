import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Redirect, router, Slot, usePathname } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { primary } from "@/constants/Colors";
import { Typography } from "@/constants/Typography";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ParentLayout() {
  const { isAuthenticated, userRole, isLoading, setUserRole, logout } =
    useAuth();
  const pathname = usePathname();

  // Check if current path is a child details screen or leave application screen
  const isChildDetailsScreen = pathname.includes("/children/details/");
  const isLeaveScreen = pathname.includes("/children/leave/");
  const isAttendanceScreen = pathname.includes("/children/attendance/");
  const isDiaryScreen = pathname.includes("/children/diary/");
  const isTimetableScreen = pathname.includes("/children/timetable/");
  const isSupportScreen = pathname.includes("/children/support/");
  const isPaymentScreen = pathname.includes("/children/fees/");

  const shouldBypassLayout =
    isChildDetailsScreen ||
    isLeaveScreen ||
    isAttendanceScreen ||
    isDiaryScreen ||
    isTimetableScreen ||
    isSupportScreen ||
    isPaymentScreen;

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

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Error logging out:", error);
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
          <Text style={styles.headerTitle}>Parent Dashboard</Text>
        </View>
        <View style={styles.headerRightContainer}>
          <TouchableOpacity style={styles.iconButton}>
            <MaterialCommunityIcons
              name="bell-outline"
              size={24}
              color={primary}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleLogout}>
            <MaterialCommunityIcons name="logout" size={24} color="#e74c3c" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content Area with ScrollView to enable scrolling */}
      <View style={styles.contentContainer}>
        {/* Role Switcher */}
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
            <Text style={styles.switchRoleText}>Switch to Teacher Mode</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={22} color="#999" />
        </TouchableOpacity>

        {/* Content */}
        <View style={styles.slotContainer}>
          <Slot />
        </View>
      </View>
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
  contentContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  slotContainer: {
    flex: 1,
  },
});
