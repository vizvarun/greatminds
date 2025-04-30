import CustomAlert from "@/components/ui/CustomAlert";
import InitialsAvatar from "@/components/ui/InitialsAvatar";
import { primary } from "@/constants/Colors";
import { Typography } from "@/constants/Typography";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ParentDashboard() {
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

  const navigateToAttendance = (childId: string) => {
    router.push(`/(parent)/children/attendance/${childId}`);
  };

  const navigateToDiary = (childId: string) => {
    router.push(`/(parent)/children/diary/${childId}`);
  };

  const navigateToTimetable = (childId: string) => {
    router.push(`/(parent)/children/timetable/${childId}`);
  };

  // Sample images for demo purposes
  // In a real app, these would likely come from an API
  const studentImages = {
    "Sarah Brandon": "https://randomuser.me/api/portraits/women/17.jpg",
    "Michael Johnson": null, // No image available, will fall back to initials
    "Elizabeth Williamson": "https://randomuser.me/api/portraits/women/54.jpg",
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Your Children</Text>
        <Text style={styles.subtitle}>
          View and manage your children's profiles
        </Text>
      </View>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.childrenSection}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.childrenList}
          >
            <TouchableOpacity
              style={styles.childCard}
              onPress={() => router.push("/(parent)/children/details/1")}
            >
              <InitialsAvatar
                name="Sarah Brandon"
                size={50}
                imageUri={studentImages["Sarah Brandon"]}
              />
              <View style={styles.childInfo}>
                <View style={styles.childHeaderRow}>
                  <Text style={styles.childName}>Sarah Brandon</Text>
                  <View style={styles.attendanceIndicator}>
                    <MaterialCommunityIcons
                      name="calendar-check"
                      size={14}
                      color="#4CAF50"
                    />
                    <Text style={styles.attendanceText}>95%</Text>
                  </View>
                </View>

                <View style={styles.childDetailsRow}>
                  <Text
                    style={styles.childGrade}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    Grade 5-A • Main Campus
                  </Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>Present today</Text>
                  </View>
                </View>

                <View style={styles.quickActionsRow}>
                  <TouchableOpacity
                    style={styles.quickActionButton}
                    onPress={() => navigateToAttendance("1")}
                  >
                    <MaterialCommunityIcons
                      name="clipboard-check-outline"
                      size={18}
                      color={primary}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.quickActionButton}
                    onPress={() => navigateToDiary("1")}
                  >
                    <MaterialCommunityIcons
                      name="notebook-outline"
                      size={18}
                      color={primary}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.quickActionButton}
                    onPress={() => navigateToTimetable("1")}
                  >
                    <MaterialCommunityIcons
                      name="clock-outline"
                      size={18}
                      color={primary}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.quickActionButton, styles.viewDetailsButton]}
                    onPress={() => router.push("/(parent)/children/details/1")}
                  >
                    <Text style={styles.viewDetailsText}>View Details</Text>
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={16}
                      color={primary}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.notificationsContainer}>
                  <View style={styles.notificationItem}>
                    <MaterialCommunityIcons
                      name="bell-ring-outline"
                      size={14}
                      color="#FF9800"
                    />
                    <Text style={styles.notificationText}>
                      Math test tomorrow
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.childCard}
              onPress={() => router.push("/(parent)/children/details/2")}
            >
              <InitialsAvatar
                name="Michael Johnson"
                size={50}
                imageUri={studentImages["Michael Johnson"]}
              />
              <View style={styles.childInfo}>
                <View style={styles.childHeaderRow}>
                  <Text style={styles.childName}>Michael Johnson</Text>
                  <View style={styles.attendanceIndicator}>
                    <MaterialCommunityIcons
                      name="calendar-check"
                      size={14}
                      color="#FF9800"
                    />
                    <Text style={styles.attendanceText}>87%</Text>
                  </View>
                </View>

                <View style={styles.childDetailsRow}>
                  <Text
                    style={styles.childGrade}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    Grade 3-B • East Wing
                  </Text>
                  <View style={[styles.statusBadge, styles.absentBadge]}>
                    <Text style={[styles.statusText, styles.absentText]}>
                      Absent today
                    </Text>
                  </View>
                </View>

                <View style={styles.quickActionsRow}>
                  <TouchableOpacity
                    style={styles.quickActionButton}
                    onPress={() => navigateToAttendance("2")}
                  >
                    <MaterialCommunityIcons
                      name="clipboard-check-outline"
                      size={18}
                      color={primary}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.quickActionButton}
                    onPress={() => navigateToDiary("2")}
                  >
                    <MaterialCommunityIcons
                      name="notebook-outline"
                      size={18}
                      color={primary}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.quickActionButton}
                    onPress={() => navigateToTimetable("2")}
                  >
                    <MaterialCommunityIcons
                      name="clock-outline"
                      size={18}
                      color={primary}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.quickActionButton, styles.viewDetailsButton]}
                    onPress={() => router.push("/(parent)/children/details/2")}
                  >
                    <Text style={styles.viewDetailsText}>View Details</Text>
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={16}
                      color={primary}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.notificationsContainer}>
                  <View style={styles.notificationItem}>
                    <MaterialCommunityIcons
                      name="file-document-outline"
                      size={14}
                      color="#F44336"
                    />
                    <Text style={styles.notificationText}>
                      2 pending assignments
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.childCard}
              onPress={() => router.push("/(parent)/children/details/3")}
            >
              <InitialsAvatar
                name="Elizabeth Williamson"
                size={50}
                imageUri={studentImages["Elizabeth Williamson"]}
              />
              <View style={styles.childInfo}>
                <View style={styles.childHeaderRow}>
                  <Text style={styles.childName}>Elizabeth Williamson</Text>
                  <View style={styles.attendanceIndicator}>
                    <MaterialCommunityIcons
                      name="calendar-check"
                      size={14}
                      color="#4CAF50"
                    />
                    <Text style={styles.attendanceText}>91%</Text>
                  </View>
                </View>

                <View style={styles.childDetailsRow}>
                  <Text
                    style={styles.childGrade}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    Grade 4-C • International School of Excellence and
                    Leadership Academy
                  </Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>Present today</Text>
                  </View>
                </View>

                <View style={styles.quickActionsRow}>
                  <TouchableOpacity
                    style={styles.quickActionButton}
                    onPress={() => navigateToAttendance("3")}
                  >
                    <MaterialCommunityIcons
                      name="clipboard-check-outline"
                      size={18}
                      color={primary}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.quickActionButton}
                    onPress={() => navigateToDiary("3")}
                  >
                    <MaterialCommunityIcons
                      name="notebook-outline"
                      size={18}
                      color={primary}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.quickActionButton}
                    onPress={() => navigateToTimetable("3")}
                  >
                    <MaterialCommunityIcons
                      name="clock-outline"
                      size={18}
                      color={primary}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.quickActionButton, styles.viewDetailsButton]}
                    onPress={() => router.push("/(parent)/children/details/3")}
                  >
                    <Text style={styles.viewDetailsText}>View Details</Text>
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={16}
                      color={primary}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.notificationsContainer}>
                  <View style={styles.notificationItem}>
                    <MaterialCommunityIcons
                      name="map-marker-outline"
                      size={14}
                      color="#2196F3"
                    />
                    <Text style={styles.notificationText}>
                      Field trip next Friday
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <CustomAlert
          visible={alert.visible}
          title={alert.title}
          message={alert.message}
          type={alert.type}
          onConfirm={hideAlert}
        />
      </ScrollView>
    </View>
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
  childrenSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  childrenList: {
    flex: 1,
  },
  childCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  childAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  childInfo: {
    flex: 1,
    paddingHorizontal: 15,
  },
  childName: {
    fontSize: 16,
    fontFamily: Typography.fontWeight.semiBold.primary,
    color: "#333",
  },
  childGrade: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.primary,
    color: "#666",
    flex: 1,
    marginRight: 8,
  },
  addChildCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#ccc",
    height: 120,
  },
  addChildIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(11, 181, 191, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  addChildText: {
    fontSize: 14,
    fontFamily: Typography.fontWeight.semiBold.primary,
    color: "#333",
  },
  childHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  childDetailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  attendanceIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  attendanceText: {
    fontSize: 12,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#333",
    marginLeft: 3,
  },
  statusBadge: {
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  absentBadge: {
    backgroundColor: "rgba(244, 67, 54, 0.1)",
  },
  statusText: {
    fontSize: 10,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#4CAF50",
  },
  absentText: {
    color: "#F44336",
  },
  quickActionsRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  quickActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(11, 181, 191, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  viewDetailsButton: {
    flex: 1,
    width: "auto",
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  viewDetailsText: {
    fontSize: 12,
    fontFamily: Typography.fontWeight.medium.primary,
    color: primary,
  },
  notificationsContainer: {
    marginTop: 4,
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  notificationText: {
    fontSize: 11,
    fontFamily: Typography.fontFamily.primary,
    color: "#666",
    marginLeft: 4,
  },
});
