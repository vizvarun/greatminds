import CustomAlert from "@/components/ui/CustomAlert";
import { Typography } from "@/constants/Typography";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function SectionDetailsScreen() {
  const { branchId, gradeId, sectionId } = useLocalSearchParams();
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

  // Fake data for section details
  const sectionDetails = {
    name: "Section A",
    grade: "Grade 5",
    students: 28,
    attendanceStats: {
      present: 22,
      absent: 3,
      leave: 2,
      untracked: 1,
    },
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.contentContainer}
        contentContainerStyle={styles.scrollContentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>
            {sectionDetails.grade} - {sectionDetails.name}
          </Text>
          <Text style={styles.studentCount}>
            <MaterialCommunityIcons
              name="account-group-outline"
              size={16}
              color="#666"
            />{" "}
            {sectionDetails.students} Students
          </Text>
        </View>

        <View style={styles.attendanceStatsCard}>
          <Text style={styles.cardTitle}>Today's Attendance</Text>
          <View style={styles.statsGrid}>
            <TouchableOpacity
              style={[styles.statBox, styles.presentBox]}
              onPress={() =>
                router.push(
                  `/(teacher)/branches/${branchId}/grades/${gradeId}/sections/${sectionId}/tracker?filter=present`
                )
              }
            >
              <Text style={styles.statCount}>
                {sectionDetails.attendanceStats.present}
              </Text>
              <Text style={styles.statLabel}>Present</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.statBox, styles.absentBox]}
              onPress={() =>
                router.push(
                  `/(teacher)/branches/${branchId}/grades/${gradeId}/sections/${sectionId}/tracker?filter=absent`
                )
              }
            >
              <Text style={styles.statCount}>
                {sectionDetails.attendanceStats.absent}
              </Text>
              <Text style={styles.statLabel}>Absent</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.statBox, styles.leaveBox]}
              onPress={() =>
                router.push(
                  `/(teacher)/branches/${branchId}/grades/${gradeId}/sections/${sectionId}/tracker?filter=leave`
                )
              }
            >
              <Text style={styles.statCount}>
                {sectionDetails.attendanceStats.leave}
              </Text>
              <Text style={styles.statLabel}>On Leave</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.statBox, styles.untrackedBox]}
              onPress={() =>
                router.push(
                  `/(teacher)/branches/${branchId}/grades/${gradeId}/sections/${sectionId}/tracker?filter=untracked`
                )
              }
            >
              <Text style={styles.statCount}>
                {sectionDetails.attendanceStats.untracked}
              </Text>
              <Text style={styles.statLabel}>Untracked</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.actionCardsContainer}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() =>
              router.push(
                `/(teacher)/branches/${branchId}/grades/${gradeId}/sections/${sectionId}/tracker`
              )
            }
          >
            <View
              style={[
                styles.actionIconContainer,
                { backgroundColor: "rgba(76, 175, 80, 0.1)" },
              ]}
            >
              <MaterialCommunityIcons
                name="clipboard-check-outline"
                size={24}
                color="#4CAF50"
              />
            </View>
            <Text style={styles.actionTitle}>Attendance Tracker</Text>
            <Text style={styles.actionDescription}>
              Mark attendance for today's class
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() =>
              router.push(
                `/(teacher)/branches/${branchId}/grades/${gradeId}/sections/${sectionId}/diary`
              )
            }
          >
            <View
              style={[
                styles.actionIconContainer,
                { backgroundColor: "rgba(33, 150, 243, 0.1)" },
              ]}
            >
              <MaterialCommunityIcons
                name="notebook-outline"
                size={24}
                color="#2196F3"
              />
            </View>
            <Text style={styles.actionTitle}>Class Diary</Text>
            <Text style={styles.actionDescription}>
              Manage homework and assignments
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() =>
              router.push(
                `/(teacher)/branches/${branchId}/grades/${gradeId}/sections/${sectionId}/timetable`
              )
            }
          >
            <View
              style={[
                styles.actionIconContainer,
                { backgroundColor: "rgba(255, 152, 0, 0.1)" },
              ]}
            >
              <MaterialCommunityIcons
                name="clock-outline"
                size={24}
                color="#FF9800"
              />
            </View>
            <Text style={styles.actionTitle}>Timetable</Text>
            <Text style={styles.actionDescription}>
              View and manage class schedule
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() =>
              router.push(
                `/(teacher)/support?from=section&branchId=${branchId}&gradeId=${gradeId}&sectionId=${sectionId}`
              )
            }
          >
            <View
              style={[
                styles.actionIconContainer,
                { backgroundColor: "rgba(156, 39, 176, 0.1)" },
              ]}
            >
              <MaterialCommunityIcons
                name="help-circle-outline"
                size={24}
                color="#9C27B0"
              />
            </View>
            <Text style={styles.actionTitle}>Support</Text>
            <Text style={styles.actionDescription}>
              View and respond to inquiries
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onConfirm={hideAlert}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  scrollContentContainer: {
    paddingBottom: Platform.OS === "android" ? 30 : 0,
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: Typography.fontWeight.semiBold.primary,
    color: "#333",
    marginBottom: 8,
  },
  studentCount: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.primary,
    color: "#666",
  },
  attendanceStatsCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: Typography.fontWeight.semiBold.primary,
    color: "#333",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statBox: {
    width: "48%",
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
    alignItems: "center",
  },
  presentBox: {
    backgroundColor: "rgba(76, 175, 80, 0.1)",
  },
  absentBox: {
    backgroundColor: "rgba(244, 67, 54, 0.1)",
  },
  leaveBox: {
    backgroundColor: "rgba(156, 39, 176, 0.1)",
  },
  untrackedBox: {
    backgroundColor: "rgba(158, 158, 158, 0.1)",
  },
  statCount: {
    fontSize: 24,
    fontFamily: Typography.fontWeight.bold.primary,
    color: "#333",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#666",
  },
  actionCardsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    width: "48%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontFamily: Typography.fontWeight.semiBold.primary,
    color: "#333",
    marginBottom: 6,
  },
  actionDescription: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.primary,
    color: "#666",
  },
});
