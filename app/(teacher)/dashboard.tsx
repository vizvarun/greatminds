import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Typography } from "@/constants/Typography";
import { primary } from "@/constants/Colors";
import CustomAlert from "@/components/ui/CustomAlert";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TeacherDashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const [alert, setAlert] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info" as "success" | "error" | "info" | "warning",
  });

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

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

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome, Teacher!</Text>
          <Text style={styles.subtitle}>Manage your classes and students</Text>
        </View>

        <View style={styles.statsSection}>
          <Text style={styles.sectionSubTitle}>Today's Summary</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Classes Today</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>78</Text>
              <Text style={styles.statLabel}>Students</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>5</Text>
              <Text style={styles.statLabel}>Pending Tasks</Text>
            </View>
          </View>
        </View>

        <View style={styles.classSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Schedule</Text>
            <TouchableOpacity onPress={() => router.push("/(teacher)/classes")}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.classCard}>
            <View style={styles.classTimeContainer}>
              <Text style={styles.classTime}>9:00 AM</Text>
              <Text style={styles.classDuration}>90 min</Text>
            </View>
            <View style={styles.classDetails}>
              <Text style={styles.className}>Mathematics - Grade 5</Text>
              <Text style={styles.classRoom}>
                <MaterialCommunityIcons
                  name="map-marker-outline"
                  size={14}
                  color="#666"
                />{" "}
                Room 105
              </Text>
              <View style={styles.classStatsContainer}>
                <Text style={styles.classStats}>
                  <MaterialCommunityIcons
                    name="account-group-outline"
                    size={14}
                    color="#666"
                  />{" "}
                  28 Students
                </Text>
                <Text style={styles.classStats}>
                  <MaterialCommunityIcons
                    name="clipboard-check-outline"
                    size={14}
                    color="#666"
                  />{" "}
                  1 Assignment
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.classActionButton}>
              <MaterialCommunityIcons
                name="chevron-right"
                size={22}
                color={primary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.classCard}>
            <View style={styles.classTimeContainer}>
              <Text style={styles.classTime}>11:00 AM</Text>
              <Text style={styles.classDuration}>90 min</Text>
            </View>
            <View style={styles.classDetails}>
              <Text style={styles.className}>Science - Grade 6</Text>
              <Text style={styles.classRoom}>
                <MaterialCommunityIcons
                  name="map-marker-outline"
                  size={14}
                  color="#666"
                />{" "}
                Lab 2
              </Text>
              <View style={styles.classStatsContainer}>
                <Text style={styles.classStats}>
                  <MaterialCommunityIcons
                    name="account-group-outline"
                    size={14}
                    color="#666"
                  />{" "}
                  32 Students
                </Text>
                <Text style={styles.classStats}>
                  <MaterialCommunityIcons
                    name="clipboard-check-outline"
                    size={14}
                    color="#666"
                  />{" "}
                  2 Assignments
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.classActionButton}>
              <MaterialCommunityIcons
                name="chevron-right"
                size={22}
                color={primary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.classCard}>
            <View style={styles.classTimeContainer}>
              <Text style={styles.classTime}>2:00 PM</Text>
              <Text style={styles.classDuration}>90 min</Text>
            </View>
            <View style={styles.classDetails}>
              <Text style={styles.className}>English - Grade 5</Text>
              <Text style={styles.classRoom}>
                <MaterialCommunityIcons
                  name="map-marker-outline"
                  size={14}
                  color="#666"
                />{" "}
                Room 103
              </Text>
              <View style={styles.classStatsContainer}>
                <Text style={styles.classStats}>
                  <MaterialCommunityIcons
                    name="account-group-outline"
                    size={14}
                    color="#666"
                  />{" "}
                  30 Students
                </Text>
                <Text style={styles.classStats}>
                  <MaterialCommunityIcons
                    name="clipboard-check-outline"
                    size={14}
                    color="#666"
                  />{" "}
                  No Assignments
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.classActionButton}>
              <MaterialCommunityIcons
                name="chevron-right"
                size={22}
                color={primary}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.actionsSection}>
          <Text style={styles.sectionSubTitle}>Quick Actions</Text>
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push("/(teacher)/assignments/create")}
            >
              <MaterialCommunityIcons
                name="clipboard-plus-outline"
                size={22}
                color="#fff"
              />
              <Text style={styles.actionButtonText}>Create Assignment</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push("/(teacher)/classes/attendance")}
            >
              <MaterialCommunityIcons
                name="account-check-outline"
                size={22}
                color="#fff"
              />
              <Text style={styles.actionButtonText}>Take Attendance</Text>
            </TouchableOpacity>
          </View>
        </View>

        <CustomAlert
          visible={alert.visible}
          title={alert.title}
          message={alert.message}
          type={alert.type}
          onConfirm={hideAlert}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  header: {
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  welcomeText: {
    fontSize: 22,
    fontFamily: Typography.fontWeight.bold.primary,
    color: "#333",
  },
  subtitle: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.primary,
    color: "#666",
    marginTop: 4,
  },
  statsSection: {
    marginTop: 15,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: Typography.fontWeight.semiBold.primary,
    color: "#333",
  },
  sectionSubTitle: {
    fontSize: 18,
    fontFamily: Typography.fontWeight.semiBold.primary,
    color: "#333",
    marginBottom: 15,
  },
  seeAllText: {
    fontSize: 14,
    fontFamily: Typography.fontWeight.medium.primary,
    color: primary,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    width: "31%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontFamily: Typography.fontWeight.bold.primary,
    color: primary,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.primary,
    color: "#666",
    textAlign: "center",
  },
  classSection: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  classCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  classTimeContainer: {
    backgroundColor: "rgba(11, 181, 191, 0.1)",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
    width: 70,
  },
  classTime: {
    fontSize: 14,
    fontFamily: Typography.fontWeight.bold.primary,
    color: primary,
    marginBottom: 2,
  },
  classDuration: {
    fontSize: 12,
    fontFamily: Typography.fontWeight.medium.primary,
    color: primary,
  },
  classDetails: {
    flex: 1,
  },
  className: {
    fontSize: 16,
    fontFamily: Typography.fontWeight.semiBold.primary,
    color: "#333",
    marginBottom: 4,
  },
  classRoom: {
    fontSize: 13,
    fontFamily: Typography.fontFamily.primary,
    color: "#666",
    marginBottom: 6,
  },
  classStatsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  classStats: {
    fontSize: 13,
    fontFamily: Typography.fontFamily.primary,
    color: "#666",
  },
  classActionButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 40,
  },
  actionsSection: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    backgroundColor: primary,
    borderRadius: 10,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "48%",
  },
  actionButtonText: {
    color: "#fff",
    marginLeft: 8,
    fontFamily: Typography.fontWeight.medium.primary,
    fontSize: 14,
  },
});
