import CustomAlert from "@/components/ui/CustomAlert";
import { Typography } from "@/constants/Typography";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import {
  fetchSectionAttendanceSummary,
  AttendanceSummary,
} from "@/services/attendanceApi";

export default function SectionDetailsScreen() {
  const { branchId, gradeId, sectionId, sectionName, gradeName } =
    useLocalSearchParams();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attendanceData, setAttendanceData] =
    useState<AttendanceSummary | null>(null);
  const [alert, setAlert] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info" as "success" | "error" | "info" | "warning",
  });

  // Fetch attendance data
  const fetchAttendanceData = async () => {
    if (!sectionId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await fetchSectionAttendanceSummary(sectionId as string);
      setAttendanceData(data);
    } catch (err) {
      console.error("Error fetching attendance data:", err);
      setError("Failed to load attendance data. Please try again.");
      showAlert("Error", "Failed to load attendance data", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load data when component mounts
  useEffect(() => {
    fetchAttendanceData();
  }, [sectionId]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchAttendanceData();
  }, [sectionId]);

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

  const sectionDetails = {
    name: sectionName
      ? decodeURIComponent(sectionName as string)
      : `Section ${sectionId}`,
    grade: gradeName
      ? decodeURIComponent(gradeName as string)
      : `Grade ${gradeId}`,
    students: attendanceData?.summary.total_students || 0,
    attendanceStats: {
      present: attendanceData?.summary.present_count || 0,
      absent: attendanceData?.summary.absent_count || 0,
      leave: attendanceData?.summary.leave_count || 0,
      untracked: attendanceData?.summary.untracked_count || 0,
    },
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.backButtonContainer}>
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
            <Text style={styles.title}>
              {sectionDetails.grade} - {sectionDetails.name}
            </Text>
          </View>
          <View style={styles.studentCountBlock}>
            <MaterialCommunityIcons
              name="account-group-outline"
              size={18}
              color="#333"
              style={{ marginRight: 4 }}
            />
            <Text style={styles.studentCount}>
              {sectionDetails.students} Students
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.contentContainer}
        contentContainerStyle={styles.scrollContentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.attendanceStatsCard}>
          <Text style={styles.cardTitle}>Today's Attendance</Text>
          {loading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0B5CB5" />
              <Text style={styles.loadingText}>Loading attendance data...</Text>
            </View>
          ) : error ? (
            <TouchableOpacity
              style={styles.errorContainer}
              onPress={fetchAttendanceData}
            >
              <MaterialCommunityIcons
                name="refresh"
                size={24}
                color="#F44336"
              />
              <Text style={styles.errorText}>{error}</Text>
              <Text style={styles.retryText}>Tap to retry</Text>
            </TouchableOpacity>
          ) : (
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
          )}
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
                `/(teacher)/branches/${branchId}/grades/${gradeId}/sections/${sectionId}/gallery`
              )
            }
          >
            <View
              style={[
                styles.actionIconContainer,
                { backgroundColor: "rgba(255, 7, 90, 0.1)" },
              ]}
            >
              <MaterialCommunityIcons
                name="image-multiple-outline"
                size={24}
                color="rgb(255, 7, 90)"
              />
            </View>
            <Text style={styles.actionTitle}>Gallery</Text>
            <Text style={styles.actionDescription}>
              View and manage class photos
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
  header: {
    padding: 16,
    paddingTop: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontFamily: Typography.fontWeight.semiBold.primary,
    color: "#333",
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
  studentCountBlock: {
    flexDirection: "row",
    alignItems: "center",
  },
  studentCount: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.primary,
    color: "#333",
    marginLeft: 2,
    fontWeight: "500",
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
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    fontFamily: Typography.fontFamily.primary,
    color: "#666",
  },
  errorContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    marginTop: 10,
    fontSize: 14,
    fontFamily: Typography.fontFamily.primary,
    color: "#F44336",
    textAlign: "center",
  },
  retryText: {
    marginTop: 5,
    fontSize: 12,
    fontFamily: Typography.fontFamily.primary,
    color: "#666",
  },
});
